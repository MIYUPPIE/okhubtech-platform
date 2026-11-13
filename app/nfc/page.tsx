import type { Metadata } from "next";

import NfcOrderForm from "@/components/nfc/NfcOrderForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/nfc",
  ogSlug: "nfc",
  ogAlt: "Custom NFC cards from OKHub: design, price and order online",
  title: "Order custom NFC cards",
  description:
    "Design your own NFC card online, choose the chip, finish and quantity, see the price update live, and send a print-ready order sheet straight to OKHub on WhatsApp.",
});

export default function NfcPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-ink">NFC cards</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-black sm:text-5xl dark:text-white">Design it. Price it. Order it.</h1>
      <p className="mt-4 max-w-2xl text-lg text-black/70 dark:text-white/70">
        Pick your card, lay out the artwork right here, and say what a tap should do. The price updates as you choose. When you finish, we build a PDF order sheet with your name on it and send it to OKHub on WhatsApp.
      </p>
      <div className="mt-10">
        <NfcOrderForm />
      </div>
    </main>
  );
}
