-- Adicionar políticas RLS para user_food_preferences
-- Execute este script no Supabase Dashboard > SQL Editor

-- Políticas para preferências alimentares
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
