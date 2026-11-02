#!/usr/bin/env python3
"""Build the OKHub Secondary School Partnership + Staff Training document.

    python3 docs/secondary-school-partnership/build.py [--school "Name"] [--out path.pdf]
                                                       [--book "/path/Robotics for Everyone latest.pdf"]

Pipeline: prepare images from tracked assets -> render HTML -> headless Chrome
PDF. Fails if any page overflows its A4 box. Intermediate files go to
docs/secondary-school-partnership/build/ (gitignored); the PDF is not committed.
"""
import argparse
import html
import json
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageOps

import content as C

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
BUILD = HERE / "build"
IMG = BUILD / "img"
DEFAULT_BOOK = Path.home() / "Downloads" / "Robotics for Everyone latest.pdf"
CATALOG = ROOT / "assets" / "OkhubTech-CUSTOMER-Catalog-2024.pdf"
FONTS = ROOT / "assets" / "fonts"
DOC_CODE = "OKHUB-EDU-2026-SEC"
REV = "REV. NOVEMBER 2026"

e = html.escape


# ------------------------------------------------------------------ images --
def save_jpg(src: Image.Image, name: str, max_px: int, quality=82):
    im = ImageOps.exif_transpose(src).convert("RGB")
    im.thumbnail((max_px, max_px))
    im.save(IMG / f"{name}.jpg", quality=quality, optimize=True)


def prepare_images(book_pdf: Path):
    if BUILD.exists():
        shutil.rmtree(BUILD)
    IMG.mkdir(parents=True)

    photos = {
        "ph_breadboard": "IMG_20221108_174224", "ph_lasercut": "IMG_20230606_084628",
        "ph_rover_green": "IMG_20230629_151725", "ph_rover_top": "IMG_20230629_151748",
        "ph_rover_front": "IMG_20230629_151806", "ph_rover_side": "IMG_20230629_151827",
        "ph_oled": "IMG_20230703_112603",
    }
    for key, stem in photos.items():
        save_jpg(Image.open(ROOT / "assets" / "photos" / f"{stem}.jpg"), key, 900)

    frames = {  # video -> seconds into the clip
        "fr_actuator": ("students-actuator-class", 0.5),
        "fr_blocks1": ("secondary-arduino-blocks-1", 0.5),
        "fr_blocks3": ("secondary-arduino-blocks-3", 0.5),
        "fr_cv": ("computer-vision-class", 0.5),
        "fr_class": ("school-robotics-class", 0.5),
    }
    for key, (vid, frac) in frames.items():
        mp4 = ROOT / "assets" / "video" / f"{vid}.mp4"
        dur = float(subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp4)]).strip())
        out = IMG / f"{key}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(dur * frac), "-i", str(mp4),
                        "-frames:v", "1", str(out)], check=True)
        save_jpg(Image.open(out), key, 900)
        out.unlink()

    raw = BUILD / "raw"
    raw.mkdir()
    subprocess.run(["pdfimages", "-png", str(CATALOG), str(raw / "c")], check=True)
    for k in C.KITS.values():
        im = Image.open(raw / f"{k['img']}.png").convert("RGB")
        bbox = ImageOps.invert(im.convert("L")).point(lambda v: 255 if v > 40 else 0).getbbox()
        if bbox:  # product shots sit on large white margins: trim them
            im = im.crop(bbox)
        im.thumbnail((1100, 1100))
        im.save(IMG / f"{k['img']}.jpg", quality=85, optimize=True)

    subprocess.run(["pdfimages", "-j", "-f", "1", "-l", "1", str(book_pdf), str(raw / "cover")], check=True)
    save_jpg(Image.open(raw / "cover-000.jpg"), "book_cover", 900, 88)
    shutil.rmtree(raw)


# --------------------------------------------------------------------- html --
CSS = """
@font-face{font-family:'Space Grotesk';src:url('file://%(fonts)s/SpaceGrotesk-Variable.ttf');font-weight:300 700}
:root{--bg:#f6f5ef;--ink:#101010;--mut:#5b5b55;--line:#d9d7cc;--y:#f5c400;--card:#fff;--dk:#0e0e0c}
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
html,body{background:var(--bg);color:var(--ink);font-family:'Space Grotesk',Arial,sans-serif;font-size:10pt;line-height:1.45;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:15mm 16mm 18mm;position:relative;overflow:hidden;page-break-after:always;break-after:page;background:var(--bg)}
.pg:last-child{page-break-after:auto;break-after:auto}
.mono{font-family:'DejaVu Sans Mono',Menlo,monospace;letter-spacing:.06em;text-transform:uppercase;font-size:7pt}
.sec{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.sec .n{background:var(--y);padding:2px 6px;font-weight:700}
.sec .l{color:var(--mut)}
.sec:after{content:"";flex:1;height:1px;background:var(--line)}
h1{font-size:30pt;line-height:1.02;font-weight:700;letter-spacing:-.02em;text-transform:uppercase}
h2{font-size:21pt;line-height:1.05;font-weight:700;letter-spacing:-.015em;text-transform:uppercase;margin-bottom:8px}
h3{font-size:11.5pt;font-weight:700;line-height:1.2;margin-bottom:3px}
p{margin-bottom:6px}
.lead{font-size:10.5pt;color:#2a2a26;max-width:165mm;margin-bottom:10px}
.mut{color:var(--mut)}
.y{background:var(--y);padding:0 4px}
.foot{position:absolute;left:16mm;right:16mm;bottom:8mm;display:flex;justify-content:space-between;color:var(--mut);border-top:1px solid var(--line);padding-top:4px}
.card{background:var(--card);border:1px solid var(--line);padding:9px 11px}
.grid{display:grid;gap:8px}
.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}.g4{grid-template-columns:repeat(4,1fr)}
.tag{display:inline-block;background:var(--y);font-weight:700;padding:1px 5px;margin-bottom:4px}
.tag.o{background:transparent;border:1px solid var(--ink)}
.stat{background:var(--dk);color:#fff;padding:10px 12px;border-left:3px solid var(--y)}
.stat b{display:block;font-size:20pt;line-height:1;color:var(--y);margin-bottom:3px}
.stat span{font-size:8pt;color:#d8d8d0;line-height:1.3;display:block}
.ph{width:100%%;object-fit:cover;display:block;border:1px solid var(--line)}
.cap{margin-top:2px;color:var(--mut)}
table{width:100%%;border-collapse:collapse;font-size:8.6pt}
th{background:var(--dk);color:#fff;text-align:left;padding:4px 6px;font-weight:600}
td{padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top;background:var(--card)}
ul.t{list-style:none}ul.t li{padding-left:11px;position:relative;margin-bottom:2px}
ul.t li:before{content:"";position:absolute;left:0;top:.55em;width:5px;height:5px;background:var(--y)}
.ev{border-top:1px solid var(--line);padding:5px 0;display:grid;grid-template-columns:34px 1fr;gap:6px;font-size:9pt}
.ev .mono{color:var(--mut);padding-top:2px}
sup{font-size:6.5pt;color:#8a6a00;font-weight:700}
.dark{background:var(--dk);color:#fff}
.dark .foot{color:#9b9b92;border-color:#333}
.step{display:grid;grid-template-columns:30px 1fr;gap:8px;padding:7px 0;border-top:1px solid var(--line)}
.step .no{width:26px;height:26px;border:2px solid var(--ink);border-radius:50%%;display:flex;align-items:center;justify-content:center;font-weight:700;background:var(--y)}
.corner{position:absolute;width:12px;height:12px;border-color:var(--y);border-style:solid;border-width:0}
.pill{display:inline-block;border:1px solid var(--ink);padding:0 5px;margin:0 3px 3px 0;font-size:7.5pt}
"""


