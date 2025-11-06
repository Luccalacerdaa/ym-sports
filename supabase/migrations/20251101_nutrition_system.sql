-- Tabela de planos nutricionais
CREATE TABLE public.nutrition_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goals TEXT[] NOT NULL,
  complexity_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nutritional_advice TEXT,
  hydration_tips TEXT
);

-- Tabela de dias do plano
CREATE TABLE public.nutrition_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES public.nutrition_plans(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  water_intake INTEGER NOT NULL,
  total_calories INTEGER NOT NULL,
  total_protein FLOAT NOT NULL,
  total_carbs FLOAT NOT NULL,
  total_fat FLOAT NOT NULL
);

-- Tabela de refeições
CREATE TABLE public.nutrition_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID REFERENCES public.nutrition_days(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  total_calories INTEGER NOT NULL,
  total_protein FLOAT NOT NULL,
  total_carbs FLOAT NOT NULL,
  total_fat FLOAT NOT NULL,
  notes TEXT,
  preparation_time TEXT
);

-- Tabela de alimentos
CREATE TABLE public.nutrition_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES public.nutrition_meals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  portion TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein FLOAT NOT NULL,
  carbs FLOAT NOT NULL,
  fat FLOAT NOT NULL,
  preparation TEXT,
  alternatives TEXT[],
  image_url TEXT
);

-- Tabela de registro de hidratação
CREATE TABLE public.water_intake_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conquistas nutricionais
CREATE TABLE public.nutrition_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  achievement_id TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Tabela de preferências alimentares do usuário
CREATE TABLE public.user_food_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  favorites TEXT[],
  avoid TEXT[],
  allergies TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Políticas de segurança (RLS)
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_intake_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_food_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para planos nutricionais
CREATE POLICY "Users can view their own nutrition plans" 
ON public.nutrition_plans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition plans" 
ON public.nutrition_plans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition plans" 
ON public.nutrition_plans FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition plans" 
ON public.nutrition_plans FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para dias do plano (similar para outras tabelas)
CREATE POLICY "Users can view their own nutrition days" 
ON public.nutrition_days FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.nutrition_plans 
  WHERE nutrition_plans.id = nutrition_days.plan_id 
  AND nutrition_plans.user_id = auth.uid()
));

-- Políticas para refeições
CREATE POLICY "Users can view their own nutrition meals" 
ON public.nutrition_meals FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.nutrition_days 
  JOIN public.nutrition_plans ON nutrition_plans.id = nutrition_days.plan_id 
  WHERE nutrition_days.id = nutrition_meals.day_id 
  AND nutrition_plans.user_id = auth.uid()
));

-- Políticas para alimentos
CREATE POLICY "Users can view their own nutrition foods" 
ON public.nutrition_foods FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.nutrition_meals 
  JOIN public.nutrition_days ON nutrition_days.id = nutrition_meals.day_id 
  JOIN public.nutrition_plans ON nutrition_plans.id = nutrition_days.plan_id 
  WHERE nutrition_meals.id = nutrition_foods.meal_id 
  AND nutrition_plans.user_id = auth.uid()
));

-- Políticas para registro de hidratação
CREATE POLICY "Users can view their own water intake logs" 
ON public.water_intake_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water intake logs" 
ON public.water_intake_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para conquistas nutricionais
CREATE POLICY "Users can view their own nutrition achievements" 
ON public.nutrition_achievements FOR SELECT 
USING (auth.uid() = user_id);

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
