# Deploying okhubtech.com

The site is a Next.js **static export** (`output: 'export'`) uploaded to cPanel
shared hosting running **LiteSpeed**. There is no Node process on the server —
every route is a plain HTML file.

## The bug this setup exists to prevent

On 2026-08-31 every page on okhubtech.com except the home page was serving a
LiteSpeed **directory listing** instead of the page:

```
Index of /services/cctv-surveillance/
  __next._full.txt                       17k
  __next._index.txt                      12k
  __next._tree.txt                        4k
  __next.services.cctv-surveillance.__PAGE__.txt
  ...
Proudly Served by LiteSpeed Web Server at okhubtech.com Port 443
```

### Why

`output: 'export'` **without** `trailingSlash: true` writes two things per route:

```
out/services/cctv-surveillance.html          <- the actual page
out/services/cctv-surveillance/              <- a real directory, RSC payloads only
    __next._full.txt
    __next._tree.txt
    ...
```

On Apache/LiteSpeed that produces this chain:

1. `GET /services/cctv-surveillance` — `mod_dir` sees a real **directory** of
   that name, so `DirectorySlash` issues `301 -> /services/cctv-surveillance/`.
2. `GET /services/cctv-surveillance/` — the directory has no `index.html`, so
   `mod_autoindex` renders a file listing. **`cctv-surveillance.html` is never
   reached.** Nothing on the server ever looks at it.

The home page worked only because `out/index.html` happens to be the directory
index of the web root.

This never shows up on Vercel or `next start`, which route by manifest rather
than by filesystem, which is why it survived to production.

### The fix

`trailingSlash: true` in [next.config.ts](../next.config.ts). The export then
writes the HTML *inside* the directory the server is already redirecting to:

```
out/services/cctv-surveillance/index.html    <- served by DirectoryIndex
out/services/cctv-surveillance/__next._*.txt <- prefetch payloads, harmless
```

`public/.htaccess` is the second layer: `Options -Indexes` means that even if a
directory somehow ends up without an `index.html` again, the server returns
**403 instead of listing the files**.

## Guard rails

| Command | What it does | When |
|---|---|---|
| `npm test` | Tests the export verifier against fixture builds, including a reconstruction of the exact broken layout above | every commit |
| `npm run build` | `next build` then `verify:export`; **fails the build** if the export is not deployable | every build |
| `npm run verify:export` | Checks `out/` on its own | ad hoc |
| `npm run deploy:pack` | Builds, verifies, writes `dist/okhubtech-<stamp>.zip` | before upload |
| `npm run verify:live` | Probes the live site for directory listings, wrong hosts, bad robots | after upload |

`scripts/verify-export.mjs` fails the build on:

- **A** an app-router route with no `<route>/index.html`, or a page under 2KB
- **B1** a directory holding page output (`.html` / `__next*.txt`) with no
  `index.html` — a broken route that would render as a listing
- **B2** a data-only directory that is listable because `Options -Indexes` is missing
- **C** the stale shape: `foo.html` sitting beside a `foo/` directory
- **D** `.htaccess` missing, or missing `Options -Indexes` / `DirectoryIndex` / `ErrorDocument`
- **E** `robots.txt` containing TypeScript source instead of robots rules
- **F** a sitemap entry on the wrong host, one that would 301, one with no
  exported page, or a gated route (`/admin`, `/login`, …) that should not be indexed
- **G** a build artifact (`*.zip`, `.env`, `*.map`) left in the web root

## Deploy

```bash
npm ci
npm test              # gate tests
npm run deploy:pack   # builds, verifies, writes dist/okhubtech-<stamp>.zip
```

Then in cPanel File Manager:

1. Clear the old contents of `public_html` (keep anything non-site hosted there).
2. Upload `dist/okhubtech-<stamp>.zip` into `public_html`.
3. Extract it there. **Confirm `.htaccess` extracted** — File Manager hides
   dotfiles until you enable *Settings → Show Hidden Files*.
4. Delete the zip from the server. Leaving it there makes it publicly
   downloadable (the previous deploy left a 13MB `OUT.zip` at
   `https://okhubtech.com/OUT.zip`).
5. Verify:

```bash
npm run verify:live
```

`scripts/clean-out.mjs` moves the previous `out/` to `out.previous/` before each
build rather than deleting it, so there is always one build to roll back to.

## Why `.htaccess` lives in `public/`

`public/.htaccess` is the source of truth; `next build` copies it into `out/`,
and check D fails the build if it did not land. Editing the copy on the server
works until the next deploy overwrites it.

Notable directives:

- `Options -Indexes` — never serve a listing (the fix above, as defence in depth)
- `DirectoryIndex index.html` — resolve directory requests to the page
- `ErrorDocument 404 /404.html` — Next writes `out/404.html` for exactly this
- HTTPS + apex canonicalisation — both `http://` and `www.` previously served
  200 with no redirect, which splits SEO signal across four URLs per page
- Long-lived cache for content-hashed `_next/static` assets; `must-revalidate`
  for `.html` **and `.txt`** — the RSC payloads must expire with the HTML they
  pair with, or client-side navigation renders the previous deploy's content
- HSTS is present but **commented out**: a 1-year `max-age` cannot be undone by
  editing this file, so it is an explicit opt-in

## Constraints of static export

These do not work on this hosting and are inert in `out/`:

- **`middleware.ts`** — never runs. The `/admin` auth gate it implements does
  not exist in production; `/admin` is a publicly readable static page. It
  renders mock data only (`server/admin/overview.ts`), so nothing sensitive
  leaks, but do not treat it as protected.
- **NextAuth / Prisma / server actions** — no server to run them.
- **`app/api/*/route.ts`** — only `dynamic = 'force-static'` GET handlers
  survive, exported as extensionless files (`out/api/impact`,
  `out/api/portfolio`) holding baked JSON.
- **`next/image` optimisation** — disabled via `images.unoptimized`.

A real admin dashboard needs a Node host (Vercel, a VPS, or cPanel's Node.js
Selector) rather than this static export.
