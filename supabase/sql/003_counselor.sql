-- Run in Supabase SQL Editor

create table if not exists counselor_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preferred_time text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table counselor_requests enable row level security;

create policy "counselor_requests_select_own" on counselor_requests
  for select using (auth.uid() = user_id);
create policy "counselor_requests_insert_own" on counselor_requests
  for insert with check (auth.uid() = user_id);

create index if not exists idx_counselor_requests_user_id on counselor_requests(user_id);
