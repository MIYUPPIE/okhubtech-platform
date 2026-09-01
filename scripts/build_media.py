#!/usr/bin/env python3
"""
Turn the raw assets in assets/ into web-ready files in public/media/, and emit a
typed manifest at lib/media.generated.ts.

Why this exists
---------------
public/ is the deployed web root. It held 44MB of raw phone photos (several over
2MB each) and 56MB of social-export videos with spaces and emoji in their
filenames. Every one of those shipped to every visitor at full size, because
`output: 'export'` disables next/image optimisation.

Masters now live in assets/ (never served). This script produces the derivatives
that actually ship:

  photos     -> .webp at 1600w and 640w (a 2.5MB JPEG lands around 70KB)
  portfolio  -> .webp at 1200w
  video      -> muted 640px H.264 loops with +faststart, plus .webp posters
  brand      -> the logo trimmed of its padding, in light and dark variants,
                plus favicon and Open Graph card

The manifest records real pixel dimensions so every <Image> and <video> can set
width/height and reserve its space before the asset loads.

Idempotent: a derivative is rebuilt only when its master is newer.
Requires: Pillow, ffmpeg/ffprobe on PATH.

  python3 scripts/build_media.py [--force] [--check]
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
MEDIA = ROOT / "public" / "media"
MANIFEST_TS = ROOT / "lib" / "media.generated.ts"

# Brand colours, mirroring app/globals.css.
GOLD = (255, 215, 0)
INK = (5, 5, 5)

PHOTO_WIDTHS = {"lg": 1600, "sm": 640}
PORTFOLIO_WIDTH = 1200
VIDEO_WIDTH = 640
VIDEO_CRF = 28
# Marketing B-roll does not need three minutes. Anything longer is trimmed.
VIDEO_MAX_SECONDS = 20

# Schematics, flowcharts and CAD renders are line art on white. Downscaling
# them like a photograph turns thin strokes to mush, so they get a wider
# ceiling and a much higher quality floor, and they are never cropped.
DIAGRAM_WIDTH = 1600
DIAGRAM_QUALITY = 92

# Per-clip overrides. The default strips audio because the class B-roll plays
# as muted background loops; the branded showreel is narrated and is meant to
# be played with sound, in full.
VIDEO_POLICY: dict[str, dict[str, object]] = {
    "okhub-showreel": {"audio": True, "max_seconds": None, "width": 720},
}

# Social share cards. Brand fonts, not a system fallback: DejaVu on a card
# meant to represent the brand on Twitter/LinkedIn/WhatsApp previews would be
# an obviously wrong typeface next to the site's own Space Grotesk headings.
FONT_TITLE = ASSETS / "fonts" / "SpaceGrotesk-Variable.ttf"
FONT_BODY = ASSETS / "fonts" / "Sora-Variable.ttf"
OG_SIZE = (1200, 630)
WHITE = (255, 255, 255)
MUTED = (168, 168, 168)

FORCE = "--force" in sys.argv
CHECK = "--check" in sys.argv


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def slugify(name: str) -> str:
    """Filesystem- and URL-safe slug. Source filenames contain spaces, emoji and
    40-character social-export hashes; none of that belongs in a URL."""
    stem = Path(name).stem
    stem = re.sub(r"[-￿]", "", stem)          # strip emoji / non-ascii
    stem = re.sub(r"[^A-Za-z0-9]+", "-", stem).strip("-").lower()
    stem = re.sub(r"-{2,}", "-", stem)
    return stem[:60] or "asset"


def newer(src: Path, dst: Path) -> bool:
    return FORCE or not dst.exists() or src.stat().st_mtime > dst.stat().st_mtime


def run(cmd: list[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"{cmd[0]} failed:\n{proc.stderr[-2000:]}")


def probe_video(path: Path) -> tuple[int, int, float]:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-show_entries", "format=duration",
         "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    data = json.loads(out)
    stream = data["streams"][0]
    return int(stream["width"]), int(stream["height"]), float(data["format"]["duration"])


# ---------------------------------------------------------------------------
# manifest records
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ImageEntry:
    id: str
    src: str
    width: int
    height: int
    thumb: str | None = None


@dataclass(frozen=True)
class VideoEntry:
    id: str
    src: str
    poster: str
    width: int
    height: int
    duration: float


photos: list[ImageEntry] = []
portfolio: list[ImageEntry] = []
videos: list[VideoEntry] = []
brand: dict[str, ImageEntry] = {}
projects: dict[str, list[ImageEntry]] = {}
docs: list[dict[str, object]] = []


# ---------------------------------------------------------------------------
# brand
# ---------------------------------------------------------------------------

def trim_alpha(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def recolour_for_dark(im: Image.Image) -> Image.Image:
    """The wordmark is black text plus gold accents. On the dark theme the black
    disappears, so lift greys to near-white while leaving anything saturated
    (the gold checker and circuit traces) untouched."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if max(r, g, b) - min(r, g, b) < 40:      # greyscale -> invert
                v = 255 - ((r + g + b) // 3)
                px[x, y] = (v, v, v, a)
    return im


def build_brand() -> None:
    # okhub-1080.png is the same mark at 1080x1080; its ink box is 1039x306
    # against 434x127 in the 500x500 original, so the header logo stays crisp
    # on a 2x display.
    src = ASSETS / "brand" / "okhub-1080.png"
    if not src.exists():
        src = ASSETS / "brand" / "okhub.png"
    out = MEDIA / "brand"
    out.mkdir(parents=True, exist_ok=True)

    master = Image.open(src).convert("RGBA")
    wordmark = trim_alpha(master)

    variants: dict[str, Image.Image] = {
        "wordmark-light": wordmark,
        "wordmark-dark": recolour_for_dark(wordmark.copy()),
    }

    # The circular globe glyph on the left, squared off for use as an icon.
    icon_w = int(wordmark.height * 1.06)
    icon = wordmark.crop((0, 0, min(icon_w, wordmark.width), wordmark.height))
    variants["mark-light"] = icon
    variants["mark-dark"] = recolour_for_dark(icon.copy())

    for name, img in variants.items():
        dst = out / f"okhub-{name}.png"
        img.save(dst, "PNG", optimize=True)
        brand[name] = ImageEntry(
            id=name, src=f"/media/brand/{dst.name}", width=img.width, height=img.height
        )

    # Favicon: the mark on the brand ink, so it reads on any browser chrome.
    fav = Image.new("RGBA", (256, 256), (*INK, 255))
    mark = variants["mark-dark"]
    scale = min(200 / mark.width, 200 / mark.height)
    mark_r = mark.resize((int(mark.width * scale), int(mark.height * scale)), Image.LANCZOS)
    fav.paste(mark_r, ((256 - mark_r.width) // 2, (256 - mark_r.height) // 2), mark_r)
    fav.save(ROOT / "app" / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (256, 256)])

    # Open Graph card: wordmark on ink with a gold rule.
    og = Image.new("RGB", (1200, 630), INK)
    wm = variants["wordmark-dark"]
    scale = min(760 / wm.width, 260 / wm.height)
    wm_r = wm.resize((int(wm.width * scale), int(wm.height * scale)), Image.LANCZOS)
    og.paste(wm_r, ((1200 - wm_r.width) // 2, (630 - wm_r.height) // 2 - 30), wm_r)
    for x in range(420, 780):
        for y in range(430, 434):
            og.putpixel((x, y), GOLD)
    og.save(MEDIA / "brand" / "og-image.png", "PNG", optimize=True)
    brand["og"] = ImageEntry(id="og", src="/media/brand/og-image.png", width=1200, height=630)

    print(f"  brand: {len(variants)} variants + favicon.ico + og-image.png")


# ---------------------------------------------------------------------------
# photos
# ---------------------------------------------------------------------------

def build_images(src_dir: Path, out_dir: Path, url_base: str,
                 widths: dict[str, int], sink: list[ImageEntry]) -> None:
    if not src_dir.exists():
        return
    out_dir.mkdir(parents=True, exist_ok=True)
    for src in sorted(src_dir.iterdir()):
        if src.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        slug = slugify(src.name)
        primary_key = "lg" if "lg" in widths else next(iter(widths))
        entry_src = out_dir / f"{slug}.webp"
        thumb_path: Path | None = out_dir / f"{slug}-sm.webp" if "sm" in widths else None

        im = Image.open(src)
        im = im.convert("RGB") if im.mode in ("CMYK", "P", "L") else im.convert("RGBA" if im.mode == "RGBA" else "RGB")

        target_w = min(widths[primary_key], im.width)
        ratio = target_w / im.width
        size = (target_w, max(1, round(im.height * ratio)))

        if newer(src, entry_src):
            im.resize(size, Image.LANCZOS).convert("RGB").save(
                entry_src, "WEBP", quality=82, method=6
            )
        if thumb_path is not None and newer(src, thumb_path):
            tw = min(widths["sm"], im.width)
            th = max(1, round(im.height * (tw / im.width)))
            im.resize((tw, th), Image.LANCZOS).convert("RGB").save(
                thumb_path, "WEBP", quality=78, method=6
            )

        sink.append(ImageEntry(
            id=slug,
            src=f"{url_base}/{entry_src.name}",
            width=size[0],
            height=size[1],
            thumb=f"{url_base}/{thumb_path.name}" if thumb_path else None,
        ))
    print(f"  {url_base}: {len(sink)} images")


def build_projects() -> None:
    """Engineering artefacts, one folder per project: schematics, flowcharts,
    CAD renders, firmware screenshots, build photos."""
    root = ASSETS / "projects"
    if not root.exists():
        return
    for project_dir in sorted(d for d in root.iterdir() if d.is_dir()):
        slug = slugify(project_dir.name)
        out_dir = MEDIA / "projects" / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        entries: list[ImageEntry] = []

        for src in sorted(project_dir.iterdir()):
            if src.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            name = slugify(src.name)
            dst = out_dir / f"{name}.webp"

            im = Image.open(src)
            # Flatten onto white: these are line drawings saved with alpha, and
            # a transparent background renders as black on the dark theme.
            if im.mode in ("RGBA", "LA", "P"):
                im = im.convert("RGBA")
                flat = Image.new("RGB", im.size, (255, 255, 255))
                flat.paste(im, mask=im.getchannel("A"))
                im = flat
            else:
                im = im.convert("RGB")

            width = min(DIAGRAM_WIDTH, im.width)
            size = (width, max(1, round(im.height * width / im.width)))
            if newer(src, dst):
                im.resize(size, Image.LANCZOS).save(
                    dst, "WEBP", quality=DIAGRAM_QUALITY, method=6
                )
            entries.append(ImageEntry(
                id=name, src=f"/media/projects/{slug}/{dst.name}",
                width=size[0], height=size[1], thumb=None,
            ))

        if entries:
            projects[slug] = entries
    total = sum(len(v) for v in projects.values())
    print(f"  /media/projects: {total} artefacts across {len(projects)} projects")


def build_docs() -> None:
    """PDFs are copied verbatim; there is nothing useful to re-encode."""
    src_dir = ASSETS / "docs"
    if not src_dir.exists():
        return
    out_dir = MEDIA / "docs"
    out_dir.mkdir(parents=True, exist_ok=True)
    for src in sorted(src_dir.glob("*.pdf")):
        dst = out_dir / f"{slugify(src.name)}.pdf"
        if newer(src, dst):
            shutil.copy2(src, dst)
        docs.append({
            "id": slugify(src.name),
            "src": f"/media/docs/{dst.name}",
            "bytes": dst.stat().st_size,
        })
    print(f"  /media/docs: {len(docs)} file(s)")


# ---------------------------------------------------------------------------
# video
# ---------------------------------------------------------------------------

def build_videos() -> None:
    src_dir = ASSETS / "video"
    if not src_dir.exists():
        return
    out_dir = MEDIA / "video"
    out_dir.mkdir(parents=True, exist_ok=True)

    for src in sorted(src_dir.iterdir()):
        if src.suffix.lower() != ".mp4":
            continue
        slug = slugify(src.name)
        mp4 = out_dir / f"{slug}.mp4"
        poster = out_dir / f"{slug}-poster.webp"

        policy = VIDEO_POLICY.get(slug, {})
        keep_audio = bool(policy.get("audio", False))
        max_seconds = policy.get("max_seconds", VIDEO_MAX_SECONDS)
        width = int(policy.get("width", VIDEO_WIDTH))

        if newer(src, mp4):
            # Audio is stripped by default: the class clips play as muted
            # background loops, and dropping the track is most of the size
            # saving. Long clips are trimmed - a 2:42 master encodes to
            # megabytes no visitor watches. VIDEO_POLICY opts specific clips out.
            src_duration = probe_video(src)[2]
            cmd = ["ffmpeg", "-v", "error", "-i", str(src)]
            cmd += ["-c:a", "aac", "-b:a", "128k"] if keep_audio else ["-an"]
            if max_seconds is not None and src_duration > float(max_seconds) * 1.5:
                cmd += ["-t", str(max_seconds)]
            cmd += ["-vf", f"scale={width}:-2",
                    "-c:v", "libx264", "-crf", str(VIDEO_CRF), "-preset", "slow",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    str(mp4), "-y"]
            run(cmd)

        w, h, duration = probe_video(mp4)

        if newer(src, poster):
            # A third of the way in avoids fade-ins and title cards.
            run(["ffmpeg", "-v", "error", "-ss", f"{max(0.3, duration / 3):.2f}",
                 "-i", str(mp4), "-frames:v", "1",
                 "-c:v", "libwebp", "-quality", "80", str(poster), "-y"])

        videos.append(VideoEntry(
            id=slug,
            src=f"/media/video/{mp4.name}",
            poster=f"/media/video/{poster.name}",
            width=w, height=h, duration=round(duration, 2),
        ))
    print(f"  /media/video: {len(videos)} clips")


# ---------------------------------------------------------------------------
# social share cards (Open Graph / Twitter)
# ---------------------------------------------------------------------------
#
# Every page used to inherit the same generic card - share any of the ~40
# routes on WhatsApp, Twitter or LinkedIn and every single one showed the
# homepage's title, description AND image. lib/seo.ts fixes the text half;
# this generates the image half: a real, on-brand 1200x630 card per page
# (or per page category, where 8-12 leaf pages share one topic), built from
# real project photography where it exists and a clean text card otherwise -
# never a stock or AI-generated image standing in for the page.


@dataclass(frozen=True)
class OGCardSpec:
    slug: str
    kicker: str
    title: str
    # Path under public/media/ to a real, already-verified photo. Square or
    # portrait sources are composited into a right-hand panel rather than
    # stretched or cropped to fill the frame, so nothing gets distorted.
    photo: str | None = None


OG_CARDS: list[OGCardSpec] = [
    OGCardSpec("about", "About OKHub", "Training minds. Building solutions."),
    OGCardSpec("services", "Services", "What we build, deployed."),
    OGCardSpec("expertise", "Expertise", "AI, data, web and robotics, in depth."),
    OGCardSpec("portfolio", "Portfolio", "Systems we have shipped."),
    OGCardSpec("products", "Products", "Software OKHub has built."),
    OGCardSpec("bootcamp", "Running now", "4IR Bootcamp", photo="video/students-actuator-class-poster.webp"),
    OGCardSpec("data", "Data & Analytics", "Signals into decisions."),
    OGCardSpec("contact", "Get in touch", "Talk to OKHub."),
    OGCardSpec("studio", "The Studio", "The robotics and training floor."),
    OGCardSpec("portfolio-serving-robot", "Portfolio · Robotics", "Restaurant Serving Robot",
               photo="portfolio/serving-robot.webp"),
    OGCardSpec("portfolio-ai-health-assistant", "Portfolio · Health", "Patient Vitals Monitor",
               photo="projects/health-monitor/02-block-diagram.webp"),
    OGCardSpec("portfolio-hydroponics", "Portfolio · Agriculture", "Hydroponics Automation",
               photo="projects/hydroponics/01-schematic.webp"),
    OGCardSpec("ai", "AI Practice", "Policy-aligned roadmaps to sovereign LLM deployment."),
    OGCardSpec("web", "Web Practice", "Luxury-grade digital products, built for reliability."),
    OGCardSpec("robotics", "Robotics Practice", "Automation for African terrain and industry."),
]


def _font(path: Path, size: int, weight: int) -> ImageFont.FreeTypeFont:
    font = ImageFont.truetype(str(path), size)
    try:
        font.set_variation_by_axes([weight])
    except OSError:
        pass  # static (non-variable) fallback build of the font: weight is fixed
    return font


def _wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont,
          max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textlength(candidate, font=font) <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def _cover_crop(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Resize + centre-crop to exactly `size`, filling it with no distortion."""
    target_w, target_h = size
    scale = max(target_w / im.width, target_h / im.height)
    resized = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    x = (resized.width - target_w) // 2
    y = (resized.height - target_h) // 2
    return resized.crop((x, y, x + target_w, y + target_h))


def _rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def build_og_cards() -> None:
    out = MEDIA / "og"
    out.mkdir(parents=True, exist_ok=True)

    title_font_lg = _font(FONT_TITLE, 64, 700)
    title_font_md = _font(FONT_TITLE, 52, 700)
    kicker_font = _font(FONT_BODY, 24, 600)

    for spec in OG_CARDS:
        dst = out / f"{spec.slug}.png"
        photo_src = (MEDIA / spec.photo) if spec.photo else None
        stale = newer(photo_src, dst) if photo_src else FORCE or not dst.exists()
        if not stale:
            continue

        card = Image.new("RGB", OG_SIZE, INK)
        draw = ImageDraw.Draw(card)

        has_photo = photo_src is not None and photo_src.exists()
        margin = 80
        text_right_edge = 660 if has_photo else OG_SIZE[0] - margin
        text_width = text_right_edge - margin

        # Kicker: small caps label with manual letter-spacing (PIL has no
        # CSS-style tracking) and a short gold rule beneath it, matching the
        # accent treatment already used on okhub-og-image.png.
        y = 150
        x = margin
        tracked = spec.kicker.upper()
        for ch in tracked:
            draw.text((x, y), ch, font=kicker_font, fill=GOLD)
            x += draw.textlength(ch, font=kicker_font) + 3
        draw.rectangle((margin, y + 42, margin + 64, y + 46), fill=GOLD)

        # Title: the biggest font that still wraps to 3 lines or fewer.
        title_font = title_font_lg
        lines = _wrap(draw, spec.title, title_font, text_width)
        if len(lines) > 3:
            title_font = title_font_md
            lines = _wrap(draw, spec.title, title_font, text_width)
        lines = lines[:3]

        line_height = int(title_font.size * 1.18)
        title_y = y + 80
        for line in lines:
            draw.text((margin, title_y), line, font=title_font, fill=WHITE)
            title_y += line_height

        draw.text((margin, OG_SIZE[1] - 70), "okhubtech.com", font=kicker_font, fill=MUTED)

        if has_photo:
            panel = (740, 90, 1120, 540)
            pw, ph = panel[2] - panel[0], panel[3] - panel[1]
            photo = Image.open(photo_src).convert("RGB")
            cropped = _cover_crop(photo, (pw, ph))
            mask = _rounded_mask((pw, ph), 20)
            card.paste(cropped, (panel[0], panel[1]), mask)
            draw.rounded_rectangle(panel, radius=20, outline=GOLD, width=2)
        else:
            # No photo: the globe mark, large and faint, fills the right side
            # rather than leaving it empty.
            mark = brand.get("mark-dark")
            if mark is not None:
                mark_im = Image.open(MEDIA / mark.src.lstrip("/media/")).convert("RGBA")
                scale = 360 / mark_im.height
                mark_im = mark_im.resize(
                    (round(mark_im.width * scale), round(mark_im.height * scale)), Image.LANCZOS
                )
                alpha = mark_im.getchannel("A").point(lambda a: int(a * 0.16))
                mark_im.putalpha(alpha)
                card.paste(
                    mark_im,
                    (OG_SIZE[0] - mark_im.width - 40, (OG_SIZE[1] - mark_im.height) // 2),
                    mark_im,
                )

        card.save(dst, "PNG", optimize=True)

    print(f"  /media/og: {len(OG_CARDS)} share cards")


# ---------------------------------------------------------------------------
# manifest
# ---------------------------------------------------------------------------

TS_HEADER = """// GENERATED by scripts/build_media.py - do not edit.
// Rebuild with `npm run media`. Dimensions are the real pixel sizes of the
// derivatives, so every consumer can reserve layout space before load.

export type MediaId = string;

export type ImageAsset = {
  readonly kind: "image";
  readonly id: MediaId;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** Smaller derivative for grids and thumbnails, when one was generated. */
  readonly thumb: string | null;
};

export type VideoAsset = {
  readonly kind: "video";
  readonly id: MediaId;
  readonly src: string;
  readonly poster: string;
  readonly width: number;
  readonly height: number;
  /** Seconds. */
  readonly duration: number;
};

export type MediaAsset = ImageAsset | VideoAsset;

/** A file offered for download rather than rendered. */
export type DocAsset = {
  readonly id: string;
  readonly src: string;
  readonly bytes: number;
};
"""


def ts_image(e: ImageEntry) -> str:
    thumb = f'"{e.thumb}"' if e.thumb else "null"
    return (f'  {{ kind: "image", id: "{e.id}", src: "{e.src}", '
            f'width: {e.width}, height: {e.height}, thumb: {thumb} }}')


def ts_video(e: VideoEntry) -> str:
    return (f'  {{ kind: "video", id: "{e.id}", src: "{e.src}", poster: "{e.poster}", '
            f'width: {e.width}, height: {e.height}, duration: {e.duration} }}')


def write_manifest() -> None:
    lines = [TS_HEADER]

    lines.append("export const BRAND = {")
    for key, e in brand.items():
        lines.append(f'  "{key}": {{ kind: "image", id: "{e.id}", src: "{e.src}", '
                     f'width: {e.width}, height: {e.height}, thumb: null }},')
    lines.append("} as const satisfies Record<string, ImageAsset>;\n")

    lines.append("export const PHOTOS = [")
    lines.extend(ts_image(e) + "," for e in photos)
    lines.append("] as const satisfies readonly ImageAsset[];\n")

    lines.append("export const PORTFOLIO_IMAGES = [")
    lines.extend(ts_image(e) + "," for e in portfolio)
    lines.append("] as const satisfies readonly ImageAsset[];\n")

    lines.append("export const VIDEOS = [")
    lines.extend(ts_video(e) + "," for e in videos)
    lines.append("] as const satisfies readonly VideoAsset[];\n")

    lines.append("export const PROJECT_MEDIA = {")
    for slug, entries in sorted(projects.items()):
        lines.append(f'  "{slug}": [')
        lines.extend("  " + ts_image(e) + "," for e in entries)
        lines.append("  ],")
    lines.append("} as const satisfies Record<string, readonly ImageAsset[]>;\n")

    lines.append("export const DOCS = [")
    for d in docs:
        lines.append(f'  {{ id: "{d["id"]}", src: "{d["src"]}", bytes: {d["bytes"]} }},')
    lines.append("] as const satisfies readonly DocAsset[];\n")

    lines.append("export type PhotoId = (typeof PHOTOS)[number][\"id\"];")
    lines.append("export type PortfolioImageId = (typeof PORTFOLIO_IMAGES)[number][\"id\"];")
    lines.append("export type VideoId = (typeof VIDEOS)[number][\"id\"];")
    lines.append("export type BrandId = keyof typeof BRAND;")
    lines.append("export type ProjectSlug = keyof typeof PROJECT_MEDIA;")
    lines.append("export type DocId = (typeof DOCS)[number][\"id\"];")

    MANIFEST_TS.write_text("\n".join(lines) + "\n")
    print(f"  manifest: {MANIFEST_TS.relative_to(ROOT)}")


# ---------------------------------------------------------------------------

def main() -> int:
    if not ASSETS.exists():
        print(f"error: {ASSETS.relative_to(ROOT)}/ not found. "
              f"Run scripts/migrate_assets.sh first.", file=sys.stderr)
        return 1

    for tool in ("ffmpeg", "ffprobe"):
        if shutil.which(tool) is None:
            print(f"error: {tool} not on PATH (sudo apt install ffmpeg)", file=sys.stderr)
            return 1

    print("building media derivatives")
    build_brand()
    build_images(ASSETS / "photos", MEDIA / "photos", "/media/photos", PHOTO_WIDTHS, photos)
    build_images(ASSETS / "portfolio", MEDIA / "portfolio", "/media/portfolio",
                 {"lg": PORTFOLIO_WIDTH}, portfolio)
    build_videos()
    build_projects()
    build_docs()
    build_og_cards()
    write_manifest()

    total = sum(f.stat().st_size for f in MEDIA.rglob("*") if f.is_file())
    source = sum(f.stat().st_size for f in ASSETS.rglob("*") if f.is_file())
    print(f"\n  masters {source / 1048576:.1f} MB  ->  shipped {total / 1048576:.1f} MB "
          f"({100 - total / source * 100:.0f}% smaller)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
