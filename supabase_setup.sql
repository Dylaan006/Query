-- 1. Crear tabla de CARPETAS
create table folders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  user_id uuid references auth.users not null
);

-- 2. Crear tabla de NOTAS
create table notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  content text,
  folder_id uuid references folders on delete cascade,
  user_id uuid references auth.users not null
);

-- 3. Activar Seguridad (Row Level Security)
alter table folders enable row level security;
alter table notes enable row level security;

-- 4. Políticas de seguridad para CARPETAS (solo el dueño puede ver/editar)
create policy "Users can view their own folders."
  on folders for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own folders."
  on folders for insert
  with check ( auth.uid() = user_id );
  
create policy "Users can update their own folders."
  on folders for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own folders."
  on folders for delete
  using ( auth.uid() = user_id );

-- 5. Políticas de seguridad para NOTAS
create policy "Users can view their own notes."
  on notes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own notes."
  on notes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own notes."
  on notes for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own notes."
  on notes for delete
  using ( auth.uid() = user_id );
