-- Run in Supabase SQL Editor
-- Note: counselors and their availability slots are added manually by an admin
-- via the Supabase Table Editor (or a future admin panel) — there's no
-- self-serve signup flow for counselors in v1.

create table if not exists counselors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  bio text,
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists counselor_slots (
  id uuid primary key default gen_random_uuid(),
  counselor_id uuid not null references counselors(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists counselor_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  counselor_id uuid not null references counselors(id) on delete cascade,
  slot_id uuid not null references counselor_slots(id) on delete cascade unique,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table counselors enable row level security;
alter table counselor_slots enable row level security;
alter table counselor_bookings enable row level security;

-- Anyone signed in can browse active counselors and open slots.
-- No insert/update/delete policies for counselors or slots — those are
-- managed directly by an admin via the Supabase dashboard, not the app.
create policy "counselors_select_active" on counselors
  for select using (is_active = true);

create policy "counselor_slots_select_all" on counselor_slots
  for select using (auth.role() = 'authenticated');

create policy "counselor_bookings_select_own" on counselor_bookings
  for select using (auth.uid() = user_id);
create policy "counselor_bookings_insert_own" on counselor_bookings
  for insert with check (auth.uid() = user_id);
create policy "counselor_bookings_update_own" on counselor_bookings
  for update using (auth.uid() = user_id);

create index if not exists idx_counselor_slots_counselor on counselor_slots(counselor_id, start_time);
create index if not exists idx_counselor_bookings_user on counselor_bookings(user_id);
