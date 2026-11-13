# nfc-orders

Receives the order PDF from `okhubtech.com/nfc` and sends it to OKHub's WhatsApp
through the WhatsApp Cloud API. It exists because the site is a static export on
cPanel and cannot hold the WhatsApp token (anything in the browser bundle is public).

## Contract

`POST multipart/form-data` to the Worker URL. Fields: `ref` (`NFC-YYMMDD-XXXX`),
`name`, `phone`, `caption` (max 1000 chars), `website` (honeypot, must be empty),
`pdf` (application/pdf, max 8 MB, must start with `%PDF-`).
Replies `200 {ok:true}`, `400/413/415` for a bad request, `403` for a foreign
origin, `502` when WhatsApp refuses. Only origins in `ALLOWED_ORIGINS` are served.
`scripts/verify-nfc.mjs` in the site fails the build if the browser and this
Worker stop agreeing on field names.

## One-time setup (yours to run)

1. Meta Business: create a WhatsApp Business app, add a sending phone number, note
   its **Phone number ID** and create a **permanent system-user access token**
   with `whatsapp_business_messaging`.
2. Deploy:
   ```bash
   cd services/nfc-orders
   npm install
   npx wrangler secret put WHATSAPP_TOKEN
   npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID
   npm run deploy
   ```
3. Put the Worker URL in the site's `.env.local` as `NEXT_PUBLIC_NFC_ORDER_ENDPOINT`,
   then rebuild and re-upload the site (`npm run deploy:pack`).

## The 24 hour rule (read this)

WhatsApp only lets a business send a free-form message, a PDF included, to a
person who messaged that business number in the last 24 hours. The recipient is
`OWNER_NUMBER`. So: send any message to the sending number from your own WhatsApp
now and then, or you will get `502` and the page falls back to the hand-off
below. Removing the limit means registering an approved template with a document
header, which is a Meta approval, not code.

## Without the Worker

Leave `NEXT_PUBLIC_NFC_ORDER_ENDPOINT` empty. On a phone the page opens the share
sheet with the PDF attached (pick WhatsApp). Elsewhere the PDF downloads and a
`wa.me` chat opens with the summary typed in. The customer must press send.

## Tests

`npm test` (Node 22.6+, no dependencies). Covers the happy path, CORS, the
honeypot, size and type limits, caption cap, and both WhatsApp failure modes.
