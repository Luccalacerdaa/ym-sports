-- =====================================================
-- RECALCULAR TODOS OS RANKINGS
-- =====================================================
-- Data: 2026-02-05
-- Objetivo: Limpar e recriar rankings de TODOS os usuários
-- Motivo: Rankings foram apagados acidentalmente

-- ============================================
-- 1. LIMPAR RANKINGS ANTIGOS
-- ============================================
DELETE FROM rankings;

-- ============================================
-- 2. BUSCAR DADOS DE TODOS OS USUÁRIOS
-- ============================================
-- Vamos popular os rankings com base em:
-- - user_progress: pontos de cada usuário
-- - user_locations: localização de cada usuário

-- ============================================
-- 3. INSERIR RANKING NACIONAL (TODOS OS USUÁRIOS)
-- ============================================
INSERT INTO rankings (
  user_id, 
  ranking_type, 
  region,
  position, 
  total_points, 
  period, 
  calculated_at
)
SELECT 
  up.user_id,
  'national' as ranking_type,
  NULL as region,
  ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.user_id) as position,
  COALESCE(up.total_points, 0) as total_points,
  'all_time' as period,
  NOW() as calculated_at
FROM user_progress up
WHERE COALESCE(up.total_points, 0) >= 0
ORDER BY up.total_points DESC, up.user_id;

-- ============================================
-- 4. INSERIR RANKING REGIONAL (POR REGIÃO GEOGRÁFICA)
-- ============================================
-- Sudeste, Sul, Norte, Nordeste, Centro-Oeste
INSERT INTO rankings (
  user_id, 
  ranking_type, 
  region,
  position, 
  total_points, 
  period, 
  calculated_at
)
SELECT 
  up.user_id,
  'regional' as ranking_type,
  ul.region as region,
  ROW_NUMBER() OVER (PARTITION BY ul.region ORDER BY up.total_points DESC, up.user_id) as position,
  COALESCE(up.total_points, 0) as total_points,
  'all_time' as period,
  NOW() as calculated_at
FROM user_progress up
INNER JOIN user_locations ul ON up.user_id = ul.user_id
WHERE ul.region IS NOT NULL
  AND COALESCE(up.total_points, 0) >= 0
ORDER BY ul.region, up.total_points DESC, up.user_id;

-- ============================================
-- 5. INSERIR RANKING LOCAL (POR ESTADO)
-- ============================================
INSERT INTO rankings (
  user_id, 
  ranking_type, 
  region,
  position, 
  total_points, 
  period, 
  calculated_at
)
SELECT 
  up.user_id,
  'local' as ranking_type,
  ul.state as region, -- Para local, usamos o estado na coluna region
  ROW_NUMBER() OVER (PARTITION BY ul.state ORDER BY up.total_points DESC, up.user_id) as position,
  COALESCE(up.total_points, 0) as total_points,
  'all_time' as period,
  NOW() as calculated_at
FROM user_progress up
INNER JOIN user_locations ul ON up.user_id = ul.user_id
WHERE ul.state IS NOT NULL
  AND COALESCE(up.total_points, 0) >= 0
ORDER BY ul.state, up.total_points DESC, up.user_id;

-- ============================================
-- 6. VERIFICAR RESULTADOS
-- ============================================
-- Ver quantos rankings foram criados
SELECT 
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  MIN(total_points) as min_pontos,
  MAX(total_points) as max_pontos,
  AVG(total_points)::INTEGER as media_pontos
FROM rankings
GROUP BY ranking_type
ORDER BY ranking_type;

-- Ver os TOP 5 de cada tipo
SELECT 
  ranking_type,
  region,
  position,
  user_id,
  total_points
FROM rankings
WHERE position <= 5
ORDER BY ranking_type, position;

-- ============================================
-- ✅ RANKINGS RECALCULADOS COM SUCESSO!
-- ============================================
-- Agora todos os usuários devem aparecer nos rankings
-- 
-- Para verificar:
-- 1. Nacional: todos os usuários com pontos
-- 2. Regional: usuários agrupados por região (Sudeste, Sul, etc)
-- 3. Local: usuários agrupados por estado (MG, SP, RJ, etc)
-- ============================================
