-- =============================================
-- Performance Indexes - YM Sports
-- Data: 03/02/2026
-- Objetivo: Otimizar queries mais frequentes
-- =============================================

-- Index para rankings (consulta mais frequente do app)
CREATE INDEX IF NOT EXISTS idx_rankings_user_type 
ON rankings(user_id, ranking_type);

CREATE INDEX IF NOT EXISTS idx_rankings_points_desc 
ON rankings(points DESC);

CREATE INDEX IF NOT EXISTS idx_rankings_type_points 
ON rankings(ranking_type, points DESC);

-- Index para treinos (usado no dashboard e histórico)
CREATE INDEX IF NOT EXISTS idx_trainings_user_created 
ON trainings(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trainings_completed 
ON trainings(completed, created_at DESC);

-- Index para eventos (calendário)
CREATE INDEX IF NOT EXISTS idx_events_user_date 
ON events(user_id, event_date);

CREATE INDEX IF NOT EXISTS idx_events_date_type 
ON events(event_date, event_type);

-- Index para conquistas (gamificação)
CREATE INDEX IF NOT EXISTS idx_user_achievements_user 
ON user_achievements(user_id, unlocked);

CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_date 
ON user_achievements(user_id, unlocked_at DESC) 
WHERE unlocked = true;

-- Index para perfis (busca de atletas)
CREATE INDEX IF NOT EXISTS idx_profiles_name 
ON profiles(name);

-- Index para planos nutricionais
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_user_created 
ON nutrition_plans(user_id, created_at DESC);

-- Index para portfólio (visibilidade pública)
CREATE INDEX IF NOT EXISTS idx_portfolios_user 
ON portfolios(user_id);

-- Index para push subscriptions (notificações)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user 
ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active 
ON push_subscriptions(user_id) 
WHERE active = true;

-- Análise das tabelas para atualizar estatísticas
ANALYZE rankings;
ANALYZE trainings;
ANALYZE events;
ANALYZE user_achievements;
ANALYZE profiles;
ANALYZE nutrition_plans;

-- Comentário para documentação
COMMENT ON INDEX idx_rankings_user_type IS 'Otimiza busca de rankings por usuário e tipo';
COMMENT ON INDEX idx_trainings_user_created IS 'Otimiza listagem de treinos do usuário';
COMMENT ON INDEX idx_events_user_date IS 'Otimiza calendário de eventos';
