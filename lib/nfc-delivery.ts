/**
 * Gets the finished PDF to OKHub's WhatsApp.
 *
 * okhubtech.com is a static export on shared hosting, so it has no server of
 * its own to talk to WhatsApp. Two routes, tried in order:
 *
 *  1. DIRECT. NEXT_PUBLIC_NFC_ORDER_ENDPOINT points at services/nfc-orders (a
 *     small Cloudflare Worker that holds the WhatsApp Cloud API token). The
 *     page POSTs the PDF there and the Worker delivers it. No tap needed.
 *
 *  2. HAND-OFF. With no endpoint, or if it fails, the browser's share sheet is
 *     offered (phones can attach the PDF straight into WhatsApp) and otherwise
 *     the PDF downloads and a wa.me chat opens with the order summary typed in.
 *     The customer has to press send, which is the most a browser can do.
 */

import { whatsappLink } from "./contact";
import { whatsappCaption, whatsappFallbackText, type Order } from "./nfc";

export const ENDPOINT = process.env.NEXT_PUBLIC_NFC_ORDER_ENDPOINT ?? "";

export type DeliveryResult =
  | { via: "direct" }
  | { via: "share" }
  | { via: "whatsapp-link"; url: string };

export function buildForm(o: Order, pdf: Blob, fileName: string): FormData {
  const f = new FormData();
  f.set("ref", o.ref);
  f.set("name", o.customer.name);
  f.set("phone", o.customer.phone);
  f.set("caption", whatsappCaption(o));
  f.set("website", ""); // honeypot: real visitors never fill this
  f.set("pdf", new File([pdf], fileName, { type: "application/pdf" }));
  return f;
}

export async function deliver(o: Order, pdf: Blob, fileName: string, endpoint = ENDPOINT): Promise<DeliveryResult> {
  if (endpoint) {
    try {
      const res = await fetch(endpoint, { method: "POST", body: buildForm(o, pdf, fileName) });
      if (res.ok) return { via: "direct" };
    } catch {
      /* fall through to hand-off */
    }
  }

  const file = new File([pdf], fileName, { type: "application/pdf" });
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (nav?.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: whatsappCaption(o), title: o.ref });
      return { via: "share" };
    } catch {
      /* user cancelled the sheet: fall through to the link */
    }
  }

  const url = URL.createObjectURL(pdf);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return { via: "whatsapp-link", url: whatsappLink(whatsappFallbackText(o)) };
}
