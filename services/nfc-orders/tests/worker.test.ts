import { test } from "node:test";
import assert from "node:assert/strict";

import { handle, parseOrder, corsHeaders, GRAPH, MAX_PDF_BYTES, type Env } from "../src/worker.ts";

const env: Env = { WHATSAPP_TOKEN: "tok", WHATSAPP_PHONE_NUMBER_ID: "123", OWNER_NUMBER: "2349069958990", ALLOWED_ORIGINS: "https://okhubtech.com, https://www.okhubtech.com" };
const ORIGIN = "https://okhubtech.com";
const pdfBytes = (n = 100) => new Uint8Array([...new TextEncoder().encode("%PDF-1.4\n"), ...new Uint8Array(n)]);

function body(over: Record<string, string | File> = {}) {
  const f = new FormData();
  f.set("ref", "NFC-261113-AB2C");
  f.set("name", "Ada Obi");
  f.set("phone", "08031234567");
  f.set("caption", "NEW NFC ORDER");
  f.set("website", "");
  f.set("pdf", new File([pdfBytes()], "o.pdf", { type: "application/pdf" }));
  for (const [k, v] of Object.entries(over)) f.set(k, v);
  return f;
}
const post = (f: FormData, origin: string | null = ORIGIN) => new Request("https://w.example/", { method: "POST", body: f, headers: origin ? { origin } : {} });

function fakeGraph(opts: { uploadOk?: boolean; sendOk?: boolean } = {}) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const f = async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (url.endsWith("/media")) return opts.uploadOk === false ? new Response("no", { status: 400 }) : new Response(JSON.stringify({ id: "MEDIA1" }), { status: 200 });
    return opts.sendOk === false ? new Response("no", { status: 400 }) : new Response("{}", { status: 200 });
  };
  return { f, calls };
}

test("happy path uploads the PDF then sends it as a document to the owner", async () => {
  const g = fakeGraph();
  const res = await handle(post(body()), env, g.f);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), ORIGIN);
  assert.equal(g.calls.length, 2);
  assert.equal(g.calls[0]!.url, `${GRAPH}/123/media`);
  assert.equal((g.calls[0]!.init!.headers as Record<string, string>).authorization, "Bearer tok");
  const msg = JSON.parse(String(g.calls[1]!.init!.body));
  assert.equal(msg.to, "2349069958990");
  assert.equal(msg.type, "document");
  assert.equal(msg.document.id, "MEDIA1");
  assert.equal(msg.document.caption, "NEW NFC ORDER");
  assert.match(msg.document.filename, /^NFC-261113-AB2C-Ada-Obi\.pdf$/);
});

test("the token is never echoed back to the caller", async () => {
  const res = await handle(post(body()), env, fakeGraph().f);
  assert.ok(!(await res.text()).includes("tok"));
});

test("unknown origin is refused and nothing is sent", async () => {
  const g = fakeGraph();
  assert.equal((await handle(post(body(), "https://evil.example"), env, g.f)).status, 403);
  assert.equal((await handle(post(body(), null), env, g.f)).status, 403);
  assert.equal(g.calls.length, 0);
});

test("preflight succeeds only for allowed origins", async () => {
  const ok = await handle(new Request("https://w/", { method: "OPTIONS", headers: { origin: ORIGIN } }), env);
  assert.equal(ok.status, 204);
  assert.ok(ok.headers.get("access-control-allow-methods"));
  const bad = await handle(new Request("https://w/", { method: "OPTIONS", headers: { origin: "https://evil.example" } }), env);
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
  assert.deepEqual(corsHeaders(null, env.ALLOWED_ORIGINS), {});
});

test("GET is rejected", async () => {
  assert.equal((await handle(new Request("https://w/", { method: "GET", headers: { origin: ORIGIN } }), env)).status, 405);
});

test("honeypot: reports success, sends nothing", async () => {
  const g = fakeGraph();
  const res = await handle(post(body({ website: "http://spam" })), env, g.f);
  assert.equal(res.status, 200);
  assert.equal(g.calls.length, 0);
});

test("rejects a bad ref, short name, missing pdf, non-pdf and oversize pdf", async () => {
  const g = fakeGraph();
  assert.equal((await handle(post(body({ ref: "../etc" })), env, g.f)).status, 400);
  assert.equal((await handle(post(body({ name: "A" })), env, g.f)).status, 400);
  const noPdf = body();
  noPdf.delete("pdf");
  assert.equal((await handle(post(noPdf), env, g.f)).status, 400);
  assert.equal((await handle(post(body({ pdf: new File(["<html>"], "x.pdf", { type: "application/pdf" }) })), env, g.f)).status, 415);
  const big = new File([pdfBytes(MAX_PDF_BYTES)], "b.pdf", { type: "application/pdf" });
  assert.equal((await handle(post(body({ pdf: big })), env, g.f)).status, 413);
  assert.equal(g.calls.length, 0);
});

test("a ref with letters the app never issues (0, 1, I, O) is refused", async () => {
  const r = await parseOrder(body({ ref: "NFC-261113-AB0I" }));
  assert.ok("error" in r);
});

test("caption is capped at the WhatsApp limit", async () => {
  const g = fakeGraph();
  await handle(post(body({ caption: "x".repeat(5000) })), env, g.f);
  assert.equal(JSON.parse(String(g.calls[1]!.init!.body)).document.caption.length, 1000);
});

test("WhatsApp upload failure gives 502 with no internals in the body", async () => {
  const res = await handle(post(body()), env, fakeGraph({ uploadOk: false }).f);
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { ok: false, error: "delivery" });
});

test("WhatsApp send failure gives 502", async () => {
  assert.equal((await handle(post(body()), env, fakeGraph({ sendOk: false }).f)).status, 502);
});

test("CRLF from multipart encoding is normalised to LF in the caption", async () => {
  const g = fakeGraph();
  await handle(post(body({ caption: "a\r\nb" })), env, g.f);
  assert.equal(JSON.parse(String(g.calls[1]!.init!.body)).document.caption, "a\nb");
});
