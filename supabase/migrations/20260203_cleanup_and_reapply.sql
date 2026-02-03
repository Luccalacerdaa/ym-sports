-- =============================================
-- Limpeza e Reaplicação dos Indexes
-- Data: 03/02/2026
-- Use este SQL se você já tentou aplicar a versão anterior
-- =============================================

-- 1. REMOVER indexes que podem ter dado erro
-- (Se não existirem, o DROP IF EXISTS não dá erro)
DROP INDEX IF EXISTS idx_rankings_user_type;
DROP INDEX IF EXISTS idx_rankings_points_desc;
DROP INDEX IF EXISTS idx_rankings_type_points;
DROP INDEX IF EXISTS idx_trainings_user_created;
DROP INDEX IF EXISTS idx_trainings_completed;
DROP INDEX IF EXISTS idx_events_user_date;
DROP INDEX IF EXISTS idx_events_date_type;
DROP INDEX IF EXISTS idx_user_achievements_user;
DROP INDEX IF EXISTS idx_user_achievements_unlocked_date;
DROP INDEX IF EXISTS idx_portfolios_user;

-- 2. CRIAR indexes corretos (apenas para tabelas que existem)
-- =============================================

-- Perfis
CREATE INDEX IF NOT EXISTS idx_profiles_name 
ON profiles(name);

CREATE INDEX IF NOT EXISTS idx_profiles_created 
ON profiles(created_at DESC);

-- Eventos
CREATE INDEX IF NOT EXISTS idx_events_user_date 
ON events(user_id, start_date);

CREATE INDEX IF NOT EXISTS idx_events_start_date 
ON events(start_date);

CREATE INDEX IF NOT EXISTS idx_events_type 
ON events(event_type);

-- Planos nutricionais
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_user_created 
ON nutrition_plans(user_id, created_at DESC);

-- Portfólio
CREATE INDEX IF NOT EXISTS idx_player_portfolios_user 
ON player_portfolios(user_id);

CREATE INDEX IF NOT EXISTS idx_player_portfolios_slug 
ON player_portfolios(slug);

-- Push subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user 
ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
ON push_subscriptions(endpoint);

-- Visualizações de portfólio
CREATE INDEX IF NOT EXISTS idx_portfolio_views_portfolio 
ON portfolio_views(portfolio_id, viewed_at DESC);

-- Histórico de clubes
CREATE INDEX IF NOT EXISTS idx_club_history_portfolio 
ON club_history(portfolio_id);

-- Dias nutricionais
CREATE INDEX IF NOT EXISTS idx_nutrition_days_plan 
ON nutrition_days(plan_id);

-- Refeições
CREATE INDEX IF NOT EXISTS idx_nutrition_meals_day 
ON nutrition_meals(day_id);

-- Alimentos
CREATE INDEX IF NOT EXISTS idx_nutrition_foods_meal 
ON nutrition_foods(meal_id);

-- Registro de água
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date 
ON water_intake_logs(user_id, date DESC);

-- 3. ANALISAR tabelas para atualizar estatísticas
-- =============================================
ANALYZE profiles;
ANALYZE events;
ANALYZE nutrition_plans;
ANALYZE player_portfolios;
ANALYZE push_subscriptions;

-- 4. VERIFICAR indexes criados
-- =============================================
SELECT 
  tablename, 
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
