# Agnos Intake — Realtime Patient Portal

A responsive **patient intake form** synchronized in **real time** with a **staff dashboard**. As a patient types, every keystroke, focus change, and submission appears instantly on the staff side — no refresh, no polling.

Built for the Agnos front-end assignment.

- **Live demo:** <https://agnos-intake.vercel.app>
- **Patient form:** <https://agnos-intake.vercel.app/patient>
- **Staff dashboard:** <https://agnos-intake.vercel.app/staff>
- **Repository:** <https://github.com/chutipon20915/agnos-intake>

---

## ✨ Features

### Core requirements

- **Patient Form** — all required fields (First / Middle / Last name, Date of birth, Gender, Phone, Email, Address, Preferred language, Nationality, Emergency contact, Religion) with client-side **validation** (required fields, real phone-number validation via `libphonenumber-js`, email format).
- **Staff View** — every field mirrors the patient form **live**.
- **Status indicators** — each patient shows as **Typing… / Active / Idle / Submitted / Offline**, exactly as required ("submitted, actively filling in, or inactive").
- **Real-time sync** — Supabase Realtime (Postgres change-streams + Broadcast + Presence).
- **Responsive** — mobile-first patient form; the staff dashboard adapts from a single column on mobile to a rich grid on desktop.

### Bonus features

- **Field-level typing indicator** — the staff view highlights the exact field the patient is editing right now and flashes fields as they change.
- **Multi-patient dashboard** — staff see a live list of every session with search + filter (All / Live / Submitted) and summary stat tiles.
- **Two-layer sync** — instant per-keystroke Broadcast layered over durable Postgres writes, so the view is both instant *and* correct after a reconnect/refresh.
- **Presence detection** — the detail view knows whether the patient is still connected.
- **Light / dark mode** — with no flash of the wrong theme on load.
- **Polished states** — loading skeletons, empty states, connection-health pill, completion progress bars, form success screen.
- **Accessibility** — labelled inputs, keyboard focus rings, `prefers-reduced-motion` support.

---

## 🧱 Tech stack

| Concern | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router) + **TypeScript** |
| Styling | **TailwindCSS v4** |
| Real-time + storage | **Supabase** (Postgres + Realtime) |
| Forms & validation | react-hook-form + **zod** + libphonenumber-js |
| Icons | lucide-react |
| Hosting | **Vercel** (frontend) + Supabase (managed backend) |

> **Why Supabase instead of a hand-rolled WebSocket server?** Vercel/Netlify are serverless and can't host a long-lived WebSocket process. Supabase Realtime provides managed WebSocket channels **and** persistence, so the app deploys cleanly to Vercel while still giving durable, reconnect-safe sync. See [`docs/realtime-flow.md`](docs/realtime-flow.md).

---

## 🚀 Getting started

### 1. Prerequisites

- Node.js 18.18+ (developed on Node 22)
- A free [Supabase](https://supabase.com) project

### 2. Create the database

In your Supabase project: **SQL Editor → New query**, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
`patient_sessions` table, enables Realtime on it, and adds the demo access policies.

### 3. Configure environment

Copy the example and fill in your project's values (**Project Settings → API**):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

> The anon key is a **public** key and is safe to expose in a browser app; access is controlled by Row Level Security.

### 4. Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. To see the sync: open **`/patient`** in one window and **`/staff`** in another, then start typing.

---

## ☁️ Deployment (Vercel)

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables.
4. Deploy. No extra configuration is required — the Supabase project is already live.

---

## 📚 Documentation

| Document | What's inside |
| --- | --- |
| [Project Structure](docs/project-structure.md) | Folder/file layout and why it's organized this way |
| [Design](docs/design.md) | UI/UX decisions across screen sizes |
| [Component Architecture](docs/component-architecture.md) | Main components, hooks, and their responsibilities |
| [Real-Time Sync Flow](docs/realtime-flow.md) | How updates are handled and synchronized |

---

## 🗂️ Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```
