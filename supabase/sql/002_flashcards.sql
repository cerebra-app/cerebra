-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)

create table if not exists flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references flashcard_decks(id) on delete cascade,
  front text not null,
  back text not null,
  -- SM-2 spaced repetition state
  repetitions smallint not null default 0,
  ease_factor real not null default 2.5,
  interval_days integer not null default 0,
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table flashcard_decks enable row level security;
alter table flashcards enable row level security;

create policy "flashcard_decks_select_own" on flashcard_decks
  for select using (auth.uid() = user_id);
create policy "flashcard_decks_insert_own" on flashcard_decks
  for insert with check (auth.uid() = user_id);
create policy "flashcard_decks_update_own" on flashcard_decks
  for update using (auth.uid() = user_id);
create policy "flashcard_decks_delete_own" on flashcard_decks
  for delete using (auth.uid() = user_id);

create policy "flashcards_select_own" on flashcards
  for select using (
    exists (select 1 from flashcard_decks d where d.id = deck_id and d.user_id = auth.uid())
  );
create policy "flashcards_insert_own" on flashcards
  for insert with check (
    exists (select 1 from flashcard_decks d where d.id = deck_id and d.user_id = auth.uid())
  );
create policy "flashcards_update_own" on flashcards
  for update using (
    exists (select 1 from flashcard_decks d where d.id = deck_id and d.user_id = auth.uid())
  );
create policy "flashcards_delete_own" on flashcards
  for delete using (
    exists (select 1 from flashcard_decks d where d.id = deck_id and d.user_id = auth.uid())
  );

create index if not exists idx_flashcard_decks_user_id on flashcard_decks(user_id);
create index if not exists idx_flashcards_deck_id on flashcards(deck_id);
create index if not exists idx_flashcards_next_review on flashcards(deck_id, next_review_at);
