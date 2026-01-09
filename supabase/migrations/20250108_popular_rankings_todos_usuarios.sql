-- ============================================
-- POPULAR RANKINGS DE TODOS OS USUÁRIOS
-- ============================================
-- Este script recalcula os rankings para TODOS os usuários
-- que têm progresso no sistema, não apenas o usuário atual

BEGIN;

-- 1. LIMPAR rankings antigos
DELETE FROM rankings WHERE period = 'all_time';

-- 2. INSERIR RANKING NACIONAL (todos os usuários)
WITH ranked_users AS (
  SELECT 
    up.user_id,
    up.total_points,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.updated_at ASC) as position
  FROM user_progress up
  WHERE up.total_points > 0
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, region)
SELECT 
  user_id,
  'national' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  NULL as region
FROM ranked_users;

-- 3. INSERIR RANKING REGIONAL (por região)
WITH ranked_by_region AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.region,
    ROW_NUMBER() OVER (PARTITION BY ul.region ORDER BY up.total_points DESC, up.updated_at ASC) as position
  FROM user_progress up
  INNER JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points > 0 AND ul.region IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, region)
SELECT 
  user_id,
  'regional' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  region
FROM ranked_by_region;

-- 4. INSERIR RANKING LOCAL (por estado)
WITH ranked_by_state AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state as region,
    ROW_NUMBER() OVER (PARTITION BY ul.state ORDER BY up.total_points DESC, up.updated_at ASC) as position
  FROM user_progress up
  INNER JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points > 0 AND ul.state IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, region)
SELECT 
  user_id,
  'local' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  region
FROM ranked_by_state;

COMMIT;

-- 5. VERIFICAR RESULTADO
SELECT 
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM rankings
WHERE period = 'all_time'
GROUP BY ranking_type
ORDER BY ranking_type;
