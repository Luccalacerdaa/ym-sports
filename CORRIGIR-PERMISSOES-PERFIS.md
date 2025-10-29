# Como corrigir permissões de perfis no Supabase

Este guia explica como aplicar a migração SQL para corrigir as permissões RLS (Row Level Security) da tabela `profiles` no Supabase.

## O problema

Atualmente, estamos enfrentando um erro 403 (Forbidden) ao tentar criar ou atualizar perfis de usuários. Isso ocorre porque as políticas RLS da tabela `profiles` não estão configuradas corretamente.

```
Erro ao criar perfis temporários: Object
code: "42501"
details: null
hint: null
message: "new row violates row-level security policy for table \"profiles\""
```

## A solução

Execute o seguinte SQL no editor SQL do Supabase para corrigir as permissões:

```sql
-- Fix RLS policies for profiles table
-- This migration adds proper RLS policies to allow reading profiles by all authenticated users
-- and allows updating own profile

-- First, enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create policy to allow all authenticated users to view all profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policy to allow service role to update any profile (for our app logic)
CREATE POLICY "Service role can update any profile" 
ON public.profiles FOR ALL 
TO service_role
USING (true);

-- Grant permissions to authenticated users
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
```

## Como executar

1. Acesse o dashboard do Supabase para seu projeto
2. Navegue até "SQL Editor" no menu lateral
3. Cole o SQL acima em uma nova query
4. Clique em "Run" para executar
5. Reinicie o aplicativo para aplicar as mudanças

Após executar este SQL, os usuários poderão ver todos os perfis e atualizar seus próprios perfis, e o sistema poderá criar perfis temporários para usuários que ainda não têm um perfil completo.