def foot(n, total, dark=False):
    return (f'<div class="foot mono"><span>OKHub Technology · Secondary Schools Partnership</span>'
            f'<span>{DOC_CODE} · {REV}</span><span>{n:02d} / {total:02d}</span></div>')


def sec(num, label):
    return f'<div class="sec mono"><span class="n">{num}</span><span class="l">{e(label)}</span></div>'


def sup(*refs):
    return "<sup>" + ",".join(str(r) for r in refs) + "</sup>"


def img(name, h, extra=""):
    return f'<img class="ph" style="height:{h}mm;{extra}" src="img/{name}.jpg">'


def page_cover(school):
    who = e(school) if school else '<span style="display:inline-block;width:78mm;border-bottom:1px solid #777">&nbsp;</span>'
    return f"""
<section class="pg dark cover" style="padding:0">
  <img src="img/fr_actuator.jpg" style="position:absolute;right:0;top:0;width:210mm;height:178mm;object-fit:cover;opacity:.55">
  <div style="position:absolute;left:0;top:0;width:210mm;height:178mm;background:linear-gradient(180deg,rgba(14,14,12,.15) 0%,rgba(14,14,12,.95) 100%)"></div>
  <div style="position:absolute;left:16mm;top:15mm" class="mono">DOC {DOC_CODE} / {REV} / PDF EDITION V1</div>
  <div style="position:absolute;left:16mm;top:100mm;right:16mm">
    <div class="mono" style="color:var(--y);margin-bottom:6px">Secondary schools · JSS1 to SS3</div>
    <h1 style="font-size:35pt;color:#fff">Robotics &amp; AI<br>for your school.<br><span style="color:var(--y)">Students and staff.</span></h1>
    <p style="font-size:11pt;color:#e4e4dc;max-width:150mm;margin-top:10px">One partnership with three parts: a working robotics lab for your students,
    a staff training academy built on the book <i>Robotics for Everyone</i>, and tested kits to equip both.
    Taught by the engineers behind Nigeria's 4IR Bootcamp.</p>
  </div>
  <div style="position:absolute;left:16mm;right:16mm;top:187mm;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
    <div class="stat"><b style="font-size:26pt">1</b><span style="font-size:9.5pt">Student lab, run in your timetable, JSS1 to SS3</span></div>
    <div class="stat"><b style="font-size:26pt">3 or 10</b><span style="font-size:9.5pt">Teacher training: a 3-day intensive or a 10-session academy</span></div>
    <div class="stat"><b style="font-size:26pt">8</b><span style="font-size:9.5pt">Catalogue kits, 5% off at 5 or more, 10% off at 10 or more</span></div>
  </div>
  <div style="position:absolute;left:16mm;right:16mm;top:226mm;display:grid;grid-template-columns:1.1fr 1fr;gap:14mm;font-size:9pt">
    <div><div class="mono" style="color:#9b9b92;margin-bottom:5px">Prepared for</div><div style="font-size:12pt;font-weight:600">{who}</div></div>
    <div><div class="mono" style="color:#9b9b92;margin-bottom:5px">Contact</div>{C.CONTACT['email']}<br>{C.CONTACT['phone']}<br>{C.CONTACT['address']}</div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:7mm;background:var(--y)"></div>
</section>"""


def page_summary(n, T):
    return f"""
<section class="pg">{sec('00', 'THE PARTNERSHIP IN ONE PAGE')}
  <h2>One school. Three parts.<br>One system that runs without us.</h2>
  <p class="lead">Most school robotics programmes buy kits and hope. This one trains the people who will teach, equips the room, and
  runs the first terms alongside them until your staff can run it alone. Everything below is built from material OKHub already uses.</p>
  <div class="grid g3" style="margin-bottom:10px">
    <div class="card"><span class="tag">PART 1</span><h3>Student robotics and AI lab</h3>
      <p class="mut">Six working builds, from a dual-mode car to a smart railway crossing, sequenced from JSS1 to SS3. Block coding first, then C/C++, simulation, and on-device AI.</p>
      <p class="mono mut">Pages 4 to 6</p></div>
    <div class="card"><span class="tag">PART 2</span><h3>Staff training academy</h3>
      <p class="mut">Two options: a 3-day intensive to start fast, or ten sessions through all 20 chapters of <i>Robotics for Everyone</i>. Both carry a safety gate and a copy of the book per teacher.</p>
      <p class="mono mut">Pages 7 to 12</p></div>
    <div class="card"><span class="tag">PART 3</span><h3>Tested kits for the lab</h3>
      <p class="mut">Eight catalogue kits mapped to the chapters and class levels they serve, with four ready lab packs and the school discount worked out.</p>
      <p class="mono mut">Pages 13 to 14</p></div>
  </div>
  <div class="grid g2" style="margin-bottom:10px">
    <div class="card"><h3>OKHub provides</h3><ul class="t">
      <li>Curriculum, module sequence and lesson plans for JSS1 to SS3</li>
      <li>An instructor in the room for every student session in Term 1</li>
      <li>Teacher training (3-day or 10 sessions), assessment and a copy of the book per teacher</li>
      <li>Kits from the OKHub catalogue, tested before delivery, with tutorials, code and 1 year of support</li>
      <li>Termly check-ins until your staff lead independently</li></ul></div>
    <div class="card"><h3>The school provides</h3><ul class="t">
      <li>A room with tables, power and storage that locks</li>
      <li>1 to 2 timetable slots a week for the student lab</li>
      <li>Three to six teachers released for the Academy (ICT, Physics, Basic Technology, Maths)</li>
      <li>One named lead teacher and one lab technician</li>
      <li>A school head who attends the leadership briefing</li></ul></div>
  </div>
  <div class="card" style="border-left:3px solid var(--y)"><h3>What changes, and how you will see it</h3>
    <ul class="t"><li><b>Before Term 1:</b> every participating teacher passes the safety gate and builds the sensor projects set for their option.</li>
    <li><b>Term 2:</b> teachers lead sessions with an OKHub instructor beside them. Students hold working builds from Modules 1 to 3.</li>
    <li><b>Term 3:</b> your teachers run the lab. A demo day shows all six modules and the school decides on a competition entry.</li></ul>
    <p class="mut" style="margin:4px 0 0">These are proposed targets. They are fixed in writing in your school's proposal.</p></div>
  {foot(n, T)}
</section>"""


