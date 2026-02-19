-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, service_role;

-- Habits Table
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  color text,
  icon text,
  user_id uuid references auth.users(id),
  is_archived boolean default false
);

alter table public.habits enable row level security;

create policy "Users can view their own habits" on public.habits
  for select using (auth.uid() = user_id);

create policy "Users can insert their own habits" on public.habits
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own habits" on public.habits
  for update using (auth.uid() = user_id);

create policy "Users can delete their own habits" on public.habits
  for delete using (auth.uid() = user_id);

-- Habit Logs Table
create table public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  date date not null,
  completed boolean default true,
  unique(habit_id, date)
);

alter table public.habit_logs enable row level security;

create policy "Users can view their own habit logs" on public.habit_logs
  for select using (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can insert their own habit logs" on public.habit_logs
  for insert with check (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can update their own habit logs" on public.habit_logs
  for update using (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

-- Notes Table
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text,
  title text,
  user_id uuid references auth.users(id)
);

alter table public.notes enable row level security;

create policy "Users can view their own notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on public.notes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notes" on public.notes
  for delete using (auth.uid() = user_id);
