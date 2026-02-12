-- SCRIPT ROBUSTO PARA CORREGIR LA BASE DE DATOS
-- Ejecutar en Supabase SQL Editor

-- 1. Asegurar que las tablas existen (SI NO EXISTEN)
CREATE TABLE IF NOT EXISTS folders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  user_id uuid references auth.users not null
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  content text,
  folder_id uuid references folders on delete cascade,
  user_id uuid references auth.users not null
);

-- 2. Asegurar que RLS está activo
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 3. Borrar políticas antiguas para evitar duplicados
DROP POLICY IF EXISTS "Users can view their own folders." ON folders;
DROP POLICY IF EXISTS "Users can insert their own folders." ON folders;
DROP POLICY IF EXISTS "Users can update their own folders." ON folders;
DROP POLICY IF EXISTS "Users can delete their own folders." ON folders;

DROP POLICY IF EXISTS "Users can view their own notes." ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes." ON notes;
DROP POLICY IF EXISTS "Users can update their own notes." ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes." ON notes;

-- 4. Re-crear políticas de seguridad
CREATE POLICY "Users can view their own folders." ON folders FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Users can insert their own folders." ON folders FOR INSERT WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Users can update their own folders." ON folders FOR UPDATE USING ( auth.uid() = user_id );
CREATE POLICY "Users can delete their own folders." ON folders FOR DELETE USING ( auth.uid() = user_id );

CREATE POLICY "Users can view their own notes." ON notes FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Users can insert their own notes." ON notes FOR INSERT WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Users can update their own notes." ON notes FOR UPDATE USING ( auth.uid() = user_id );
CREATE POLICY "Users can delete their own notes." ON notes FOR DELETE USING ( auth.uid() = user_id );