def page_why(n, T):
    ev = [
        ("EV-01", "China made AI a compulsory subject for every primary and secondary student from September 2025, starting at age six, with a national target of full rollout by 2030.", (5,)),
        ("EV-02", "India's Ministry of Education made AI and computational thinking mandatory from Class 3 onward, inside the national curriculum.", (6,)),
        ("EV-03", "UNESCO published AI competency frameworks for students (12 competencies, four dimensions) and teachers (five domains, from ethics to classroom pedagogy).", (7, 8)),
        ("EV-04", "Nigeria published its National AI Strategy in September 2025, a five-year plan (2025 to 2029) run by the Federal Ministry of Communications, Innovation and Digital Economy with NITDA.", (1,)),
        ("EV-05", "The 3MTT programme has trained over 135,000 Nigerians with a 99.6% assessment completion rate and a presence in all 774 local government areas.", (2, 3)),
        ("EV-06", "Nigerian secondary students already compete globally. Four students from Federal Government College, Kaduna, entered the 2025 FIRST LEGO League Global Championship in California. Nigerian teams reached the 2025 Robotics for Good Youth Challenge finale at the UN.", (9, 10)),
    ]
    rows = "".join(f'<div class="ev"><span class="mono">{a}</span><span>{b}{sup(*r)}</span></div>' for a, b, r in ev)
    return f"""
<section class="pg">{sec('01', 'WHY NOW')}
  <h2>The classroom moved.<br>Most timetables haven't.</h2>
  <p class="lead">Robotics and AI went from elective to national policy faster than most schools could adjust. The facts below are cited, not projected by us.
  They also point at the gap this partnership closes: students are ready to build, and teachers are rarely trained to lead it.</p>
  <div class="grid g4" style="margin-bottom:12px">
    <div class="stat"><b>78M</b><span>net new jobs worldwide by 2030, on top of 92M displaced{sup(4)}</span></div>
    <div class="stat"><b>58%</b><span>of employers call robotics and automation transformative{sup(4)}</span></div>
    <div class="stat"><b>135K+</b><span>Nigerians trained through 3MTT{sup(2)}</span></div>
    <div class="stat"><b>99.6%</b><span>3MTT assessment completion rate{sup(3)}</span></div>
  </div>
  {rows}
  <div class="card" style="margin-top:10px;border-left:3px solid var(--y)"><h3>The gap for secondary schools</h3>
  <p style="margin:0">A school can buy kits in a week. It cannot buy a teacher who has built the project, broken it, and fixed it. That is why this partnership puts staff training next to the student lab,
  and why UNESCO's teacher framework is the reference for the Academy.{sup(8)}</p></div>
  {foot(n, T)}
</section>"""


def page_proof(n, T):
    def f(name, cap, h=44):
        return f'<div>{img(name, h)}<div class="cap mono">{e(cap)}</div></div>'
    return f"""
<section class="pg">{sec('02', 'PROOF, NOT PROMISES')}
  <h2>Unstaged. From our own<br>classroom and bench.</h2>
  <p class="lead">File-dated originals from OKHub class sessions and the 4IR Bootcamp. No stock photography and no renders standing in for a lab that does not exist.</p>
  <div class="grid g3" style="margin-bottom:8px">
    {f('fr_actuator', 'Students wiring an actuator build', 62)}
    {f('fr_blocks1', 'Block code compiled to an Arduino', 62)}
    {f('fr_cv', 'Computer vision class, live detection', 62)}
  </div>
  <div class="grid g4">
    {f('ph_rover_green', 'Rover chassis, indicator LEDs live', 40)}
    {f('ph_lasercut', 'Laser-cut chassis before assembly', 40)}
    {f('ph_rover_front', 'Ultrasonic front, servo bracket', 40)}
    {f('ph_oled', 'OLED running an on-device AI answer', 40)}
  </div>
  <div class="grid g2" style="margin-top:10px">
    <div class="card"><h3>Block programming first</h3><p class="mut" style="margin:0">JSS students drive real Arduino hardware from a block editor before they write a line of text code. The code in the photo above is compiled straight to the board on the desk.</p></div>
    <div class="card"><h3>Same engineers, same week</h3><p class="mut" style="margin:0">The people who teach your students and staff also ship client work: edge-AI vision on CCTV, sign-language translation, speech-emotion detection and precision agriculture.</p></div>
  </div>
  {foot(n, T)}
</section>"""


def page_builds(n, T):
    mods = [
        ("MOD-01", "Dual-Mode Robotic Car", "ESP32-S3", "Drive it yourself or let it drive itself.", "Manual and autonomous modes, obstacle detection and avoidance"),
        ("MOD-02", "Obstacle-Avoidance Robot", "Arduino", "Senses what is ahead and chooses a direction.", "Obstacle detection, direction decision-making"),
        ("MOD-03", "Smart Classroom Automation", "", "A room that reacts to its own conditions.", "Temperature and humidity monitoring, automatic fan, door on a limit switch"),
        ("MOD-04", "Deaf-Blind Communication and Obstacle Alert", "", "Assistive hardware that reports obstacles by touch.", "Tactile feedback, obstacle identification"),
        ("MOD-05", "Smart Water Pump", "", "Knows when the tank is full and stops.", "Water-level sensing, automatic cut-off"),
        ("MOD-06", "Smart Railway Crossing Safety", "", "Feels the train coming and closes itself down.", "Train vibration detection, barrier and warning control, junction lights"),
    ]
    cards = "".join(
        f'<div class="card"><span class="tag mono">{a}</span> <span class="mono mut">{e(d)}</span><h3 style="margin-top:3px">{e(b)}</h3>'
        f'<p class="mut" style="margin-bottom:3px">{e(c)}</p><p style="font-size:8.3pt;margin:0">{e(f)}</p></div>'
        for a, b, d, c, f in mods)
    tools = [
        ("Block programming", "JSS1-JSS2", "Drag-and-block editor drives real Arduino hardware before text code."),
        ("Tinkercad and Wokwi", "JSS2-JSS3", "Simulate circuits and ESP32 projects before anything is wired. Both are taught in the book."),
        ("Laser-cut and 3D-printed CAD", "JSS3", "A chassis is drawn first, then cut. CAD file before the physical part."),
        ("Arduino and ESP32 firmware", "JSS3+", "C/C++ for motor drivers, sensor arrays and Wi-Fi boards."),
        ("Webots", "SS1-SS2", "Obstacle-avoidance logic proven in simulation, then run on the real build. Covered in Chapter 18."),
        ("On-device AI", "SS2-SS3", "Vision and language models running on the hardware itself, not a cloud API."),
    ]
    tl = "".join(f'<div class="card" style="padding:7px 9px"><b>{a}</b> <span class="mono mut">{b}</span><br><span class="mut" style="font-size:8.3pt">{c}</span></div>' for a, b, c in tools)
    return f"""
<section class="pg">{sec('03', 'WHAT STUDENTS BUILD')}
  <h2>Six working systems.<br>Not six worksheets.</h2>
  <p class="lead">The module list below is the one OKHub runs in its current 4IR Bootcamp cohort. Your timetable gets the same list. Every module ends with a wired, running system.</p>
  <div class="grid g2" style="margin-bottom:12px">{cards}</div>
  <h3 style="margin-bottom:6px">Tools by stage</h3>
  <div class="grid g2">{tl}</div>
  {foot(n, T)}
</section>"""


