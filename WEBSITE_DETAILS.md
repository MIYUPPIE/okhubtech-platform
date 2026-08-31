# OKHub Technology Website — Detailed Documentation

## 1. Executive Overview
- **Purpose:** Premium marketing site for OKHub Technology highlighting Fourth Industrial Revolution leadership across AI, robotics, immersive web, and data services.
- **Experience Goals:** Luxury gold/black palette, cinematic 3D hero visuals, persuasive storytelling, and responsive layout optimized for enterprise buyers.
- **Entry Points:** Primary landing page (`src/app/page.tsx`), service vertical pages (`/ai`, `/web`, `/data`, `/robotics`, `/services`), credibility sections (portfolio, about), and a high-conversion contact form with API handler.

## 2. Technology Stack & Key Dependencies
| Layer | Details |
| --- | --- |
| Framework | Next.js App Router (React 18+, TypeScript) with file-based routing. |
| Styling | Tailwind CSS + custom utilities (`app/globals.css`), gradient helpers, `text-gradient` class, and responsive layout primitives. |
| Fonts | Inter and Poppins loaded via `next/font` in `src/app/layout.tsx`.
| Motion | Framer Motion for staggered entrances, hover/tap micro-interactions, and layout transitions. |
| Icons | Lucide React icon set for consistent line icons across cards, stats, and navigation. |
| 3D / WebGL | Three.js via `@react-three/fiber` & `@react-three/drei`; custom shaders/materials inside `Scene3DAdvanced.tsx` and `InnovationSection.tsx`. |
| UI Utilities | Custom components in `src/components/ui/` (Spotlight, CardHoverEffect, TextGenerateEffect, WavyBackground). |
| Backend | Next.js Route Handler `src/app/api/contact/route.ts` to process contact form submissions with validation and simulated persistence.

## 3. Application Composition
- **Root Layout (`src/app/layout.tsx`):** Sets HTML scaffolding, registers Inter/Poppins CSS variables, and establishes black background + gold selection styling.
- **Global Loading State (`src/app/page.tsx`):** Shows `LoadingScreen` for 3 seconds on first render, then renders `Header`, landing sections, and `Footer`.
- **Folder Structure:**
  - `src/components/` for shared UI blocks.
  - `src/app/<route>/page.tsx` for each routed page.
  - `src/app/api/` for serverless endpoints.

