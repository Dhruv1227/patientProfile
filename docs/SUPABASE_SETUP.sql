create table if not exists public.portal_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portal_state enable row level security;

comment on table public.portal_state is
  'Stores the CareBridge portal state JSON used by the Express backend.';

comment on column public.portal_state.state is
  'Full portal data snapshot: users, departments, patients, appointments, messages, transfers, admin requests, and audit logs.';