def page_pathway(n, T):
    st = [
        ("1", "Foundations", "JSS1-JSS2", "Circuits, sensors and logic on a breadboard through block programming. No soldering iron yet.", "Ch. 4 to 6", "Ignite Genesis"),
        ("2", "Builders", "JSS3", "CAD in Tinkercad, laser-cut chassis, assembly and wiring of a first rolling chassis.", "Ch. 2, 12, 13", "Rover M2, Sensorverse 22"),
        ("3", "Systems", "SS1-SS2", "The six capstone modules: sensing, decisions, actuation, closed loop. Proven in Webots, then built.", "Ch. 7 to 11, 18", "Sentinel RFID Lab, PiCode Lab"),
        ("4", "AI Integration", "SS2-SS3", "On-device vision, voice and language: the serving robot's path.", "Ch. 15, 17", "Rover Sense IoT, Rover Ultimate-X"),
        ("5", "Competition and portfolio", "Any stage past 3", "WRO and FIRST LEGO League style entry. A published build and a CV line that is real.", "Ch. 20", "Any lab kit"),
    ]
    rows = "".join(
        f'<div class="step"><div class="no">{a}</div><div><div><b style="font-size:11pt">{b}</b> <span class="mono mut">{c}</span></div>'
        f'<div style="margin:2px 0 3px">{e(d)}</div>'
        f'<span class="pill">Book: {f}</span><span class="pill">Kit: {g}</span></div></div>'
        for a, b, c, d, f, g in st)
    return f"""
<section class="pg">{sec('04', 'THE LEARNING PATHWAY')}
  <h2>JSS1 to SS3, mapped to<br>the book and to the kits.</h2>
  <p class="lead">Each stage names the chapters teachers use to prepare and the kit students hold. A school can enter at any stage. A student can exit into competition or portfolio work at any point past Stage 3.</p>
  {rows}
  <div class="card" style="margin-top:10px;border-left:3px solid var(--y)"><h3>Why the same book serves both rooms</h3>
  <p style="margin:0">Teachers work through <i>Robotics for Everyone</i> in the Academy. Students then meet the same projects in the same order, with the teacher's own wiring photos, mistakes and fixes behind every lesson.
  The chapter review questions and the answer key give each stage a ready assessment.</p></div>
  {foot(n, T)}
</section>"""


def page_staff(n, T):
    return f"""
<section class="pg">{sec('05', 'STAFF TRAINING')}
  <h2>Train the teachers first.<br>The programme outlives us.</h2>
  <p class="lead">A lab run by visiting instructors stops when they leave. Teacher training puts the capability in your building: teachers who have built each project themselves, passed a safety gate, and led a class with support.</p>
  <div class="grid g3" style="margin-bottom:10px">
    <div class="card"><span class="tag">TRACK A</span><h3>Leadership briefing</h3><p class="mut">Half day for the principal and heads of department. Lab layout, safety policy, timetable, budget, and how to read the termly evidence.</p></div>
    <div class="card"><span class="tag">TRACK B</span><h3>Teacher training</h3><p class="mut">The core, in two options: a 3-day intensive or a ten-session academy. Three to six teachers, using the book. Compared on page 9.</p></div>
    <div class="card"><span class="tag">TRACK C</span><h3>Lab technician and safety</h3><p class="mut">Two sessions: battery handling and charging, soldering rules, kit audit and repair, storage. Built from the book's Safety Notes and Chapter 19.</p></div>
  </div>
  <h3 style="margin-bottom:6px">The handover ladder: observe, co-teach, lead</h3>
  <div class="grid g3" style="margin-bottom:10px">
    <div class="card"><span class="tag o mono">TERM 1</span><h3>Observe</h3><p class="mut" style="margin:0">OKHub teaches the student lab. Teachers sit in, run a bench each, and finish their training in the holiday block before or in the first weeks.</p></div>
    <div class="card"><span class="tag o mono">TERM 2</span><h3>Co-teach</h3><p class="mut" style="margin:0">Teachers lead and an OKHub instructor stands beside them. Practical assessment happens here, in front of a real class.</p></div>
    <div class="card"><span class="tag o mono">TERM 3</span><h3>Lead</h3><p class="mut" style="margin:0">Teachers run the lab. OKHub visits for check-ins, reviews student builds, and supports the demo day.</p></div>
  </div>
  <h3 style="margin-bottom:6px">Who should attend</h3>
  <p class="mut">Teachers of ICT or Computer Studies, Physics, Basic Technology and Mathematics fit best. No prior electronics or programming is needed. The book is written for complete beginners.</p>
  <div class="grid g2">
    <div class="card"><h3>Each teacher leaves with</h3><ul class="t"><li>A copy of <i>Robotics for Everyone</i></li><li>Sensor projects built: 6 in the 3-day option, all 18 in the Academy</li><li>A wheeled robot built, plus a camera robot in the Academy</li><li>A signed-off safety routine</li><li>A term teaching plan</li></ul></div>
    <div class="card"><h3>The school leaves with</h3><ul class="t"><li>Named lab lead and trained technician</li><li>Safety policy and kit audit sheet</li><li>Assessment records per teacher</li><li>A path to run a second cohort in-house</li><li>A teaching team that can enter a competition</li></ul></div>
  </div>
  {foot(n, T)}
</section>"""


def page_book(n, T):
    parts = [
        ("One", "Foundations", "Ch. 1 to 3"), ("Two", "Electronics and Code", "Ch. 4 to 6"),
        ("Three", "Sensors and Perception", "Ch. 7 to 9"), ("Four", "Making Things Move", "Ch. 10 to 12"),
        ("Five", "Building Real Robots", "Ch. 13 to 15"), ("Six", "Modern Robotics", "Ch. 16 to 18"),
        ("Seven", "Responsibility and Next Steps", "Ch. 19 to 20"),
    ]
    pr = "".join(f'<tr><td><b>Part {a}</b></td><td>{b}</td><td class="mono">{c}</td></tr>' for a, b, c in parts)
    return f"""
<section class="pg">{sec('06', 'THE TEXTBOOK')}
  <div style="display:grid;grid-template-columns:62mm 1fr;gap:10mm">
    <div><img src="img/book_cover.jpg" style="width:62mm;display:block;box-shadow:0 3px 10px rgba(0,0,0,.25)">
      <p class="mono mut" style="margin-top:6px">{C.BOOK['pages']} pages · {C.BOOK['chapters']} chapters · {C.BOOK['projects']} projects</p></div>
    <div><h2 style="margin-top:0">Robotics for Everyone.<br>A practical guide for beginners.</h2>
      <p class="lead" style="margin-bottom:6px">By {C.BOOK['author']}, founder of OKHub Technology. Written for people with no degree and no programming background, then tested on real beginners with simple kits.</p>
      <ul class="t">
        <li>Uses both the <b>Arduino Uno</b> and the <b>ESP32</b>, in C, C++ and Python</li>
        <li><b>18 hands-on sensor projects</b> across Chapters 7 to 9</li>
        <li>Feedback and <b>PID control</b>, then complete builds: wheeled robots, a walking hexapod, robots that see</li>
        <li><b>ROS 2</b>, Physical AI, language models on robots, and simulation with Wokwi, Tinkercad and Webots</li>
        <li>A review after every chapter: summary, key terms, multiple choice, short answers and a hands-on challenge, with an <b>answer key</b></li>
        <li><b>In Nigeria</b> boxes on studying robotics, buying parts, the Nigeria Data Protection Act 2023 and local opportunities</li>
      </ul></div>
  </div>
  <h3 style="margin:12px 0 6px">How the book is built</h3>
  <table><tr><th>Part</th><th>Title</th><th>Chapters</th></tr>{pr}</table>
  <div class="grid g2" style="margin-top:10px">
    <div class="card"><h3>For staff</h3><p class="mut" style="margin:0">The Academy follows the book in order. Teachers type the code themselves, fix their own mistakes, and use the Safety Notes and the Troubleshooting chapter as bench references.</p></div>
    <div class="card"><h3>For students</h3><p class="mut" style="margin:0">Reading plus the matching project. Teachers set a chapter, students build it, and the chapter review gives an assessment mark without extra marking design.</p></div>
  </div>
  <p class="mut" style="margin-top:8px;font-size:8.3pt">The book's copyright page permits brief quotation in reviews and use for classroom teaching.</p>
  {foot(n, T)}
</section>"""


