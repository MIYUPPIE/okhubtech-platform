/**
 * Canonical contact details for OKHub Technology.
 *
 * Single source of truth. Before this file the site shipped four different
 * answers to "how do I reach OKHub": the footer had info@okhubtech.com and
 * +2349069958990, ContactSection had hello@okhub.tech, FloatingContact dialled
 * +2348081130222, and /contact listed partners@/capital@/press@/talent@/legal@
 * on okhub.tech plus an "Abuja HQ" — a domain OKHub does not own and an office
 * that does not exist.
 *
 * Every component that renders a phone number, an email address or a location
 * must import from here. scripts/verify-contact.test.mjs fails the build if a
 * literal reappears anywhere in the source tree.
 */

/** The only monitored inbox. */
export const EMAIL = "info@okhubtech.com";

/** Dialable form, E.164. Used for tel: and as the WhatsApp identity. */
export const PHONE_E164 = "+2349069958990";

/** Human-readable grouping of PHONE_E164. Display only, never in an href. */
export const PHONE_DISPLAY = "+234 906 995 8990";

/** wa.me wants the E.164 digits with no "+" and no separators. */
export const WHATSAPP_NUMBER = PHONE_E164.replace(/\D/g, "");

/** Where OKHub actually operates from. */
export const LOCATION = "Mokola, Ibadan, Oyo State, Nigeria";

/** Short form for tight spaces (footer, cards). */
export const LOCATION_SHORT = "Ibadan, Nigeria";

export const MAILTO = `mailto:${EMAIL}`;
export const TEL = `tel:${PHONE_E164}`;

/** Deep link into WhatsApp, optionally with the message pre-filled. */
export const whatsappLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

/**
 * Social accounts. Every one of these was requested and answered 200 before it
 * was put here — the footer previously carried links to linkedin.com and
 * twitter.com, which are those sites' own front pages and not OKHub at all.
 *
 * www.facebook.com and web.facebook.com serve the same page; www is the
 * canonical one to publish.
 */
export const FACEBOOK = "https://www.facebook.com/okhubtech";
export const INSTAGRAM = "https://www.instagram.com/okhubtech";

/**
 * Reels published on the Instagram account, newest first.
 *
 * Only the permalink is stored. Instagram serves captions behind a login wall,
 * so any title written here would be guesswork; the embed renders the real
 * video with its real caption instead, and falls back to a plain link to the
 * post if the embed script does not load.
 */
export const INSTAGRAM_REELS = [
  "https://www.instagram.com/okhubtech/reel/DbjAWTsgMuh/",
  "https://www.instagram.com/okhubtech/reel/DbdIjVDlIxe/",
  "https://www.instagram.com/okhubtech/reel/DaSXdAOitWP/",
] as const;

/**
 * Bank transfer details for course fees and invoices.
 *
 * Public by design: an account name, bank and account number are what you hand
 * out to *receive* money, not credentials. Nothing here authorises a debit.
 * Keep the account name exact — payers match it before they send.
 */
export const BANK = {
  name: "Paystack MFB",
  accountName: "OKHUB TECHNOLOGY",
  accountNumber: "0102106463",
} as const;
