-- =============================================
-- Performance Indexes - YM Sports
-- Data: 03/02/2026
-- Objetivo: Otimizar queries mais frequentes
-- =============================================

-- NOTA: Apenas indexes para tabelas que EXISTEM
-- Tabelas verificadas: profiles, events, push_subscriptions, 
-- nutrition_plans, player_portfolios, rankings_cache

-- Index para perfis (busca de atletas)
CREATE INDEX IF NOT EXISTS idx_profiles_name 
ON profiles(name);

CREATE INDEX IF NOT EXISTS idx_profiles_created 
ON profiles(created_at DESC);

-- Index para eventos (calendário)
CREATE INDEX IF NOT EXISTS idx_events_user_date 
ON events(user_id, start_date);

CREATE INDEX IF NOT EXISTS idx_events_start_date 
ON events(start_date);

CREATE INDEX IF NOT EXISTS idx_events_type 
ON events(event_type);

-- Index para planos nutricionais
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_user_created 
ON nutrition_plans(user_id, created_at DESC);

-- Index para portfólio (visibilidade pública)
CREATE INDEX IF NOT EXISTS idx_player_portfolios_user 
ON player_portfolios(user_id);

CREATE INDEX IF NOT EXISTS idx_player_portfolios_slug 
ON player_portfolios(slug);

-- Index para push subscriptions (notificações)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user 
ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
ON push_subscriptions(endpoint);

-- Index para visualizações de portfólio
CREATE INDEX IF NOT EXISTS idx_portfolio_views_portfolio 
ON portfolio_views(portfolio_id, viewed_at DESC);

-- Index para histórico de clubes
CREATE INDEX IF NOT EXISTS idx_club_history_portfolio 
ON club_history(portfolio_id);

-- Index para dias nutricionais
CREATE INDEX IF NOT EXISTS idx_nutrition_days_plan 
ON nutrition_days(plan_id);

-- Index para refeições
CREATE INDEX IF NOT EXISTS idx_nutrition_meals_day 
ON nutrition_meals(day_id);

-- Index para alimentos
CREATE INDEX IF NOT EXISTS idx_nutrition_foods_meal 
ON nutrition_foods(meal_id);

-- Index para registro de água
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date 
ON water_intake_logs(user_id, date DESC);

-- Análise das tabelas para atualizar estatísticas
ANALYZE profiles;
ANALYZE events;
ANALYZE nutrition_plans;
ANALYZE player_portfolios;
ANALYZE push_subscriptions;

-- Comentários para documentação
COMMENT ON INDEX idx_events_user_date IS 'Otimiza calendário de eventos por usuário';
COMMENT ON INDEX idx_nutrition_plans_user_created IS 'Otimiza listagem de planos nutricionais';
COMMENT ON INDEX idx_player_portfolios_slug IS 'Otimiza busca de portfólio por URL';