def page_options(n, T):
    t, a = C.THREE_DAY_KITS, C.ACADEMY_KITS

    def row(label, x, y):
        return f'<tr><td class="mono"><b>{label}</b></td><td>{x}</td><td>{y}</td></tr>'
    rows = "".join([
        row("Format", "3 consecutive days, 6 contact hours a day", "10 sessions of 3 hours, as a 2-week holiday block or 10 weekly sessions"),
        row("Contact hours", "18", "30"),
        row("Best for", "A fast start. Tight calendar. Seeing the programme before committing further.", "Teachers who will lead SS2 and SS3 AI work, and a school that wants depth before Term 1."),
        row("Chapters covered", "16 of 20 in the room. Chapters 15 and 17 by self-study. Chapters 14 and 16 optional.", "All 20: 18 in the core sessions, 14 and 16 as optional modules."),
        row("Sensor projects", "6 of 18 in the room, the other 12 by end of Term 1", "All 18 in the room"),
        row("Robots built", "One wheeled robot", "Wheeled robot, ESP32-CAM robot, simulation, language-model link"),
        row("Signed off in the room", "Gate 1 safety, Gate 2 knowledge", "Gate 1 safety, Gate 2 knowledge"),
        row("Gate 3 practical", "Term 1 or 2, with trainer observing", "Term 1 or 2, with trainer observing"),
        row("Kit for 6 teachers", f"3 Ignite Genesis + 3 Rover M2 with UNO: {C.naira(t['net'])} after the 5% school rate", f"3 Rover Ultimate-X: {C.naira(a['net'])}"),
        row("Fee", "Quoted in your proposal", "Quoted in your proposal"),
    ])
    return f"""
<section class="pg">{sec('07', 'TEACHER TRAINING: YOUR OPTIONS')}
  <h2>Two ways to train your staff.<br>Pick one, or do both in order.</h2>
  <p class="lead">Both options use <i>Robotics for Everyone</i>, both end with a copy of the book per teacher, and both pass through the same safety gate. They differ in depth and in how soon your lab can start.</p>
  <div class="grid g2" style="margin-bottom:10px">
    <div class="card" style="border-top:3px solid var(--y)"><span class="tag">OPTION 1</span><h3 style="font-size:14pt">3-Day Teacher Intensive</h3>
      <p class="mut" style="margin:0">Three focused days at your school or at OKHub, Mokola. Teachers leave safe, wired and able to run the first student sessions.</p></div>
    <div class="card" style="border-top:3px solid var(--ink)"><span class="tag o">OPTION 2</span><h3 style="font-size:14pt">Teacher Academy</h3>
      <p class="mut" style="margin:0">Ten three-hour sessions across all 20 chapters. Teachers leave able to lead the full JSS1 to SS3 pathway, including vision and AI.</p></div>
  </div>
  <table><tr><th style="width:27mm"></th><th>Option 1: 3-Day Intensive</th><th>Option 2: Academy</th></tr>{rows}</table>
  <div class="card" style="margin-top:10px;border-left:3px solid var(--y)"><h3>Our recommendation</h3>
  <p style="margin:0"><b>Start with Option 1, then add Academy sessions in Term 1.</b> Teachers are productive in three days and your lab opens on time. The remaining chapters are taught in the weeks that follow, on the same kits, while teachers are already in front of students. Choose Option 2 straight away if you plan an SS2 and SS3 AI club in the first term.</p></div>
  {foot(n, T)}
</section>"""


def page_threeday(n, T):
    cols = ""
    for d in C.THREE_DAY:
        rows = "".join(
            f'<div style="border-top:1px solid var(--line);padding:5px 0"><span class="mono mut">{tm} · {h:g} h</span><br>{e(what)}'
            + (f'<br><span class="pill" style="margin-top:2px">{", ".join("Ch. %d" % c for c in ch)}</span>' if ch else '')
            + '</div>' for tm, h, what, ch in d["blocks"])
        hrs = sum(b[1] for b in d["blocks"])
        cols += (f'<div class="card" style="padding:0"><div style="background:var(--dk);color:#fff;padding:7px 10px"><span class="mono" style="color:var(--y)">Day {d["day"]} · {hrs:g} hours</span>'
                 f'<h3 style="margin:2px 0 0;font-size:11.5pt">{e(d["title"])}</h3></div><div style="padding:2px 10px 8px;font-size:8.8pt">{rows}</div></div>')
    after = C.THREE_DAY_AFTER
    return f"""
<section class="pg">{sec('08', 'OPTION 1: THE 3-DAY INTENSIVE')}
  <h2>Three days. Safe, wired,<br>and ready to teach.</h2>
  <p class="lead">Eighteen contact hours for three to six teachers, with two teachers sharing each kit set. Each day ends with something that works, and each day maps to chapters of the book.</p>
  <div class="grid g3" style="margin-bottom:10px;align-items:start">{cols}</div>
  <div class="grid g2">
    <div class="card"><h3>By the end of day 3 each teacher has</h3><ul class="t"><li>Passed the safety gate and the knowledge check</li><li>Built six sensor and display projects and one wheeled robot</li><li>Taught a 10-minute segment and had feedback</li><li>A copy of the book and a written term plan</li></ul></div>
    <div class="card"><h3>After the three days</h3><p class="mut" style="margin-bottom:3px">{e(after['note'])}.</p><p class="mut" style="margin:0">The practical teaching assessment (Gate 3) happens in Term 1 or 2 with a trainer observing.</p></div>
  </div>
  <p class="mut" style="margin-top:6px;font-size:8.3pt">Programme is indicative and is fitted to your calendar. Times assume a 09:00 start with lunch and short breaks.</p>
  {foot(n, T)}
</section>"""


