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
- `npm run prisma:generate` — regenerate Prisma client
- `npm run prisma:migrate` — run migrations in dev
- `npm run prisma:seed` — seed roles + bootstrap admin account

### Authentication & Roles

- Credentials auth powered by NextAuth + Prisma adapter; login UI lives at `/login`.
- Seed script creates all roles and an admin account using `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults `admin@okhub.tech` / `ChangeMe123!`). Update these in `.env.local` before running `npm run prisma:seed` in production environments.
- Registration form defaults to Student role; promote users by attaching roles via admin dashboard or Prisma.

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
