# Component Architecture

The app is composed of small, single-purpose units. Components render; hooks own
real-time state; `lib/` holds pure logic.

## Data flow at a glance

```
              lib/fields.ts  (one field registry)
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
  PatientForm                SessionDetailView / SessionCard
  (writes)                   (read-only mirror)
        │                        ▲
        ▼                        │
  useSessionSync ─────────────►  useSessionDetail / useSessionsRealtime
        │        Supabase Realtime         │
        └──────────► Postgres ◄────────────┘
                     (patient_sessions)
```

## Components

### UI primitives (`components/ui/`)
- **SiteHeader** — sticky bar with logo, nav, and theme toggle. Accepts a `right`
  slot for page-specific controls.
- **StatusBadge** — renders a `DisplayStatus` using the shared `STATUS_META`
  styling map (pulsing dot for "typing").
- **ConnectionIndicator** — realtime connection health (connecting / live /
  reconnecting / error).
- **SetupBanner** — shown when Supabase env vars are missing so the app never
  hard-crashes and the reviewer knows exactly what to do.
- **ThemeToggle / Logo** — self-explanatory.

### Patient (`components/patient/`)
- **PatientForm** — orchestrates everything on the patient side:
  - `react-hook-form` + `zodResolver(patientFormSchema)` for state & validation.
  - Maps over `FORM_SECTIONS` to render `FormField`s.
  - Wires each field's change/focus/blur to `useSessionSync`.
  - Shows a completion progress bar and a success screen after submit.
- **FormField** — renders one input/select/textarea from a `FieldDef`. Composes
  react-hook-form's handlers with the live-sync callbacks so RHF keeps its own
  state while every keystroke is also broadcast.

### Staff (`components/staff/`)
- **StaffDashboard** — subscribes via `useSessionsRealtime`, derives each row's
  status with `deriveStatus`, and provides stat tiles, filter tabs, search,
  loading skeletons, and empty states.
- **SessionCard** — one dashboard row: avatar, name, status badge, required-field
  progress, "last active", and the field currently being edited.
- **SessionDetailView** — full live view of one patient via `useSessionDetail`.
  Header (name, status, presence, connection, progress) + mirrored field grid.
- **LiveField** — read-only field that highlights on focus and flashes on change.

## Hooks (real-time engine)

| Hook | Side | Responsibility |
| --- | --- | --- |
| `useSessionSync` | Patient | Create/reuse the session row, write debounced updates to Postgres, broadcast keystrokes/focus, track presence, submit. |
| `useSessionsRealtime` | Staff list | Load all sessions and keep them live via Postgres change-streams. |
| `useSessionDetail` | Staff detail | Merge durable Postgres data with instant Broadcast values + Presence for one session. |
| `useNow` | Both | A 1s ticking clock so derived status ("active" → "idle") updates over time. |

## Pure logic (`lib/`)

- **fields.ts** — the field registry (`FORM_SECTIONS`, `ALL_FIELDS`, labels).
- **validation.ts** — the zod schema + real phone validation.
- **status.ts** — `deriveStatus(row, { focusedField, online, now })` and the
  status → styling map. This is where "is the patient typing?" is decided.
- **utils.ts** — `cn`, `timeAgo`, `displayName`, `initials`, `countFilled`.

Keeping status derivation and validation as pure functions means they can be
unit-tested without React or Supabase.