def page_academy(n, T):
    names = dict(C.CHAPTERS)
    rows = "".join(
        f'<tr><td class="mono"><b>S{s["n"]:02d}</b></td><td><b>{e(s["title"])}</b><br><span class="mut">{e(s["do"])}</span></td>'
        f'<td>{", ".join("Ch. %d" % c for c in s["chapters"])}</td><td>{e(s["leave"])}</td></tr>' for s in C.SESSIONS)
    opt = "".join(f'<span class="pill">Ch. {o["chapter"]}: {e(o["note"])}</span>' for o in C.OPTIONAL)
    return f"""
<section class="pg">{sec('09', 'OPTION 2: TEACHER ACADEMY')}
  <h2>Option 2: the Academy.<br>Ten sessions, every chapter.</h2>
  <p class="lead">Each session is three hours: one hour of explanation and two hours at the bench. Delivered as a two-week holiday block or ten weekly sessions. Thirty contact hours in total.</p>
  <table><tr><th style="width:8mm"></th><th>Bench work</th><th style="width:15mm">Book</th><th style="width:44mm">Teacher leaves with</th></tr>{rows}</table>
  <h3 style="margin:10px 0 4px">Optional advanced modules</h3>
  <div>{opt}</div>
  <p class="mut" style="margin-top:4px;font-size:8.6pt">Sessions are indicative and are finalised with your head of department against your calendar. All 20 chapters are covered: 18 in the core sessions, two as optional modules.</p>
  {foot(n, T)}
</section>"""


def page_assess(n, T):
    unesco = [
        ("Human-centred mindset", "Ch. 17, 19", "Robots serve people. Teachers practise explaining limits and failures honestly."),
        ("Ethics of AI", "Ch. 19", "Safety, data protection (Nigeria Data Protection Act 2023), bias, and when not to build."),
        ("AI foundations and applications", "Ch. 15, 17", "Vision, language models and Physical AI, built and run on real boards."),
        ("AI pedagogy", "Teaching practicum", "Planning, leading and assessing a class with a trainer observing."),
        ("AI for professional development", "Ch. 20, termly check-ins", "A portfolio, communities to join, and a plan for the next term."),
    ]
    ur = "".join(f'<tr><td><b>{a}</b></td><td>{b}</td><td class="mut">{c}</td></tr>' for a, b, c in unesco)
    return f"""
<section class="pg">{sec('10', 'ASSESSMENT AND STANDARDS')}
  <h2>How we know a teacher<br>is ready to teach it.</h2>
  <p class="lead">Completion is not attendance. A teacher is signed off on three gates, each with a written record the school keeps.</p>
  <div class="grid g3" style="margin-bottom:10px">
    <div class="card"><span class="tag">GATE 1</span><h3>Safety</h3><p class="mut" style="margin:0">Before any student kit is handled: Safety Notes checklist, battery and soldering rules, and a stop-switch on every robot. Pass or repeat.</p></div>
    <div class="card"><span class="tag">GATE 2</span><h3>Knowledge</h3><p class="mut" style="margin:0">Chapter review questions from the book, marked against its answer key. Proposed pass mark: 70% on each part. Gates 1 and 2 are signed off in the room in both options.</p></div>
    <div class="card"><span class="tag">GATE 3</span><h3>Practical</h3><p class="mut" style="margin:0">Teach one session to real students with a trainer observing: a working student build by the end of the hour. Held in Term 1 or 2, in both options.</p></div>
  </div>
  <h3 style="margin-bottom:6px">Mapped to UNESCO's AI competency framework for teachers{sup(8)}</h3>
  <table><tr><th style="width:48mm">Domain</th><th style="width:32mm">Where it is trained</th><th>What teachers do</th></tr>{ur}</table>
  <div class="grid g2" style="margin-top:10px">
    <div class="card"><h3>Evidence the school receives</h3><ul class="t"><li>A record per teacher for each gate</li><li>Photos and build logs from each Academy session</li><li>An end-of-term report on student builds</li></ul></div>
    <div class="card"><h3>Proposed targets, set in your proposal</h3><ul class="t"><li>100% of teachers pass Gate 1 before Term 1 lab starts</li><li>All 18 sensor projects completed per teacher by the end of Term 1</li><li>At least one teacher leads a session unaided by the end of Term 2</li></ul></div>
  </div>
  {foot(n, T)}
</section>"""


def page_kits(n, T):
    order = ["ignite", "sensorverse", "rover_m2", "sentinel", "picode", "rover_sense", "rover_guard", "ultimate"]
    cards = ""
    for key in order:
        k = C.KITS[key]
        extra = f'<div class="mut" style="font-size:7.8pt">{e(k["variants"])}</div>' if k.get("variants") else ""
        wide = key in ("rover_sense", "rover_guard", "ultimate")
        pic = (f'<img src="img/{k["img"]}.jpg" style="width:100%;height:15mm;object-fit:contain;display:block;margin-bottom:3px">' if wide
               else f'<div style="display:flex;align-items:center"><img src="img/{k["img"]}.jpg" style="width:30mm;height:24mm;object-fit:contain"></div>')
        body = f"""<div><div><b>{e(k['name'])}</b> <span class="mono mut">{e(k['tag'])}</span></div>
        <div style="font-size:12pt;font-weight:700">{C.naira(k['price'])} <span class="mut" style="font-size:8pt;font-weight:400;text-decoration:line-through">{C.naira(k['list'])}</span></div>{extra}
        <div class="mut" style="font-size:8pt;line-height:1.3;margin-top:2px">{e(k['covers'])}</div>
        <div style="margin-top:3px"><span class="pill">{e(k['stage'])}</span><span class="pill">Book Ch. {e(k['chapters'])}</span></div></div>"""
        layout = "display:block" if wide else "display:grid;grid-template-columns:30mm 1fr;gap:8px"
        cards += f'<div class="card" style="{layout};padding:7px 9px">{pic}{body}</div>'
    return f"""
<section class="pg">{sec('11', 'TESTED KITS FOR THE LAB')}
  <h2>Eight kits. Each one mapped<br>to a stage and a chapter.</h2>
  <p class="lead" style="margin-bottom:8px">OKHub catalogue kits. Every component is tested before shipping. Each ships with a free tutorial PDF, Arduino and MicroPython code, 1 year of WhatsApp support, and nationwide delivery.</p>
  <div class="grid g2" style="gap:6px">{cards}</div>
  <p class="mut" style="margin-top:6px;font-size:8pt">Prices are from the OKHub customer catalogue and are confirmed at quotation. The book's Chapter 5 and 15 projects need an ESP32 and ESP32-CAM, which come with the Rover Sense IoT, Rover Guard IoT and Rover Ultimate-X kits.</p>
  {foot(n, T)}
</section>"""


