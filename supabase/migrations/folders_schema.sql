-- Create Folders Table
create table public.folders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  parent_id uuid references public.folders(id) on delete cascade,
  user_id uuid references auth.users(id) not null
);

-- Enable RLS for Folders
alter table public.folders enable row level security;

create policy "Users can view their own folders" on public.folders
  for select using (auth.uid() = user_id);

create policy "Users can insert their own folders" on public.folders
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own folders" on public.folders
  for update using (auth.uid() = user_id);

create policy "Users can delete their own folders" on public.folders
  for delete using (auth.uid() = user_id);

-- Update Notes Table to support folders
alter table public.notes add column parent_folder_id uuid references public.folders(id) on delete set null;
