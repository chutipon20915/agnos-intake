-- ============================================================================
-- Agnos Patient Realtime — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- ============================================================================

-- One row per patient form session. `form_data` holds the whole form as JSON so
-- the schema never changes when form fields do (fields are defined in the app).
create table if not exists public.patient_sessions (
  id            uuid primary key default gen_random_uuid(),
  status        text not null default 'active'
                  check (status in ('active', 'idle', 'submitted')),
  form_data     jsonb not null default '{}'::jsonb,
  current_field text,                       -- field the patient is editing right now
  last_active_at timestamptz not null default now(),
  submitted_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- Staff dashboard sorts by most-recently-active first.
create index if not exists patient_sessions_last_active_idx
  on public.patient_sessions (last_active_at desc);

-- ----------------------------------------------------------------------------
-- Realtime: broadcast row changes (INSERT / UPDATE / DELETE) to subscribers.
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.patient_sessions;

-- Emit the full row on UPDATE/DELETE so the staff view always has every column.
alter table public.patient_sessions replica identity full;

-- ----------------------------------------------------------------------------
-- Row Level Security.
-- This is an unauthenticated demo (no login), so the anon key needs full access
-- to this single table. In production you would gate staff reads behind auth and
-- scope patient writes to their own session id.
-- ----------------------------------------------------------------------------
alter table public.patient_sessions enable row level security;

drop policy if exists "demo anon read"   on public.patient_sessions;
drop policy if exists "demo anon insert" on public.patient_sessions;
drop policy if exists "demo anon update" on public.patient_sessions;

create policy "demo anon read"   on public.patient_sessions for select using (true);
create policy "demo anon insert" on public.patient_sessions for insert with check (true);
create policy "demo anon update" on public.patient_sessions for update using (true) with check (true);