def page_packs(n, T):
    cards = ""
    for p in C.PACKS:
        c = p["calc"]
        lines = "".join(f'{q} × {e(nm)} at {C.naira(pr)}' for nm, pr, q in p["lines"])
        disc = (f'<tr><td class="mut">School discount ({int(c["rate"]*100)}%)</td><td style="text-align:right">−{C.naira(c["saving"])}</td></tr>'
                if c["rate"] else '<tr><td class="mut">School discount</td><td style="text-align:right" class="mut">none under 5 kits</td></tr>')
        note = f'<div class="mono mut" style="margin-top:2px">{e(p["note"])}</div>' if p.get("note") else ""
        cards += f"""<div class="card"><span class="tag">{e(p['stage'])}</span><h3>{e(p['title'])}</h3>
        <p class="mut" style="font-size:8.6pt;margin-bottom:4px">{e(p['blurb'])}</p>
        <table style="font-size:8.3pt"><tr><td>{lines}</td><td style="text-align:right">{C.naira(c['gross'])}</td></tr>{disc}
        <tr><td><b>Pack total</b></td><td style="text-align:right"><b>{C.naira(c['net'])}</b></td></tr></table>
        <div class="mono mut" style="margin-top:3px">Book: {e(p['chapters'])}</div>{note}</div>"""
    full = C.pack_total([(C.KITS["ignite"]["price"], 10), (C.KITS["rover_m2"]["uno_price"], 10)])
    return f"""
<section class="pg">{sec('12', 'LAB PACKS AND BUDGET')}
  <h2>Four ready packs.<br>The discount worked out.</h2>
  <p class="lead">Packs are sized for one class of 30 in ten groups of three. The catalogue's school discount is 5% off at 5 or more kits and 10% off at 10 or more. Here it is applied to each pack's own kit count.</p>
  <div class="grid g2">{cards}</div>
  <div class="card" style="margin-top:8px;border-left:3px solid var(--y)"><h3>If you start with one class</h3>
  <p style="margin:0">Foundations Lab plus Builders Lab is 20 kits, {C.naira(full['gross'])} at list price and <b>{C.naira(full['net'])}</b> at the 10% school rate. That covers JSS1 to SS1 for one class, and the kits are re-used by every following class. Training and instruction fees are quoted separately in your proposal. Your Staff Training Kits can be added at any time.</p></div>
  <p class="mut" style="margin-top:6px;font-size:8pt">All figures are in naira, from the OKHub customer catalogue. Delivery is Lagos in 24 hours and elsewhere in 2 to 3 days. Payment by transfer, or pay on delivery in Lagos and Ibadan. Final prices are confirmed on your invoice.</p>
  {foot(n, T)}
</section>"""


def page_models(n, T):
    models = [
        ("In-School Robotics &amp; AI Lab", "Weekly / termly", "A standing class inside your timetable. OKHub supplies the lab kit, the module sequence and an instructor for every session.", "1 to 2 sessions a week, full term", "Every student holding a working build"),
        ("Teacher Capacity Building", "Cohort based", "Teacher training as a 3-day intensive or a ten-session Academy, against UNESCO's AI competency framework for educators.", "Intensive block, then termly check-ins", "A school that can teach this itself"),
        ("Holiday Intensive", "1 to 2 weeks", "The 4IR Bootcamp model for your students during a school holiday. Six builds, start to finish, published to OKHub's YouTube channel.", "Daily, for the length of the intensive", "A published build and a YouTube credit"),
        ("Competition Track", "Seasonal", "Mentoring toward WRO, FIRST LEGO League or the Robotics for Good Youth Challenge.", "Set against the competition calendar", "A team entered, coached and ready"),
    ]
    cards = "".join(f'<div class="card"><div style="display:flex;justify-content:space-between"><h3>{a}</h3><span class="mono mut">{b}</span></div><p class="mut" style="margin-bottom:4px">{c}</p><p style="font-size:8.6pt;margin:0"><b>Cadence:</b> {d}<br><b>Ends with:</b> {f}</p></div>' for a, b, c, d, f in models)
    return f"""
<section class="pg">{sec('13', 'PARTNERSHIP MODELS')}
  <h2>Four ways to run this.<br>We recommend a combination.</h2>
  <p class="lead">Equipment, curriculum and instruction come from OKHub in every model. What changes is cadence, who ends up able to run the room, and what the term ends with.</p>
  <div class="grid g2">{cards}</div>
  <div class="card" style="margin-top:10px;border-left:3px solid var(--y)"><h3>Recommended for a secondary school</h3>
  <p style="margin-bottom:4px"><b>Teacher Capacity Building + In-School Lab, then a Holiday Intensive.</b> Train staff first (start with the 3-day intensive, add Academy sessions for depth), run the lab for three terms on the handover ladder, and use a holiday intensive to give the strongest students an extra six builds. Add the Competition Track once a team forms.</p>
  <p class="mut" style="margin:0">A school can enter at any stage and add models later.</p></div>
  {foot(n, T)}
</section>"""


def page_roadmap(n, T):
    terms = [
        ("Before Term 1", "Set up", ["Discovery call or site visit", "Leadership briefing (Track A)", "Lab room set up, kits delivered", "Teacher training: 3-day intensive or Academy block"], "All teachers pass Gate 1 and complete the 18 sensor projects."),
        ("Term 1", "Observe", ["OKHub leads the student lab, 1 to 2 sessions a week", "Teachers run a bench each", "Modules 1 and 2 (car and obstacle avoider)", "Lab technician training (Track C)"], "Every student in the pilot class holds a working build."),
        ("Term 2", "Co-teach", ["Teachers lead, OKHub instructor beside them", "Modules 3 to 4, simulation in Webots for SS", "Gate 3 practical assessment", "Optional holiday intensive"], "At least one teacher leads a session unaided."),
        ("Term 3", "Lead", ["Teachers run the lab", "Modules 5 and 6, AI integration for senior classes", "Demo day for parents and the board", "Competition entry decision"], "Demo day with all six modules shown. Second cohort planned."),
    ]
    cards = "".join(f'<div class="card"><span class="tag mono">{a}</span><h3>{b}</h3><ul class="t" style="font-size:8.6pt;margin-bottom:5px">{"".join(f"<li>{e(x)}</li>" for x in c)}</ul><div class="mono mut">Evidence</div><div style="font-size:8.6pt"><b>{e(d)}</b></div></div>' for a, b, c, d in terms)
    return f"""
<section class="pg">{sec('14', 'YEAR ONE ROADMAP')}
  <h2>From first call to a school<br>that teaches it itself.</h2>
  <p class="lead">Four stages, each ending with evidence you can look at. Every stage can be stopped, resized or extended after review.</p>
  <div class="grid g2">{cards}</div>
  <h3 style="margin:12px 0 6px">Next steps</h3>
  <div class="step"><div class="no">1</div><div><b>Discovery call or site visit.</b> We look at student age range, existing facilities and timetable, and confirm which models fit.</div></div>
  <div class="step"><div class="no">2</div><div><b>A proposal built for your school.</b> Cohort size, cadence, equipment list and cost, scoped to what you need. No generic package.</div></div>
  <div class="step"><div class="no">3</div><div><b>Run the pilot.</b> One class or one cohort, one term, with teacher training running alongside.</div></div>
  <div class="step"><div class="no">4</div><div><b>Review, then scale.</b> Add cohorts, extend training, or move toward a competition entry.</div></div>
  {foot(n, T)}
</section>"""


