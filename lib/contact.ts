/**
 * Canonical contact details for OKHub Technology.
 *
 * Single source of truth. Before this file the site shipped four different
 * answers to "how do I reach OKHub": the footer had info@okhubtech.com and
 * +2349069958990, ContactSection had hello@okhub.tech, FloatingContact dialled
 * +2348081130222, and /contact listed partners@/capital@/press@/talent@/legal@
 * on okhub.tech plus an "Abuja HQ": a domain OKHub does not own and an office
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
 * was put here: the footer previously carried links to linkedin.com and
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
 * Stored by shortcode, not by full permalink, because the two Instagram URL
 * forms are not interchangeable: the account-scoped one people copy from the
 * app (/okhubtech/reel/<id>/) is what a human shares, while the embed only
 * takes the bare /reel/<id>/embed/ form. Deriving both from the shortcode
 * means the link and the player can never disagree.
 *
 * Titles are the opening line of each reel's own caption, read off the embed
 * payload rather than written here: see scripts/verify-contact.mjs for why
 * nothing on this site gets a caption somebody invented.
 */
/**
 * Which permalink form Instagram serves a clip under. Reels sit at /reel/,
 * feed videos at /p/. Both accept the /embed/ suffix, but the link a reader
 * clicks should be the one Instagram itself hands out for that post.
 */
export type ReelKind = "reel" | "post";

export type Reel = {
  /** Instagram shortcode: the segment after /reel/ or /p/. */
  id: string;
  /** Defaults to "reel". */
  kind?: ReelKind;
  title: string;
  blurb: string;
  /** Runtime in seconds, from the post's own metadata. */
  seconds: number;
};

export const REELS: readonly Reel[] = [
  {
    id: "DbjAWTsgMuh",
    title: "A hands-free voting kiosk",
    blurb:
      "Biometric voter registration and a voting kiosk with no keyboard and no mouse: pick a language, look at the camera, point at a party.",
    seconds: 151,
  },
  {
    id: "DbdIjVDlIxe",
    title: "A robot that takes orders in Yoruba",
    blurb:
      "Yoruba Live Voice wired to an ESP32-S3 with motor drivers: spoken Yoruba to understanding to movement, with no English in the middle.",
    seconds: 164,
  },
  {
    id: "C5nPiNiNdc9",
    kind: "post",
    title: "A submersible pump, drawn part by part",
    blurb:
      "Bearing, impeller stack and housing modelled in SolidWorks 2023: the CAD that has to be right before anything gets cut or printed.",
    seconds: 15,
  },
  {
    id: "DaSXdAOitWP",
    title: "Making CCTV cameras think",
    blurb:
      "Most Nigerian businesses already own cameras that only record problems. SmartEyes is the edge-AI layer that makes them prevent one.",
    seconds: 95,
  },
];

/** What a person opens when they tap the post. */
const reelSegment = (kind: ReelKind = "reel") => (kind === "post" ? "p" : "reel");

export const reelPermalink = (id: string, kind: ReelKind = "reel") =>
  `${INSTAGRAM}/${reelSegment(kind)}/${id}/`;

/** What the iframe player loads. Only the bare form works here. */
export const reelEmbed = (id: string, kind: ReelKind = "reel") =>
  `https://www.instagram.com/${reelSegment(kind)}/${id}/embed/`;

/**
 * Bank transfer details for course fees and invoices.
 *
 * Public by design: an account name, bank and account number are what you hand
 * out to *receive* money, not credentials. Nothing here authorises a debit.
 * Keep the account name exact: payers match it before they send.
 */
export const BANK = {
  name: "Paystack MFB",
  accountName: "OKHUB TECHNOLOGY",
  accountNumber: "0102106463",
} as const;
