/**
 * Builds the customer's order sheet as a PDF, in the browser.
 *
 * Page 1: who it is for, the full specification, what the card does on tap,
 * the itemised price, how to pay, and both sides of the artwork.
 * Page 2: the artwork at exactly 100% size with crop marks, for the printer.
 *
 * jsPDF's built-in fonts have no naira glyph, so money here is "NGN 12,500".
 * jsPDF is imported on demand so it never lands in the page's first bundle.
 */

import { BANK, EMAIL, LOCATION, PHONE_DISPLAY } from "./contact";
import { ACTIONS, DELIVERY, EXTRAS, FINISHES, chipById, formById, memoryReport, nairaPlain, quote, type Order } from "./nfc";

export type Artwork = { front: string; back: string };

const GOLD: [number, number, number] = [255, 215, 0];
const INK: [number, number, number] = [17, 17, 17];
const MUTED: [number, number, number] = [95, 95, 95];
const RULE: [number, number, number] = [220, 220, 220];

export const pdfFileName = (o: Order): string =>
  `${o.ref}-${o.customer.name.trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "order"}.pdf`;

/** Label/value rows for the specification table. Pure, so the gate can check it. */
export function specRows(o: Order): [string, string][] {
  const s = o.selection;
  const f = formById(s.form);
  const c = chipById(s.chip);
  const finish = FINISHES.find((x) => x.id === s.finish)?.label ?? s.finish;
  const extras = [...new Set(s.extras)].map((e) => EXTRAS.find((x) => x.id === e)?.label ?? e);
  return [
    ["Form", `${f.label} (${f.widthMm} x ${f.heightMm} mm)`],
    ["Chip", `${c.label}, ${c.bytes} bytes`],
    ["Quantity", String(quote(s).qty)],
    ["Printing", s.sides === "double" ? "Front and back" : "Front only"],
    ["Finish", finish],
    ["Extras", extras.length ? extras.join(", ") : "None"],
    ["Artwork", s.designBy === "okhub" ? "OKHub will design it" : "Designed by the customer (attached)"],
    ["Delivery", DELIVERY.find((d) => d.id === s.delivery)?.label ?? s.delivery],
  ];
}