def page_about(n, T):
    return f"""
<section class="pg">{sec('15', 'ABOUT OKHUB TECHNOLOGY')}
  <h2>We teach the skills,<br>then build with them.</h2>
  <p class="lead">OKHub Technology trains people and builds systems from the same building in Ibadan. The work spans commerce, health, agriculture and civic tech. Robotics and AI are one part of it, which is why your classroom gets the engineers who ship production systems the rest of the week.</p>
  <div class="grid g3" style="margin-bottom:10px">
    <div class="card"><div class="mono mut">Mission</div><b>Give people the tools and the confidence to build.</b></div>
    <div class="card"><div class="mono mut">Vision</div><b>Communities that build their own technology.</b></div>
    <div class="card"><div class="mono mut">Why we exist</div><b>Imported solutions do not survive local conditions. We build for the conditions we have.</b></div>
  </div>
  <div class="grid g2" style="margin-bottom:10px">
    <div class="card"><h3>Built in Nigeria, for local rules</h3><p class="mut" style="margin:0">Every product solves a Nigerian problem under Nigerian conditions, from power to regulation to language.</p></div>
    <div class="card"><h3>Teach it, build it, ship it</h3><p class="mut" style="margin:0">The engineers who train a cohort ship the client work. Students, schools and industry sit in the same room.</p></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">{img('ph_rover_side', 52)}{img('ph_breadboard', 52)}</div>
  <div class="card" style="border-left:3px solid var(--y)">
    <div class="mono mut">About the author</div>
    <h3 style="font-size:14pt;margin-bottom:1px">{C.BOOK['author']}</h3>
    <p style="margin-bottom:6px"><b>Mechatronics engineering graduate. Founder of OKHub Technology. Author of <i>Robotics for Everyone</i>.</b></p>
    <div class="grid g3" style="gap:10px">
      <div><div class="mono mut" style="margin-bottom:2px">Engineer</div><p style="font-size:8.8pt;margin:0">Has taken more than twelve AI and IoT systems from model training to deployment. They include a Yoruba and English serving robot, a firefighting robot, a smart walking stick for visually impaired users and a Nigerian Sign Language recogniser.</p></div>
      <div><div class="mono mut" style="margin-bottom:2px">Instructor</div><p style="font-size:8.8pt;margin:0">Has taught sensor integration, autonomous navigation and ROS simulation as an AI and robotics instructor. Alumnus of the Data Science Nigeria AI Bootcamp.</p></div>
      <div><div class="mono mut" style="margin-bottom:2px">Author</div><p style="font-size:8.8pt;margin:0">Wrote the book your teachers train on. It grew out of teaching beginners with simple kits, and it is written for people with no programming background.</p></div>
    </div>
  </div>
  {foot(n, T)}
</section>"""


def page_contact(n, T):
    refs = "".join(f'<div style="display:grid;grid-template-columns:18px 1fr;font-size:8.3pt;margin-bottom:3px"><span class="mono mut">{i}</span><span><b>{e(t)}</b><br><span class="mut">{e(s)}</span></span></div>' for i, (t, s) in enumerate(C.REFERENCES, 1))
    c = C.CONTACT
    return f"""
<section class="pg dark">
  <div class="sec mono"><span class="n" style="color:#000">16</span><span class="l" style="color:#9b9b92">LET'S START</span></div>
  <h1 style="color:#fff;font-size:30pt">Ready to put a robot<br>in a student's hands,<br><span style="color:var(--y)">and a teacher behind it?</span></h1>
  <p style="color:#e4e4dc;margin:10px 0 14px;max-width:150mm;font-size:10.5pt">OKHub Technology is based in {c['address']} and works with schools across Nigeria. Reach us directly. There is no intermediary form.</p>
  <div class="grid g2" style="margin-bottom:12px">
    <div class="stat"><span class="mono">Email</span><b style="font-size:13pt">{c['email']}</b></div>
    <div class="stat"><span class="mono">Phone / WhatsApp</span><b style="font-size:13pt">{c['phone']}</b></div>
    <div class="stat"><span class="mono">Instagram / Facebook</span><b style="font-size:13pt">{c['instagram']} · {c['facebook']}</b></div>
    <div class="stat"><span class="mono">YouTube build logs</span><b style="font-size:13pt">{c['youtube']}</b></div>
  </div>
  <div style="background:#1a1a17;padding:10px 12px;border:1px solid #2c2c28">
    <div class="mono" style="color:var(--y);margin-bottom:6px">References</div>
    <div style="color:#ddd;column-count:2;column-gap:10mm">{refs.replace('class="mut"', 'style="color:#9b9b92"').replace('class="mono mut"', 'class="mono" style="color:#9b9b92"')}</div>
  </div>
  <p class="mono" style="color:#9b9b92;margin-top:8px">Prices are from the OKHub customer catalogue and are confirmed at quotation. Training and instruction fees are quoted per school. All photographs and clips © OKHub Technology. <i>Robotics for Everyone</i> © {C.BOOK['author']}.</p>
  {foot(n, T)}
</section>"""


def render(school):
    makers = [page_summary, page_why, page_proof, page_builds, page_pathway, page_staff, page_book,
              page_options, page_threeday, page_academy, page_assess, page_kits, page_packs, page_models, page_roadmap, page_about, page_contact]
    total = len(makers) + 1
    pages = [page_cover(school)] + [m(i + 2, total) for i, m in enumerate(makers)]
    css = CSS % {"fonts": FONTS}
    script = """<script>window.addEventListener('load',()=>{const bad=[],zs=[];
    document.querySelectorAll('.pg').forEach((p,i)=>{
      if(!p.classList.contains('cover')){
        const fit=document.createElement('div');fit.className='fit';
        [...p.children].filter(c=>!c.classList.contains('foot')).forEach(c=>fit.appendChild(c));
        p.insertBefore(fit,p.firstChild);
        const cs=getComputedStyle(p);
        const limit=p.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-6;
        let z=1;
        for(let t=1;t<=1.36;t=Math.round((t+0.01)*100)/100){fit.style.zoom=t;
          if(fit.getBoundingClientRect().height>limit)break;z=t;}
        fit.style.zoom=z;zs.push(z);
      }
      if(p.scrollHeight>p.clientHeight+1)bad.push(i+1);});
    document.title='OVERFLOW:'+JSON.stringify(bad)+'ZOOM:'+JSON.stringify(zs);});</script>"""
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>OKHub Secondary School Partnership</title>'
            f'<style>{css}</style></head><body>{"".join(pages)}{script}</body></html>'), total


def chrome(*args):
    return subprocess.run(["google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu",
                           "--allow-file-access-from-files", *args], capture_output=True, text=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--school", default="")
    ap.add_argument("--book", default=str(DEFAULT_BOOK))
    ap.add_argument("--out", default=str(ROOT / "OKHub-Secondary-School-Partnership-and-Staff-Training-v1.pdf"))
    a = ap.parse_args()
    book = Path(a.book)
    if not book.exists():
        sys.exit(f"book PDF not found: {book} (pass --book)")
    prepare_images(book)
    doc, total = render(a.school)
    src = BUILD / "document.html"
    src.write_text(doc, encoding="utf-8")

    dom = chrome("--virtual-time-budget=5000", "--dump-dom", src.as_uri()).stdout
    marker = "OVERFLOW:"
    bad = json.loads(dom.split(marker, 1)[1].split("ZOOM:", 1)[0]) if marker in dom else None
    if bad is None:
        sys.exit("overflow check did not run")
    if bad:
        sys.exit(f"pages overflow their A4 box: {bad}")

    out = Path(a.out)
    r = chrome(f"--print-to-pdf={out}", "--no-pdf-header-footer", src.as_uri())
    if not out.exists():
        sys.exit(f"chrome failed: {r.stderr[-500:]}")
    print(f"ok: {out} ({total} pages, {out.stat().st_size/1e6:.1f} MB)")


if __name__ == "__main__":
    main()
