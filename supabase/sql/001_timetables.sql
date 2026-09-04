-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)

create table if not exists timetables (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('personal', 'standard')),
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists timetable_entries (
  id uuid primary key default gen_random_uuid(),
  timetable_id uuid not null references timetables(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday ... 6 = Saturday
  start_time time not null,
  end_time time, -- optional
  title text not null,
  location text,
  created_at timestamptz not null default now()
);

alter table timetables enable row level security;
alter table timetable_entries enable row level security;

-- timetables: user can only see/manage their own
create policy "timetables_select_own" on timetables
  for select using (auth.uid() = user_id);
create policy "timetables_insert_own" on timetables
  for insert with check (auth.uid() = user_id);
create policy "timetables_update_own" on timetables
  for update using (auth.uid() = user_id);
create policy "timetables_delete_own" on timetables
  for delete using (auth.uid() = user_id);

-- timetable_entries: scoped via the parent timetable's ownership
create policy "timetable_entries_select_own" on timetable_entries
  for select using (
    exists (select 1 from timetables t where t.id = timetable_id and t.user_id = auth.uid())
  );
create policy "timetable_entries_insert_own" on timetable_entries
  for insert with check (
    exists (select 1 from timetables t where t.id = timetable_id and t.user_id = auth.uid())
  );
create policy "timetable_entries_update_own" on timetable_entries
  for update using (
    exists (select 1 from timetables t where t.id = timetable_id and t.user_id = auth.uid())
  );
create policy "timetable_entries_delete_own" on timetable_entries
  for delete using (
    exists (select 1 from timetables t where t.id = timetable_id and t.user_id = auth.uid())
  );

create index if not exists idx_timetables_user_id on timetables(user_id);
create index if not exists idx_timetable_entries_timetable_id on timetable_entries(timetable_id);
