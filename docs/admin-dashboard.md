# Admin Dashboard Architecture

The admin surface follows a modular layout so role-based widgets can scale without rewriting navigation. All routes are gated behind the middleware and require the `ADMIN` role.

## Layout

- **Sidebar**: Sticky on desktop, collapsible on mobile. Primary navigation groups: Studio Overview, Education, Solution Center, Commerce, Research, Partnerships, Impact, Communications, Settings.
- **Top bar**: Surface environment badge, search, quick actions, and user menu.
- **Content region**: Server components streaming metrics, tables, and forms backed by Prisma actions/Shadcn UI primitives.

## Route Map

| Path | Purpose |
| --- | --- |
| `/admin` | Overview dashboard with KPIs and quick links. |
| `/admin/programs` | Manage programs, tracks, courses, and projects. |
| `/admin/solutions` | CRUD for solution categories and case studies. |
| `/admin/store` | Product, inventory, and order management. |
| `/admin/research` | Research projects, publications, prototypes. |
| `/admin/partners` | Partner profiles and collaboration requests. |
| `/admin/impact` | Impact metrics editor. |
| `/admin/communications` | Contact submissions, forms, notifications. |
| `/admin/settings` | Roles, environment config, API keys, audit logs. |

## Components

- `AdminSidebar` — receives nav data and highlights active route.
- `AdminTopbar` — environment badge, global search, user dropdown.
- `StatCard`, `DataTable`, `ResourceForm` — reusable Shadcn-based UI for metrics, lists, and forms (to be scaffolded).

## Data & Permissions

- All pages fetch via server actions using Prisma to ensure SSR + caching control.
- RBAC helper will check `session.user.roles` to allow/deny actions.
- Audit logs stored via Prisma middleware once mutation patterns are finalized.

## Next Steps

1. Build `/admin/page.tsx` overview with placeholder metrics.
2. Implement navigation shell (sidebar/topbar) with responsive behavior.
3. Wire key routes incrementally, starting with Programs and Store.
4. Add admin-only API routes/server actions for CRUD operations.
