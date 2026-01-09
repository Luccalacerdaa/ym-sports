-- ============================================
-- CORRIGIR RANKINGS DUPLICADOS - VERSÃO FINAL
-- ============================================
-- Problema: Ainda há 6 rankings por usuário (duplicatas!)
-- Solução: Limpar TUDO e reconstruir corretamente

BEGIN;

-- 1. APAGAR TUDO (força bruta)
DELETE FROM rankings WHERE period = 'all_time';

-- 2. CRIAR RANKING NACIONAL
-- Todos os usuários, ordenados por pontos DESC
WITH ranked_national AS (
  SELECT 
    up.user_id,
    up.total_points,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.updated_at ASC) as position
  FROM user_progress up
  WHERE up.total_points > 0
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'national' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  NOW(),
  NULL as region
FROM ranked_national;

-- 3. CRIAR RANKING REGIONAL (POR ESTADO!)
-- Mudança: ao invés de agrupar por "região" (Sudeste), agrupa por ESTADO (RJ, SP, MG)
WITH ranked_regional AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state as estado,
    ROW_NUMBER() OVER (PARTITION BY ul.state ORDER BY up.total_points DESC, up.updated_at ASC) as position
  FROM user_progress up
  INNER JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points > 0 AND ul.state IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'regional' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  NOW(),
  estado as region
FROM ranked_regional;

-- 4. CRIAR RANKING LOCAL (POR CIDADE/GPS)
-- Mantém igual, por estado também
WITH ranked_local AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state as estado,
    ROW_NUMBER() OVER (PARTITION BY ul.state ORDER BY up.total_points DESC, up.updated_at ASC) as position
  FROM user_progress up
  INNER JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points > 0 AND ul.state IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'local' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  NOW(),
  estado as region
FROM ranked_local;

COMMIT;

-- 5. VERIFICAR RESULTADO
SELECT 
  'TOTAL POR TIPO' as titulo,
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM rankings
WHERE period = 'all_time'
GROUP BY ranking_type
ORDER BY ranking_type;

-- 6. VERIFICAR TOP 3 NACIONAL
SELECT 
  'TOP 3 NACIONAL' as titulo,
  r.position,
  p.name as nome,
  r.total_points as pontos
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.ranking_type = 'national' AND r.period = 'all_time'
ORDER BY r.position
LIMIT 3;

-- 7. VERIFICAR REGIONAL RJ
SELECT 
  'RANKING REGIONAL RJ' as titulo,
  r.position,
  p.name as nome,
  r.total_points as pontos,
  r.region as estado
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.ranking_type = 'regional' AND r.region = 'RJ' AND r.period = 'all_time'
ORDER BY r.position
LIMIT 5;
