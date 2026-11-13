/**
 * NFC order intake. Receives the customer's PDF from okhubtech.com/nfc and
 * forwards it to OKHub's WhatsApp through the WhatsApp Cloud API.
 *
 * Why this exists: okhubtech.com is a static export, so it cannot hold the
 * WhatsApp access token. Anything in the browser bundle is public. The token
 * lives here as a Worker secret and never leaves.
 *
 * Contract (shared with lib/nfc-delivery.ts):
 *   POST multipart/form-data
 *     ref      NFC-YYMMDD-XXXX
 *     name     customer name
 *     phone    customer phone
 *     caption  text sent with the document (max 1000 chars)
 *     website  honeypot, must be empty
 *     pdf      application/pdf, max 8 MB, must start with %PDF
 *   200 {ok:true} | 400/413/415 {ok:false,error} | 502 {ok:false,error}
 */

export interface Env {
  WHATSAPP_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  /** Digits only, e.g. 2349069958990. */
  OWNER_NUMBER: string;
  /** Comma separated origins allowed to call this, e.g. https://okhubtech.com */
  ALLOWED_ORIGINS: string;
}

export const MAX_PDF_BYTES = 8 * 1024 * 1024;
export const MAX_CAPTION = 1000;
export const GRAPH = "https://graph.facebook.com/v21.0";
const REF = /^NFC-\d{6}-[2-9A-HJ-NP-Z]{4}$/;

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const json = (status: number, body: unknown, headers: HeadersInit = {}): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

export function corsHeaders(origin: string | null, allowed: string): Record<string, string> {
  const list = allowed.split(",").map((s) => s.trim()).filter(Boolean);
  if (!origin || !list.includes(origin)) return {};
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", vary: "Origin" };
}

export type Parsed = { ref: string; name: string; phone: string; caption: string; pdf: File } | { error: string; status: number };

export async function parseOrder(form: FormData): Promise<Parsed> {
  const ref = String(form.get("ref") ?? "");
  const name = String(form.get("name") ?? "").trim().slice(0, 100);
  const phone = String(form.get("phone") ?? "").trim().slice(0, 30);
  const caption = String(form.get("caption") ?? "").replace(/\r\n/g, "\n").slice(0, MAX_CAPTION);
  const pdf = form.get("pdf");
  if (!REF.test(ref)) return { error: "bad ref", status: 400 };
  if (name.length < 2) return { error: "bad name", status: 400 };
  if (!(pdf instanceof File)) return { error: "pdf missing", status: 400 };
  if (pdf.size > MAX_PDF_BYTES) return { error: "pdf too large", status: 413 };
  const head = new TextDecoder().decode(new Uint8Array(await pdf.slice(0, 5).arrayBuffer()));
  if (head !== "%PDF-") return { error: "not a pdf", status: 415 };
  return { ref, name, phone, caption, pdf };
}

/** Upload the PDF to WhatsApp, then send it as a document to the owner. */
export async function sendToWhatsApp(p: Extract<Parsed, { ref: string }>, env: Env, f: FetchLike): Promise<void> {
  const auth = { authorization: `Bearer ${env.WHATSAPP_TOKEN}` };

  const up = new FormData();
  up.set("messaging_product", "whatsapp");
  up.set("type", "application/pdf");
  up.set("file", p.pdf, `${p.ref}.pdf`);
  const upRes = await f(`${GRAPH}/${env.WHATSAPP_PHONE_NUMBER_ID}/media`, { method: "POST", headers: auth, body: up });
  if (!upRes.ok) throw new Error(`media upload ${upRes.status}`);
  const { id } = (await upRes.json()) as { id?: string };
  if (!id) throw new Error("media upload returned no id");

  const msgRes = await f(`${GRAPH}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: env.OWNER_NUMBER,
      type: "document",
      document: { id, filename: `${p.ref}-${p.name.replace(/[^A-Za-z0-9]+/g, "-").slice(0, 30)}.pdf`, caption: p.caption },
    }),
  });
  if (!msgRes.ok) throw new Error(`message send ${msgRes.status}`);
}

export async function handle(req: Request, env: Env, f: FetchLike = fetch): Promise<Response> {
  const cors = corsHeaders(req.headers.get("origin"), env.ALLOWED_ORIGINS);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { ok: false, error: "method" }, cors);
  if (!cors["access-control-allow-origin"]) return json(403, { ok: false, error: "origin" });

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_PDF_BYTES + 64 * 1024) return json(413, { ok: false, error: "too large" }, cors);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, { ok: false, error: "bad body" }, cors);
  }

  // Bots fill every field. Say OK so they do not learn the trap, send nothing.
  if (String(form.get("website") ?? "") !== "") return json(200, { ok: true }, cors);

  const parsed = await parseOrder(form);
  if ("error" in parsed) return json(parsed.status, { ok: false, error: parsed.error }, cors);

  try {
    await sendToWhatsApp(parsed, env, f);
  } catch (e) {
    console.error("whatsapp delivery failed", parsed.ref, e instanceof Error ? e.message : e);
    return json(502, { ok: false, error: "delivery" }, cors);
  }
  return json(200, { ok: true }, cors);
}

export default { fetch: (req: Request, env: Env) => handle(req, env) };