export async function buildOrderPdf(o: Order, art: Artwork): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const q = quote(o.selection);
  const form = formById(o.selection.form);
  const W = 210;
  const M = 14;
  let y = 0;

  const text = (s: string, x: number, yy: number, size: number, color = INK, bold = false, align: "left" | "right" | "center" = "left") => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(s, x, yy, { align });
  };
  /** Start a fresh page when the next block would run into the footer. */
  const ensureSpace = (h: number) => {
    if (y + h > 280) {
      doc.addPage();
      y = 18;
    }
  };
  const heading = (s: string) => {
    ensureSpace(24);
    y += 4;
    text(s.toUpperCase(), M, y, 8.5, MUTED, true);
    doc.setDrawColor(...RULE);
    doc.line(M, y + 1.6, W - M, y + 1.6);
    y += 6.5;
  };

  // Header band
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 30, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 30, W, 1.4, "F");
  text("OKHub Technology", M, 14, 18, GOLD, true);
  text("NFC card order", M, 22, 11, [255, 255, 255]);
  text(o.ref, W - M, 14, 13, [255, 255, 255], true, "right");
  text(new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), W - M, 22, 10, [200, 200, 200], false, "right");

  y = 40;
  text(`Prepared for ${o.customer.name}`, M, y, 15, INK, true);
  if (o.customer.business) text(o.customer.business, M, y + 6, 10.5, MUTED);
  const contact = [o.customer.phone, o.customer.email, o.customer.city].filter(Boolean).join("   |   ");
  text(contact, M, y + (o.customer.business ? 12 : 6), 9.5, MUTED);
  y += o.customer.business ? 14 : 8;

  heading("Specification");
  for (const [k, v] of specRows(o)) {
    text(k, M, y, 9.5, MUTED);
    text(v, M + 34, y, 9.5, INK, true);
    y += 5.4;
  }

  heading("What the card does when tapped");
  const mem = memoryReport(o.actions, o.selection.chip);
  o.actions.forEach((a, i) => {
    ensureSpace(18);
    const def = ACTIONS.find((x) => x.id === a.id);
    const bytes = mem.perAction[i] ?? 0;
    text(`${i + 1}. ${def?.label ?? a.id}`, M, y, 9.5, INK, true);
    text(a.id === "other" ? "not stored" : `${bytes} bytes`, W - M, y, 8.5, MUTED, false, "right");
    y += 4.8;
    const detail = def?.fields
      ? def.fields.map((f) => (a.fields?.[f.key] ? `${f.label}: ${a.fields[f.key]}` : "")).filter(Boolean).join("   |   ")
      : a.value;
    const dl: string[] = doc.splitTextToSize(detail, W - 2 * M - 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(dl.slice(0, 3), M + 4, y);
    y += Math.min(dl.length, 3) * 4.2 + 1.6;
  });
  text(
    `Chip memory: ${mem.used} of ${mem.capacity} bytes used (${mem.free} free), ${chipById(o.selection.chip).label}`,
    M, y + 0.5, 9, mem.tight ? [170, 90, 0] : MUTED, true,
  );
  y += 5.5;
  if (o.customer.notes.trim()) {
    text("Notes", M, y + 1, 9.5, MUTED);
    const nl: string[] = doc.splitTextToSize(o.customer.notes.trim(), W - 2 * M - 34);
    doc.setTextColor(...INK);
    doc.text(nl.slice(0, 4), M + 34, y + 1);
    y += Math.min(nl.length, 4) * 4.6 + 2;
  }

  ensureSpace(62);
  heading("Price");
  for (const l of q.lines) {
    text(l.label, M, y, 9.5, INK);
    const note = l.each !== undefined ? `${nairaPlain(l.each)} each` : l.note;
    if (note) text(note, M + 88, y, 8.5, MUTED);
    text(l.amount < 0 ? `- ${nairaPlain(-l.amount)}` : nairaPlain(l.amount), W - M, y, 9.5, INK, false, "right");
    y += 5.2;
  }
  doc.setFillColor(...GOLD);
  doc.rect(M, y - 1.5, W - 2 * M, 9, "F");
  text("Total", M + 3, y + 4.4, 11, INK, true);
  text(nairaPlain(q.total), W - M - 3, y + 4.4, 11, INK, true, "right");
  y += 13;
  text(`About ${nairaPlain(q.perCard)} per card, delivery included.`, M, y, 8.5, MUTED);
  y += 3;

  heading("How to pay");
  text(`${BANK.name}   |   ${BANK.accountName}   |   ${BANK.accountNumber}`, M, y, 9.5, INK, true);
  y += 5;
  text("Pay only after OKHub confirms this order on WhatsApp. Quote ref: " + o.ref, M, y, 8.5, MUTED);
  y += 2;

  const maxW = (W - 2 * M - 10) / 2;
  const sides: [string, string][] = o.selection.sides === "double" ? [["Front", art.front], ["Back", art.back]] : [["Front", art.front]];
  const aspect = form.heightMm / form.widthMm;
  const pw = Math.min(maxW, form.shape === "circle" ? 50 : maxW);
  const ph = pw * aspect;
  ensureSpace(ph + 24);
  heading("Artwork preview");
  sides.forEach(([label, data], i) => {
    const x = M + i * (pw + 10);
    text(label, x, y, 8.5, MUTED, true);
    doc.addImage(data, "PNG", x, y + 2, pw, ph, undefined, "FAST");
  });


  // Page 2: 100% artwork with crop marks
  doc.addPage();
  text("Print artwork, actual size", M, 18, 14, INK, true);
  text(`${o.ref}   |   ${form.label}, ${form.widthMm} x ${form.heightMm} mm   |   300 dpi`, M, 24, 9, MUTED);
  let py = 36;
  const pages: [string, string][] = o.selection.sides === "double" ? [["FRONT", art.front], ["BACK", art.back]] : [["FRONT", art.front]];
  for (const [label, data] of pages) {
    const x = (W - form.widthMm) / 2;
    text(label, x, py - 4, 8.5, MUTED, true);
    doc.addImage(data, "PNG", x, py, form.widthMm, form.heightMm);
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.2);
    const m = 4;
    const x2 = x + form.widthMm;
    const y2 = py + form.heightMm;
    for (const [cx, cy, dx, dy] of [[x, py, -1, -1], [x2, py, 1, -1], [x, y2, -1, 1], [x2, y2, 1, 1]] as const) {
      doc.line(cx + dx * 1.5, cy, cx + dx * (1.5 + m), cy);
      doc.line(cx, cy + dy * 1.5, cx, cy + dy * (1.5 + m));
    }
    py += form.heightMm + 22;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    text(`${EMAIL}   |   ${PHONE_DISPLAY}   |   ${LOCATION}`, W / 2, 289, 8, MUTED, false, "center");
    text(`${i} / ${pageCount}`, W - M, 289, 8, MUTED, false, "right");
  }
  return doc.output("blob");
}
