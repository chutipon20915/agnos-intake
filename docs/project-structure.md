# Project Structure

The project follows the Next.js App Router convention with a clear separation
between **routes** (`app/`), **presentation** (`components/`), **stateful
real-time logic** (`hooks/`), and **pure domain logic** (`lib/`).

```
Agnos/
├─ src/
│  ├─ app/                      # Routes (App Router)
│  │  ├─ layout.tsx             # Root layout: fonts, metadata, no-flash theme script
│  │  ├─ page.tsx               # Landing page (explains the app, links to both views)
│  │  ├─ globals.css            # Tailwind v4 theme tokens + light/dark palette
│  │  ├─ patient/
│  │  │  └─ page.tsx            # Patient form route
│  │  └─ staff/
│  │     ├─ page.tsx            # Staff dashboard (list of sessions)
│  │     └─ [sessionId]/
│  │        └─ page.tsx         # Live detail view for one patient
│  │
│  ├─ components/
│  │  ├─ ui/                    # Reusable, presentational primitives
│  │  │  ├─ SiteHeader.tsx      #   sticky top bar + nav + theme toggle
│  │  │  ├─ Logo.tsx
│  │  │  ├─ ThemeToggle.tsx
│  │  │  ├─ StatusBadge.tsx     #   Typing / Active / Idle / Submitted / Offline pill
│  │  │  ├─ ConnectionIndicator.tsx
│  │  │  └─ SetupBanner.tsx
│  │  ├─ patient/
│  │  │  ├─ PatientForm.tsx     # Form orchestration (react-hook-form + zod + sync)
│  │  │  └─ FormField.tsx       # One field, driven by the field registry
│  │  └─ staff/
│  │     ├─ StaffDashboard.tsx  # List + stats + filters + search + states
│  │     ├─ SessionCard.tsx     # One row in the dashboard
│  │     ├─ SessionDetailView.tsx
│  │     └─ LiveField.tsx       # Read-only mirrored field with focus + flash
│  │
│  ├─ hooks/                    # Real-time engine (client-only)
│  │  ├─ useSessionSync.ts      # Patient side: writes + broadcast + presence
│  │  ├─ useSessionsRealtime.ts # Staff list: Postgres change-streams
│  │  ├─ useSessionDetail.ts    # Staff detail: DB + broadcast + presence merged
│  │  └─ useNow.ts              # Ticking clock for derived status / relative time
│  │
│  └─ lib/                      # Framework-agnostic domain logic (easy to test)
│     ├─ fields.ts              # SINGLE SOURCE OF TRUTH for form fields
│     ├─ validation.ts          # zod schema + phone validation
│     ├─ status.ts              # deriveStatus() + status styling metadata
│     ├─ types.ts               # Shared TypeScript types
│     ├─ utils.ts               # cn(), timeAgo(), initials(), etc.
│     └─ supabase/
│        └─ client.ts           # Singleton browser Supabase client
│
├─ supabase/
│  └─ schema.sql                # Table + Realtime + RLS setup
├─ docs/                        # This documentation
├─ .env.example                # Required environment variables
└─ README.md
```

## Guiding principles

- **One source of truth for fields.** `lib/fields.ts` defines every field once
  (label, type, required, options, grid span). Both the patient form and the
  staff mirror render from it, so the two interfaces can never drift apart.
- **Logic out of components.** All real-time behaviour lives in `hooks/`, and all
  pure rules (validation, status derivation) live in `lib/`. Components stay
  declarative and easy to read.
- **Client-first.** There is no custom Next.js API layer — the browser talks to
  Supabase directly over authenticated WebSocket channels. This keeps the
  deployment a single static/edge frontend on Vercel.
