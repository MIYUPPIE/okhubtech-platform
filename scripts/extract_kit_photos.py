#!/usr/bin/env python3
"""
Pull the eight kit photographs out of the customer catalogue PDF and write them
as masters to assets/kits/<slug>.jpg, ready for scripts/build_media.py.

Why this exists
---------------
The only copy of the kit photography is embedded in
assets/OkhubTech-CUSTOMER-Catalog-2024.pdf (12MB, not tracked). The images in it
are not web-ready as they stand:

  - Every photo sits on a white field with a wide, uneven margin, so the kit
    itself fills less than half the frame.
  - Three of them (Rover Sense, Rover Guard, Ultimate-X) are 5:1 strips of four
    component shots side by side. In a 4:3 card a strip that wide renders as a
    thin ribbon with everything in it too small to read.

So each image is trimmed to its content, a wide strip is split at its white
gutters and re-tiled into a 2x2 grid, and the result is centred on a uniform
4:3 white card. Every kit card on /kits then has the same shape and the kit
fills it.

Deterministic: same PDF in, byte-identical JPEGs out. Re-run it whenever the
catalogue is reissued.

  python3 scripts/extract_kit_photos.py [--pdf path/to/catalogue.pdf]

Requires: pdfimages (poppler-utils), Pillow.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PDF = ROOT / "assets" / "OkhubTech-CUSTOMER-Catalog-2024.pdf"
OUT = ROOT / "assets" / "kits"

# Catalogue order: pdfimages numbers images in the order the PDF draws them,
# which is the order the kits are printed. lib/kits.ts uses the same slugs.
KIT_SLUGS = [
    "ignite-genesis",
    "sentinel-rfid-lab",
    "sensorverse-22",
    "rover-m2",
    "picode-lab",
    "rover-sense-iot",
    "rover-guard-iot",
    "rover-ultimate-x",
]

CARD = (1600, 1200)          # 4:3 master; build_media.py makes the derivatives
PAD = 0.06                   # breathing room around the kit, as a share of the card
WHITE_THRESHOLD = 236        # anything brighter on every channel counts as background
WIDE = 2.4                   # a trimmed image wider than this is a strip to re-tile
MIN_GUTTER = 12              # white gaps narrower than this are noise inside one run of ink
RULE_MAX_PX = 8              # an ink run this thin is a drawn line, not a photograph
RULE_MAX_SHARE = 0.005       # ...or this share of the image width, whichever is larger
SHOT_GAP = 0.5               # a gutter wider than this x strip height separates two shots


def _ink_mask(im: Image.Image) -> Image.Image:
    """1-bit mask: white where the pixel is content, black where it is background."""
    grey = im.convert("RGB")
    bg = Image.new("RGB", grey.size, (255, 255, 255))
    diff = ImageChops.difference(grey, bg).convert("L")
    return diff.point(lambda v: 255 if v > 255 - WHITE_THRESHOLD else 0, mode="1")


def trim(im: Image.Image) -> Image.Image:
    """Crop to the bounding box of non-background pixels."""
    box = _ink_mask(im).getbbox()
    return im.crop(box) if box else im


def _runs(flags: list[bool]) -> list[tuple[int, int]]:
    """Ink runs along one axis, with gaps under MIN_GUTTER folded in."""
    runs: list[tuple[int, int]] = []
    start: int | None = None
    for i, ink in enumerate(flags + [False]):
        if ink and start is None:
            start = i
        elif not ink and start is not None:
            if runs and start - runs[-1][1] < MIN_GUTTER:
                runs[-1] = (runs[-1][0], i)
            else:
                runs.append((start, i))
            start = None
    return runs


def _column_flags(im: Image.Image) -> list[bool]:
    """True where a column holds more ink than a frame line crossing it would.
    A border drawn round the whole photo puts a few pixels of ink in every
    column; counting those as content would make the frame impossible to strip."""
    mask = _ink_mask(im)
    w, h = mask.size
    px = mask.load()
    threshold = RULE_MAX_PX  # samples every 2nd row, so this is 2x rule thickness
    return [sum(1 for y in range(0, h, 2) if px[x, y]) > threshold for x in range(w)]


def _is_rule(run: tuple[int, int], length: int) -> bool:
    """A run this thin is a drawn line (frame or separator), not a photograph."""
    return run[1] - run[0] <= max(RULE_MAX_PX, int(length * RULE_MAX_SHARE))


def strip_rules(im: Image.Image) -> Image.Image:
    """Crop away frame lines on any edge. The catalogue draws a 1-8px border
    round some shots; trim() keeps it because it is ink."""
    for _ in range(2):  # columns, then rows via a transpose
        runs = _runs(_column_flags(im))
        kept = [r for r in runs if not _is_rule(r, im.width)]
        if kept:
            im = im.crop((kept[0][0], 0, kept[-1][1], im.height))
        im = im.transpose(Image.Transpose.TRANSPOSE)
    return trim(im)


def split_columns(im: Image.Image) -> list[Image.Image]:
    """Split a catalogue strip into its separate shots.

    A new shot starts after a separator rule, or after a white gutter wider
    than SHOT_GAP x the strip height. Narrower gaps stay inside one shot: the
    rover photo has its wheels ~50px from the chassis and must not be split
    there. Each piece comes back trimmed."""
    runs = _runs(_column_flags(im))
    groups: list[list[tuple[int, int]]] = []
    after_rule = True
    for run in runs:
        if _is_rule(run, im.width):
            after_rule = True
            continue
        wide_gap = bool(groups) and run[0] - groups[-1][-1][1] > im.height * SHOT_GAP
        if after_rule or wide_gap:
            groups.append([run])
        else:
            groups[-1].append(run)
        after_rule = False

    pieces = [trim(im.crop((g[0][0], 0, g[-1][1], im.height))) for g in groups]
    return pieces or [im]


def tile(pieces: list[Image.Image]) -> Image.Image:
    """Lay pieces out in a 2-column grid, each centred in an equal cell."""
    cols = 2 if len(pieces) > 1 else 1
    rows = -(-len(pieces) // cols)
    cell_w = max(p.width for p in pieces)
    cell_h = max(p.height for p in pieces)
    gap = int(max(cell_w, cell_h) * 0.08)
    sheet = Image.new(
        "RGB",
        (cols * cell_w + (cols - 1) * gap, rows * cell_h + (rows - 1) * gap),
        (255, 255, 255),
    )
    for i, p in enumerate(pieces):
        r, c = divmod(i, cols)
        # A short final row is centred rather than left-aligned.
        in_row = min(cols, len(pieces) - r * cols)
        offset = (cols - in_row) * (cell_w + gap) // 2
        x = offset + c * (cell_w + gap) + (cell_w - p.width) // 2
        y = r * (cell_h + gap) + (cell_h - p.height) // 2
        sheet.paste(p.convert("RGB"), (x, y))
    return sheet


def to_card(im: Image.Image, size: tuple[int, int] = CARD) -> Image.Image:
    """Fit inside the card minus padding, centred on white. Never upscales past
    the source's own resolution by more than the fit requires."""
    cw, ch = size
    inner_w, inner_h = int(cw * (1 - 2 * PAD)), int(ch * (1 - 2 * PAD))
    scale = min(inner_w / im.width, inner_h / im.height)
    fitted = im.convert("RGB").resize(
        (max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS
    )
    card = Image.new("RGB", size, (255, 255, 255))
    card.paste(fitted, ((cw - fitted.width) // 2, (ch - fitted.height) // 2))
    return card


def prepare(im: Image.Image) -> Image.Image:
    """The whole pipeline for one catalogue image."""
    im = strip_rules(trim(im.convert("RGB")))
    if im.width / im.height > WIDE:
        im = tile(split_columns(im))
    return to_card(im)


def main(argv: list[str]) -> int:
    pdf = DEFAULT_PDF
    if "--pdf" in argv:
        pdf = Path(argv[argv.index("--pdf") + 1])
    if not pdf.exists():
        print(f"error: catalogue not found at {pdf}", file=sys.stderr)
        return 1
    if shutil.which("pdfimages") is None:
        print("error: pdfimages not on PATH (sudo apt install poppler-utils)", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdfimages", "-png", str(pdf), f"{tmp}/c"], check=True)
        raw = sorted(Path(tmp).glob("c-*.png"))
        if len(raw) != len(KIT_SLUGS):
            print(f"error: catalogue has {len(raw)} images, expected {len(KIT_SLUGS)}. "
                  "The catalogue layout changed; update KIT_SLUGS.", file=sys.stderr)
            return 1
        for src, slug in zip(raw, KIT_SLUGS):
            dst = OUT / f"{slug}.jpg"
            prepare(Image.open(src)).save(dst, "JPEG", quality=90, optimize=True)
            print(f"  {dst.relative_to(ROOT)}  ({dst.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
