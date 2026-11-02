"""Gate tests for the secondary-school partnership document.

    python3 -m unittest docs/secondary-school-partnership/test_document.py -v
    BOOK_PDF=/path/to/book.pdf python3 -m unittest ...   (default: ~/Downloads latest)

These are the fact-check lane: every number the document prints is checked
against the customer catalogue PDF or the book PDF it came from, so a typo in
content.py fails here instead of in front of a headmaster.
"""
import os
import re
import subprocess
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build  # noqa: E402
import content as C  # noqa: E402

ROOT = HERE.parent.parent
CATALOG = ROOT / "assets" / "OkhubTech-CUSTOMER-Catalog-2024.pdf"
BOOK = Path(os.environ.get("BOOK_PDF", build.DEFAULT_BOOK))
BANNED = ["delve", "crucial", "robust", "comprehensive", "nuanced", "multifaceted", "furthermore", "moreover",
          "pivotal", "landscape", "tapestry", "underscore", "foster", "showcase", "intricate", "vibrant",
          "fundamental", "significant", "interplay", "here's the kicker", "here's the thing", "plot twist",
          "let me break this down", "the bottom line", "make no mistake"]


def pdftext(path, *extra):
    return subprocess.check_output(["pdftotext", *extra, str(path), "-"], text=True)


class Html:
    doc, total = build.render("Test School")
    text = re.sub(r"<[^>]+>", " ", doc)


class CatalogFacts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cat = pdftext(CATALOG)

    def test_every_kit_price_is_in_the_catalogue(self):
        for key, k in C.KITS.items():
            for field in ("price", "list"):
                self.assertIn(f"{k[field]:,}", self.cat, f"{key} {field} {k[field]:,} not in catalogue")
            if k.get("uno_price"):
                self.assertIn(f"{k['uno_price']:,}", self.cat, f"{key} UNO price missing")

    def test_every_kit_name_is_in_the_catalogue(self):
        cat = self.cat.upper()
        for key, k in C.KITS.items():
            self.assertIn(k["name"].upper().replace("PICODE", "PICODE"), cat, key)

    def test_discount_tiers_match_catalogue(self):
        self.assertIn("Buy 5+ kits - 5% off", self.cat)
        self.assertIn("Buy 10+ - 10% off", self.cat)
        self.assertEqual((C.discount_rate(4), C.discount_rate(5), C.discount_rate(9), C.discount_rate(10)),
                         (0.0, 0.05, 0.05, 0.10))


class Arithmetic(unittest.TestCase):
    def test_pack_totals(self):
        by = {p["key"]: p["calc"] for p in C.PACKS}
        self.assertEqual(by["foundations"]["gross"], 655000)
        self.assertEqual(by["foundations"]["net"], 589500)
        self.assertEqual(by["builders"]["net"], 612000)
        self.assertEqual(by["systems"]["gross"], 794995)
        self.assertEqual(by["systems"]["net"], 755245)
        self.assertEqual(by["staff"]["net"], 476997)  # 3 kits: no discount
        for c in by.values():
            self.assertEqual(c["gross"] - c["saving"], c["net"])

    def test_one_class_total_is_in_document(self):
        full = C.pack_total([(C.KITS["ignite"]["price"], 10), (C.KITS["rover_m2"]["uno_price"], 10)])
        self.assertEqual((full["gross"], full["net"]), (1335000, 1201500))
        self.assertIn(C.naira(1201500), Html.text)
        self.assertIn(C.naira(1335000), Html.text)


class BookFacts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not BOOK.exists():
            raise unittest.SkipTest(f"book PDF not found: {BOOK}")
        cls.text = pdftext(BOOK, "-layout")
        cls.toc = re.sub(r"\s+", " ", "\n".join(cls.text.splitlines()[:140]))

    def test_chapter_titles_match_contents_page(self):
        for n, title in C.CHAPTERS:
            self.assertIn(title, self.toc, f"Chapter {n} title not in book contents")

    def test_chapter_count_and_projects(self):
        self.assertEqual(len(C.CHAPTERS), C.BOOK["chapters"])
        projects = len(re.findall(r"^\s*Project \d+: ", self.text, re.M))
        self.assertGreaterEqual(projects, C.BOOK["projects"])

    def test_page_count(self):
        info = subprocess.check_output(["pdfinfo", str(BOOK)], text=True)
        self.assertIn(f"Pages:           {C.BOOK['pages']}", info)

    def test_book_covers_tools_the_document_names(self):
        for term in ("Webots", "Wokwi", "Tinkercad", "ESP32-CAM", "PID", "ROS 2", "Nigeria Data Protection Act 2023"):
            self.assertIn(term, self.text, term)


