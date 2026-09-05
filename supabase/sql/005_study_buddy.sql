-- Run in Supabase SQL Editor

-- Privacy toggle on profiles for hiding university in Study Buddy
alter table profiles add column if not exists hide_university boolean not null default false;

create table if not exists study_buddy_rooms (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists study_buddy_members (
  room_id uuid not null references study_buddy_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists study_buddy_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references study_buddy_rooms(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table study_buddy_rooms enable row level security;
alter table study_buddy_members enable row level security;
alter table study_buddy_messages enable row level security;

-- Rooms are publicly browsable/searchable by any signed-in user
create policy "study_buddy_rooms_select_all" on study_buddy_rooms
  for select using (auth.role() = 'authenticated');
create policy "study_buddy_rooms_insert_own" on study_buddy_rooms
  for insert with check (auth.uid() = creator_id);

-- Membership rows are visible to everyone (needed for member counts),
-- but you can only add/remove yourself
create policy "study_buddy_members_select_all" on study_buddy_members
  for select using (auth.role() = 'authenticated');
create policy "study_buddy_members_insert_self" on study_buddy_members
  for insert with check (auth.uid() = user_id);
create policy "study_buddy_members_delete_self" on study_buddy_members
  for delete using (auth.uid() = user_id);

-- Messages only readable/postable by members of that room
create policy "study_buddy_messages_select_members" on study_buddy_messages
  for select using (
    exists (
      select 1 from study_buddy_members m
      where m.room_id = study_buddy_messages.room_id and m.user_id = auth.uid()
    )
  );
create policy "study_buddy_messages_insert_members" on study_buddy_messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from study_buddy_members m
      where m.room_id = study_buddy_messages.room_id and m.user_id = auth.uid()
    )
  );

create index if not exists idx_study_buddy_members_room on study_buddy_members(room_id);
create index if not exists idx_study_buddy_messages_room on study_buddy_messages(room_id, created_at);

-- Enable realtime for live message delivery
alter publication supabase_realtime add table study_buddy_messages;