## 4. Theming & UI System
- **Color System:** Gold gradients (#FFD700, #F7B801, #CC9900) on deep blacks (#000000, #050505). Semi-transparent borders (`border-white/10`) produce glassmorphism.
- **Typography:** Display headlines use Poppins in `font-display` class, while Inter covers body copy.
- **Utility Classes:** Reusable button classes (`btn-primary`, `btn-secondary`) and gradient text helper (`text-gradient`) defined globally ensure consistent CTAs.
- **Motion Guidelines:** Each major section fades or slides with Framer Motion, often gated by `whileInView` for scroll performance.

## 5. Shared Experience Components
| Component | File | Highlights |
| --- | --- | --- |
| `Header` | `src/components/Header.tsx` | Sticky nav with scroll-aware styling, dropdown for service subroutes, mobile slide-out menu, CTA button. |
| `HeroSection` | `src/components/HeroSection.tsx` | Spotlight effects, animated headline reveal, KPI stats, visual panel summarizing an active program, trusted brand marquee. |
| `ServicesSection` | `src/components/ServicesSection.tsx` | Narrative column describing pillars + interactive grid from `HoverEffect` for 9 capabilities. |
| `InnovationSection` | `src/components/InnovationSection.tsx` | WavyBackground wrapper, four innovation cards each embedding a live 3D Canvas (DNA helix, food cylinder, energy torus, AI genome). |
| `Scene3DAdvanced` | `src/components/Scene3DAdvanced.tsx` | Full-screen Canvas with animated particles and floating geometries for use as decorative backgrounds. |
| `Footer` | `src/components/Footer.tsx` | Newsletter form, social links, multi-column sitemap, and legal links. |
| `LoadingScreen` | `src/components/LoadingScreen.tsx` | Branded preloader with animated gradient blobs, progress bar, and floating particles. |

## 6. Main Pages
### 6.1 Home (`src/app/page.tsx`)
1. **Hero:** Messaging on “Pioneering the Fourth Industrial Revolution”, stat blocks, dual CTA buttons, trusted brands row.
2. **Services Overview:** Strategy narrative + modular services grid.
3. **Innovation Spotlights:** Four future-tech showcases with interactive Three.js models.
4. **Footer:** Global CTA, navigation, contact info, and policies.

### 6.2 About (`src/app/about/page.tsx`)
- Hero narrative describing OKHub history and mission.
- Stats grid (years, projects, clients, team size).
- Story/mission split layout with CTA.
- Values grid (Innovation, Quality, Global Impact, Growth).
- Leadership section with four bios.
- Final CTA encouraging engagement.

### 6.3 Services (`src/app/services/page.tsx`)
- High-level intro followed by 6 detailed cards (Web, Data, AI/ML, 3D, Robotics, CV/NLP).
- Each card lists descriptive copy, feature checklist, pricing baseline, and timeline.
- Closing CTA stripes for “Start Your Project” or “Schedule Consultation”.

### 6.4 Specialized Verticals
| Route | Focus | Structure |
| --- | --- | --- |
| `/ai` (`src/app/ai/page.tsx`) | AI & ML practice. | Hero with stats, 6 offering cards, benefits grid, development process, CTA section. |
| `/data` (`src/app/data/page.tsx`) | Data science & analytics. | Hero, impact stats, 6 service cards, industries grid, 5-step data process, tooling grid, benefits. |
| `/web` (`src/app/web/page.tsx`) | Web engineering. | Hero stats, service grid, technology stack grid, value props, 4-step delivery process, CTA. |
| `/robotics` (`src/app/robotics/page.tsx`) | Robotics & automation. | Hero metrics, robotics service catalog, applications, tech stack, 6-step development flow. |

### 6.5 Portfolio (`src/app/portfolio/page.tsx`)
- Filterable categories (state-managed via `useState`).
- Project cards with client, stack, outcomes, and CTA to open modal.
- Modal surfaces detailed features, technologies, and measurable results.

### 6.6 Contact (`src/app/contact/page.tsx`)
- Hero establishing credibility metrics.
- Split layout: animated contact form + contact info list.
- Form collects name, email, company, service, subject, message; uses client-side fetch to `/api/contact` with success/error toasts.
- Support card for urgent assistance.

## 7. 3D & Motion Systems
- **Spotlight & WavyBackground:** Provide layered lighting and wave shaders to reinforce premium feel.
- **Innovation 3D Canvases:** Each card renders a unique scene (DNA Helix, 3D nutrition cylinder, energy torus) using `Canvas`, `Float`, `MeshTransmissionMaterial`, and animated rotations.
- **Scene3DAdvanced:** Independent Canvas with thousands of animated particles and floating geometries; can overlay hero/section backgrounds.
- **Framer Motion Patterns:** Headlines/comps animate sequentially, buttons use `whileHover`/`whileTap`, and dropdowns rely on `AnimatePresence` for smooth entry/exit.

## 8. Data & API Flow
- **Contact Form Submission:**
  1. Client form (`contact/page.tsx`) POSTs JSON to `/api/contact`.
  2. Route handler validates required fields + email format, simulates persistence, and responds with success/failure JSON.
  3. UI updates `submitStatus` to show green success banner or red error banner; loader state prevents duplicate submissions.
- **Future Integrations:** Placeholder comments in `route.ts` outline where to plug DB storage, email notifications, or CRM syncing.

## 9. Accessibility & Responsiveness
- All sections use semantic headings and ARIA-friendly buttons (e.g., mobile menu toggles have `aria-label`).
- Layouts leverage responsive grids (`grid-cols-1 md:grid-cols-2 ...`) ensuring mobile-first behavior.
- Contrast maintained via gold on black palette; focus states rely on Tailwind focus utilities.

## 10. Development & Deployment Notes
- **Local Dev:** `npm run dev` (Next.js dev server at `http://localhost:3000`).
- **Build Targets:** Standard Next.js build pipeline; 3D assets are procedural so no external loaders required.
- **Fonts & Icons:** Served via Next.js font optimizer and tree-shaken Lucide icons.
- **Hosting:** Optimized for Vercel (per default README) but equally deployable to any Node-capable platform.

## 11. Suggested Next Steps
1. Wire contact API to a real notification pipeline (email, Slack, CRM).
2. Add CMS or data sources for services/projects to avoid hardcoded arrays.
3. Expand automated testing for components with critical interactions (navigation, forms, modals).
4. Implement analytics + consent banner for production readiness.

This document should give any contributor or stakeholder a complete understanding of how the OKHub Technology website is structured, styled, and animated, along with guidance for extending it safely.
