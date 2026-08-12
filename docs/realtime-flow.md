# Real-Time Synchronization Flow

## The core idea: two layers

A naïve implementation writes every keystroke to the database and has staff read
it back. That's either **laggy** (debounced DB round-trips) or **abusive** (a DB
write per character). This app splits the problem in two:

| Layer | Transport | Carries | Property |
| --- | --- | --- | --- |
| **Instant** | Supabase **Broadcast** | every keystroke + focus changes | low-latency, ephemeral |
| **Durable** | Supabase **Postgres** change-streams | committed field values + status | survives refresh/reconnect |
| **Liveness** | Supabase **Presence** | is the patient connected? | online/offline |

The staff detail view renders **durable data with the instant layer overlaid on
top**, so it is *immediate* while typing and *correct* after any reconnect.

## Channels

- **`session:{id}`** — one channel per patient session. The patient publishes
  `field_input` and `field_focus` broadcasts and tracks presence as `role:patient`.
  The staff detail view subscribes to the same channel.
- **`staff:sessions`** — a single channel carrying Postgres `*` changes on
  `patient_sessions`, powering the dashboard list.
- **`presence:patients`** — a global presence channel every patient joins while
  their form is open. The dashboard reads its presence state to know who is
  **online right now** (tab open), so "Active/online" doesn't depend on typing.

## Resuming a session

The active session id is kept in the patient URL as `?sid=…` (not tab-local
storage). A refresh, a bookmarked link, or a link copied by staff ("Copy patient
link") all resume the **same** session and its saved values — on any device.

## Patient → Staff sequence

```
Patient types in "First name"
      │
      ├─(1) broadcast field_input {field, value}  ──► session:{id} ──► Staff detail (instant overlay)
      │
      ├─(2) mark current_field = "firstName"
      │
      └─(3) debounced ~450ms
             └─ UPDATE patient_sessions SET form_data, current_field,
                        last_active_at = now(), status = 'active'
                   │
                   └─ Postgres change-stream ──► Staff list  (SessionCard updates)
                                             └─► Staff detail (durable value confirmed)

Patient clicks Submit
      └─ UPDATE ... SET status = 'submitted', submitted_at = now()
             └─ change-stream ──► both staff views flip to "Submitted"
```

## Deriving display status

The database only stores a coarse `status` (`active | idle | submitted`). The
richer indicator the assignment asks for ("submitted / actively filling in /
inactive") is computed on the client by `deriveStatus()`:

```
if submitted_at              → "Submitted"
else if presence == offline  → "Offline"        (detail view only)
else if focused && active<6s → "Typing…"        (actively filling in)
else if active < 25s         → "Active"
else                         → "Idle"           (inactive)
```

Because a `useNow()` clock ticks every second, a patient who stops typing
transitions Active → Idle on their own, with no event needed.

## Resilience

- **Reconnect:** if the WebSocket drops, the connection pill shows
  "Reconnecting"; Supabase auto-rejoins the channel, and because durable values
  live in Postgres, the staff view re-hydrates correctly on the next read.
- **Refresh:** the patient's session id is kept in `sessionStorage`, so a refresh
  resumes the same session and re-loads saved values.
- **Late-joining staff:** when a staff member opens a session, they first `SELECT`
  the current row (durable snapshot), then subscribe — so they never miss state
  that was set before they joined.
- **Graceful degradation:** if broadcast is unavailable, the durable Postgres
  layer alone still syncs within the debounce window (~450ms).

## Why not a raw WebSocket server?

The assignment allows "WebSockets **or any suitable real-time technology**."
Vercel/Netlify are serverless and cannot host a persistent WebSocket server.
Supabase Realtime provides managed WebSocket channels **plus** persistence and
presence, which is why it fits a Vercel deployment cleanly while still satisfying
the real-time requirement.
