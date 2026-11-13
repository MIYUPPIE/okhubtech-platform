# /nfc: custom NFC card orders

**Outcome it moves:** a customer can specify, price and submit an NFC card order
without a back-and-forth, and OKHub receives a print-ready PDF on WhatsApp.
Measure it by orders received on WhatsApp carrying an `NFC-` reference.

## Files

| File | Job |
|---|---|
| `lib/nfc.ts` | Catalogue, **all prices** (`PRICING`), `quote()`, order reference, validation, WhatsApp caption |
| `lib/nfc-design.ts` | Designer model and the canvas renderer (300 dpi), hit testing |
| `lib/nfc-pdf.ts` | Builds the PDF: spec, price, payment, artwork preview, then 1:1 artwork with crop marks |
| `lib/nfc-delivery.ts` | Sends the PDF to the Worker, or falls back to share sheet / wa.me |
| `components/nfc/NfcOrderForm.tsx` | The 4-step page with the live price panel |
| `services/nfc-orders/` | Cloudflare Worker that holds the WhatsApp token |
| `scripts/verify-nfc.mjs` (+ `.test.mjs`) | Gate: pricing, order, designer, wiring |

## Changing prices

Edit `PRICING` in `lib/nfc.ts`. The page, PDF and gate follow. The gate rejects
fractional or negative prices and any change that makes a bigger order cost more
per card. Prices were set against Nigerian listings seen in Nov 2026 (Jiji N20,000, Nukreationz from N30,000, Quikprint metal N6,000 to N11,500 by volume). Confirm them against your own costs.
Hand-computed expectations in `scripts/verify-nfc.mjs` (`checkQuotes`) will fail
when you change a price: update them to your new arithmetic.

## Choices worth knowing

- PDF money is `NGN 12,500`, not the naira sign: jsPDF's built-in fonts lack the glyph.
- Uploaded logos are shrunk to 1200 px before use so the PDF stays small.
- The header is full at 1280 px, so the page is linked from the footer only.
