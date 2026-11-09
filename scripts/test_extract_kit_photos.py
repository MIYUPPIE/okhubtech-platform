"""Gate tests for scripts/extract_kit_photos.py. Synthetic images only, no PDF.

    python3 -m unittest scripts/test_extract_kit_photos.py -v
"""

import sys
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import extract_kit_photos as ex  # noqa: E402


def canvas(w, h):
    return Image.new("RGB", (w, h), (255, 255, 255))


class Trim(unittest.TestCase):
    def test_crops_to_content(self):
        im = canvas(400, 300)
        ImageDraw.Draw(im).rectangle((100, 50, 199, 149), fill=(20, 20, 200))
        self.assertEqual(ex.trim(im).size, (100, 100))

    def test_near_white_counts_as_background(self):
        # JPEG noise on a catalogue background is ~245, not 255.
        im = Image.new("RGB", (200, 200), (246, 246, 246))
        ImageDraw.Draw(im).rectangle((10, 10, 19, 19), fill=(0, 0, 0))
        self.assertEqual(ex.trim(im).size, (10, 10))

    def test_blank_image_is_returned_unchanged(self):
        im = canvas(50, 40)
        self.assertEqual(ex.trim(im).size, (50, 40))


class StripRules(unittest.TestCase):
    def test_frame_lines_on_every_edge_are_removed(self):
        # Rover M2 in the catalogue: a 2-7px border line round the photo.
        im = canvas(800, 600)
        d = ImageDraw.Draw(im)
        d.rectangle((0, 0, 799, 599), outline=(120, 120, 120), width=3)
        d.rectangle((200, 150, 599, 449), fill=(0, 0, 200))
        self.assertEqual(ex.strip_rules(ex.trim(im)).size, (400, 300))

    def test_image_without_rules_is_untouched(self):
        im = canvas(300, 200)
        ImageDraw.Draw(im).rectangle((0, 0, 299, 199), fill=(0, 0, 0))
        self.assertEqual(ex.strip_rules(im).size, (300, 200))


class Split(unittest.TestCase):
    def strip(self):
        # Four shots on an 8:1 strip with catalogue-like spacing: wide gutters
        # between shots, plus a 2px grey separator rule after the first.
        im = canvas(1600, 200)
        d = ImageDraw.Draw(im)
        for x in (20, 420, 820, 1220):
            d.rectangle((x, 40, x + 199, 159), fill=(200, 30, 30))
        d.rectangle((320, 0, 321, 199), fill=(150, 150, 150))
        return im

    def test_splits_at_gutters_and_drops_the_rule(self):
        pieces = ex.split_columns(self.strip())
        self.assertEqual(len(pieces), 4)
        for p in pieces:
            self.assertEqual(p.size, (200, 120))

    def test_narrow_gap_inside_one_shot_is_not_a_split(self):
        # The rover photo: chassis, then wheels ~50px away. One shot, not two.
        im = canvas(1400, 200)
        d = ImageDraw.Draw(im)
        d.rectangle((0, 40, 299, 159), fill=(200, 120, 0))     # chassis
        d.rectangle((350, 60, 449, 139), fill=(250, 200, 0))   # wheels, 50px gap
        d.rectangle((900, 40, 1199, 159), fill=(0, 0, 0))      # next shot, 450px gap
        pieces = ex.split_columns(im)
        self.assertEqual([p.width for p in pieces], [450, 300])

    def test_rule_splits_even_across_a_narrow_gap(self):
        im = canvas(600, 200)
        d = ImageDraw.Draw(im)
        d.rectangle((0, 20, 199, 179), fill=(0, 0, 0))
        d.rectangle((240, 0, 242, 199), fill=(150, 150, 150))
        d.rectangle((280, 20, 479, 179), fill=(0, 0, 0))
        self.assertEqual(len(ex.split_columns(im)), 2)

    def test_single_shot_is_one_piece(self):
        im = canvas(600, 200)
        ImageDraw.Draw(im).rectangle((50, 50, 549, 149), fill=(0, 0, 0))
        self.assertEqual(len(ex.split_columns(im)), 1)


class Tile(unittest.TestCase):
    def test_four_pieces_make_a_2x2_grid(self):
        pieces = [Image.new("RGB", (100, 80), (0, 0, 0)) for _ in range(4)]
        sheet = ex.tile(pieces)
        gap = int(100 * 0.08)
        self.assertEqual(sheet.size, (200 + gap, 160 + gap))

    def test_odd_last_piece_is_centred(self):
        pieces = [Image.new("RGB", (100, 100), (0, 0, 0)) for _ in range(3)]
        sheet = ex.tile(pieces)
        gap = 8
        # Bottom row: one piece, centred, so the left edge is half a cell plus half a gap in.
        y = 100 + gap + 50
        self.assertEqual(sheet.getpixel(((100 + gap) // 2 + 10, y)), (0, 0, 0))
        self.assertEqual(sheet.getpixel((5, y)), (255, 255, 255))


class Card(unittest.TestCase):
    def test_output_is_always_the_card_size(self):
        for size in [(3000, 600), (600, 3000), (800, 600), (40, 30)]:
            im = Image.new("RGB", size, (0, 0, 0))
            self.assertEqual(ex.to_card(im).size, ex.CARD)

    def test_content_is_centred_with_padding(self):
        card = ex.to_card(Image.new("RGB", (400, 300), (0, 0, 0)))
        pad_x, pad_y = int(ex.CARD[0] * ex.PAD), int(ex.CARD[1] * ex.PAD)
        self.assertEqual(card.getpixel((pad_x - 2, ex.CARD[1] // 2)), (255, 255, 255))
        self.assertEqual(card.getpixel((ex.CARD[0] // 2, pad_y + 2)), (0, 0, 0))

    def test_wide_strip_is_retiled_not_shrunk_to_a_ribbon(self):
        strip = Split().strip()
        card = ex.prepare(strip)
        box = ex._ink_mask(card).getbbox()
        # Re-tiled, the content uses well over half the card's height.
        self.assertGreater(box[3] - box[1], ex.CARD[1] * 0.5)

    def test_slug_list_matches_catalogue_count(self):
        self.assertEqual(len(ex.KIT_SLUGS), 8)
        self.assertEqual(len(set(ex.KIT_SLUGS)), 8)


if __name__ == "__main__":
    unittest.main()
