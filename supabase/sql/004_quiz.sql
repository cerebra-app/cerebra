-- Run in Supabase SQL Editor

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index smallint not null,
  explanation text,
  created_at timestamptz not null default now()
);

alter table quizzes enable row level security;
alter table quiz_questions enable row level security;

create policy "quizzes_select_own" on quizzes
  for select using (auth.uid() = user_id);
create policy "quizzes_insert_own" on quizzes
  for insert with check (auth.uid() = user_id);
create policy "quizzes_delete_own" on quizzes
  for delete using (auth.uid() = user_id);

create policy "quiz_questions_select_own" on quiz_questions
  for select using (
    exists (select 1 from quizzes q where q.id = quiz_id and q.user_id = auth.uid())
  );
create policy "quiz_questions_insert_own" on quiz_questions
  for insert with check (
    exists (select 1 from quizzes q where q.id = quiz_id and q.user_id = auth.uid())
  );

create index if not exists idx_quizzes_user_id on quizzes(user_id);
create index if not exists idx_quiz_questions_quiz_id on quiz_questions(quiz_id);