class Curriculum(unittest.TestCase):
    def test_every_chapter_covered_once(self):
        seen = {}
        for s in C.SESSIONS:
            for ch in s["chapters"]:
                seen[ch] = seen.get(ch, 0) + 1
        for o in C.OPTIONAL:
            seen[o["chapter"]] = seen.get(o["chapter"], 0) + 1
        self.assertEqual(sorted(seen), list(range(1, 21)))
        self.assertTrue(all(v == 1 for v in seen.values()), seen)

    def test_ten_sessions_thirty_hours(self):
        self.assertEqual([s["n"] for s in C.SESSIONS], list(range(1, 11)))
        self.assertIn("Thirty contact hours", Html.text)

    def test_every_kit_chapter_reference_exists(self):
        for k in C.KITS.values():
            for n in re.findall(r"\d+", k["chapters"]):
                self.assertTrue(1 <= int(n) <= 20)


class Style(unittest.TestCase):
    def test_no_em_dash_in_source_or_html(self):
        for path in (HERE / "content.py", HERE / "build.py"):
            self.assertNotIn("—", path.read_text(encoding="utf-8"), path.name)
        self.assertNotIn("—", Html.doc)

    def test_no_banned_vocabulary(self):
        low = Html.text.lower()
        for w in BANNED:
            self.assertIsNone(re.search(rf"\b{re.escape(w)}", low), w)

    def test_contact_details_match_partnership_doc(self):
        for v in ("info@okhubtech.com", "+234 906 995 8990", "@okhubtech"):
            self.assertIn(v, Html.text)

    def test_page_count_matches_footer(self):
        self.assertEqual(Html.doc.count('<section class="pg'), Html.total)
        self.assertIn(f"{Html.total:02d} / {Html.total:02d}", Html.text)

    def test_cross_references_point_at_real_pages(self):
        # Order in build.render(): 1 cover, 2 summary, 3 why, 4 proof, 5 builds, 6 pathway,
        # 7 staff, 8 book, 9 options, 10 three-day, 11 academy, 12 assessment, 13 kits, 14 packs...
        for ref in ("Pages 4 to 6", "Pages 7 to 12", "Pages 13 to 14", "Compared on page 9"):
            self.assertIn(ref.lower(), Html.text.lower())
        self.assertEqual(Html.total, 18)


class ThreeDay(unittest.TestCase):
    def test_each_day_is_six_contact_hours(self):
        self.assertEqual(len(C.THREE_DAY), 3)
        for d in C.THREE_DAY:
            self.assertEqual(sum(b[1] for b in d["blocks"]), 6.0, d["title"])

    def test_chapter_accounting(self):
        in_room = {c for d in C.THREE_DAY for b in d["blocks"] for c in b[3]}
        later = set(C.THREE_DAY_AFTER["chapters"]) | {o["chapter"] for o in C.OPTIONAL}
        self.assertEqual(in_room | later, set(range(1, 21)))
        self.assertEqual(len(in_room), 16)  # the options page says "16 of 20 in the room"
        self.assertTrue(in_room.isdisjoint(later))

    def test_six_projects_in_room_twelve_after(self):
        text = " ".join(b[2] for d in C.THREE_DAY for b in d["blocks"])
        projects = set(re.findall(r"Project (\d+)|\((\d+)\)|\((\d+), ", text))
        self.assertEqual(18 - 6, C.THREE_DAY_AFTER["projects"])
        for n in ("Project 1)", "(9)", "(10)", "Project 14)", "(15)", "(16)"):
            self.assertIn(n.strip("()"), text)

    def test_kit_cost_for_six_teachers(self):
        t = C.THREE_DAY_KITS
        self.assertEqual((t["qty"], t["gross"], t["net"]), (6, 400500, 380475))
        self.assertEqual(C.ACADEMY_KITS["net"], 476997)
        self.assertIn(C.naira(380475), Html.text)

    def test_options_page_present_in_both_formats(self):
        for term in ("3-Day Teacher Intensive", "Teacher Academy", "Our recommendation", "Day 1", "Day 3", "Eighteen contact hours"):
            self.assertIn(term, Html.text)


if __name__ == "__main__":
    unittest.main()
