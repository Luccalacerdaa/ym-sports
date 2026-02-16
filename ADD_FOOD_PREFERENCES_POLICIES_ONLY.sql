-- Script para adicionar APENAS as políticas RLS faltantes
-- Execute este script no Supabase Dashboard > SQL Editor
-- Não recria tabelas, apenas adiciona políticas

-- Remover políticas antigas se existirem (para evitar conflito)
DROP POLICY IF EXISTS "Users can view their own food preferences" ON public.user_food_preferences;
DROP POLICY IF EXISTS "Users can insert their own food preferences" ON public.user_food_preferences;
DROP POLICY IF EXISTS "Users can update their own food preferences" ON public.user_food_preferences;
DROP POLICY IF EXISTS "Users can delete their own food preferences" ON public.user_food_preferences;

-- Criar políticas RLS para user_food_preferences
CREATE POLICY "Users can view their own food preferences" 
ON public.user_food_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food preferences" 
ON public.user_food_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food preferences" 
ON public.user_food_preferences FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food preferences" 
ON public.user_food_preferences FOR DELETE 
USING (auth.uid() = user_id);

-- Verificar se RLS está habilitado (deve estar, mas garantindo)
ALTER TABLE public.user_food_preferences ENABLE ROW LEVEL SECURITY;
