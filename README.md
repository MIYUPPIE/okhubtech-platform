## OKHub Technology — 4IR Platform

Training minds, building solutions, and powering Africa’s future with Next.js 16 (App Router), TypeScript, Tailwind v4, Framer Motion, Shadcn UI, Prisma, and NextAuth.

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon/Supabase/Azure Flexible Server)
- Cloudinary, Paystack (or Stripe) accounts
- Resend/Nodemailer credentials for transactional email

### Environment Variables

Copy `.env.example` to `.env.local` and provide values for:

```
DATABASE_URL=
NEXTAUTH_SECRET=
PAYSTACK_SECRET_KEY= / STRIPE_SECRET_KEY=
CLOUDINARY_* keys
RESEND_API_KEY or SMTP_* values
SITE_URL=
```

### Install & Database Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### Development

```bash
npm run dev
```

### Available Scripts

- `npm run dev` — local development server
- `npm run build` / `npm start` — production build + start
- `npm run lint` — ESLint
- `npm test` — gate tests for the export verifier and the contact-detail verifier
- `npm run verify:export` — assert `out/` cannot serve a directory listing
- `npm run verify:contact` — assert no contact detail is hardcoded outside `lib/contact.ts`
- `npm run verify:theme` — assert no text is invisible against its own background
- `npm run prisma:generate` — regenerate Prisma client
- `npm run prisma:migrate` — run migrations in dev
- `npm run prisma:seed` — seed roles + bootstrap admin account

### Authentication & Roles

- Credentials auth powered by NextAuth + Prisma adapter; login UI lives at `/login`.
- Seed script creates all roles and an admin account using `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults `admin@okhubtech.com` / `ChangeMe123!`). Update these in `.env.local` before running `npm run prisma:seed` in production environments.
- Registration form defaults to Student role; promote users by attaching roles via admin dashboard or Prisma.

### Theming

The site is light by default (`#fafafa` body, `#050505` text) and switches to
dark on `.dark`, set by next-themes. Every colour utility therefore needs both
halves: `text-black dark:text-white`, `border-black/10 dark:border-white/10`.
A bare `text-white` is invisible in day mode.

Gold is a fill colour, not a text colour: `#ffd700` scores 1.34:1 on the day
background. Use `text-gold-ink` for gold text — it is `#8a6d00` by day (4.71:1)
and the bright gold at night (14.97:1). `bg-gold-primary`, `border-gold-primary`
and friends are registered in the `@theme` block in `app/globals.css`.

`npm run verify:theme` (also part of `npm run build`) enforces both rules: no
bare white on a page that renders on the body background, and no two utilities
setting the same property under the same variant in one `className`.

### Contact Details

Every phone number, email address, location and bank detail on the site comes
from `lib/contact.ts`. Nothing else may hardcode one — `npm run verify:contact`
(also part of `npm run build`) fails the build on a second copy.

| | |
| --- | --- |
| Email | info@okhubtech.com |
| Phone / WhatsApp | +234 906 995 8990 (one number for both) |
| Location | Mokola, Ibadan, Oyo State, Nigeria |
| Bank transfer | OKHUB TECHNOLOGY · Paystack MFB · 0102106463 |

The site previously shipped four conflicting answers, including six mailboxes on
`okhub.tech` — a domain OKHub does not own, so every one of them bounced — and a
second phone number nobody answers. Change a detail in `lib/contact.ts` and every
surface follows.

### Key Modules

- **Frontend**: Hero, About, Education, Solution Center, Domains, Services, E-commerce, Research, Partnerships, Impact, Contact and Innovation showcase components.
- **Backend**: Prisma schema covering users, roles, programs/tracks/courses/projects, enrollments, solutions, commerce (products/orders/payments), research/publications, partners, impact metrics, contact submissions.
- **Auth**: NextAuth with Prisma adapter, credential provider, role-aware middleware guarding `/admin`.
- **SEO & APIs**: Global metadata with OpenGraph/Twitter, dynamic `sitemap.ts`, `app/robots.txt`, `/api/impact` for live metrics, `/api/auth/*` for NextAuth, and the `submitContact` server action powering the on-page collaboration form.
- **Notifications**: `server/contact/actions.ts` uses Prisma + Resend to log collaboration requests and email the studio team when `RESEND_API_KEY` / `EMAIL_FROM` are configured.

### Deployment

Optimized for Vercel (frontend + API routes). Configure environment variables in Vercel dashboard and provision managed Postgres. Use environment-based configs for staging/production.

### Roadmap

- Build admin dashboard (Shadcn UI) for content, program, product, research, and impact management.
- Implement NextAuth signup flows + password hashing, social login (optional).
- Integrate Paystack/Stripe webhooks, Resend email templates, Cloudinary upload APIs.
- Replace static homepage data with Prisma-powered server components.
