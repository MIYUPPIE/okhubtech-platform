# Secondary School Partnership and Staff Training document

Sales document for secondary schools: student robotics lab (from the 4IR partnership v4),
staff training academy built on the book *Robotics for Everyone*, and catalogue kits with lab packs.

    python3 docs/secondary-school-partnership/build.py [--school "School Name"] [--out file.pdf] [--book book.pdf]
    python3 -m unittest docs/secondary-school-partnership/test_document.py -v

- `content.py`: all prices, packs, chapters, sessions. Single source of truth.
- `build.py`: images from tracked assets, HTML, headless Chrome PDF. Fails on any page overflow.
- `test_document.py`: gate tests. Prices are checked against `assets/OkhubTech-CUSTOMER-Catalog-2024.pdf`,
  chapter titles and tools against the book PDF (`BOOK_PDF` env or `~/Downloads/Robotics for Everyone latest.pdf`).
- Needs: google-chrome, pdftotext/pdfimages (poppler), ffmpeg, Pillow.
- Output PDF and `build/` are gitignored. `--school` prints the school name on the cover.

Prices are naira from the customer catalogue. Staff-training and instruction fees are deliberately not priced here:
they are quoted per school in the proposal.
