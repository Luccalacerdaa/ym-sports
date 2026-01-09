-- ============================================
-- ESTRUTURA CORRETA DE RANKINGS - DEFINITIVO
-- ============================================
-- Nacional: Todos os jogadores (mostra estado)
-- Regional: Por REGIÃO (Sudeste, Sul, etc) - mostra estado
-- Local: Por ESTADO (RJ, SP, MG) - mostra cidade

BEGIN;

-- 1. APAGAR TUDO COM TRUNCATE (mais agressivo)
TRUNCATE TABLE rankings CASCADE;

-- Verificar que ficou vazio
SELECT COUNT(*) as total_rankings FROM rankings;
-- Deve retornar: 0

-- 2. CRIAR RANKING NACIONAL
-- TODOS os jogadores do Brasil, ordenados por pontos
WITH ranked_national AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.updated_at ASC) as position
  FROM user_progress up
  LEFT JOIN user_locations ul ON ul.user_id = up.user_id
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
  state as region  -- Armazena o ESTADO para exibir
FROM ranked_national;

-- 3. CRIAR RANKING REGIONAL (POR REGIÃO: Sudeste, Sul, etc)
-- Agrupa por REGIÃO, não por estado
WITH ranked_regional AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state,
    ul.region,
    ROW_NUMBER() OVER (
      PARTITION BY ul.region 
      ORDER BY up.total_points DESC, up.updated_at ASC
    ) as position
  FROM user_progress up
  INNER JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points > 0 AND ul.region IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'regional' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  NOW(),
  region  -- Armazena a REGIÃO (Sudeste, Sul, etc)
FROM ranked_regional;

-- 4. CRIAR RANKING LOCAL (POR ESTADO: RJ, SP, MG)
-- Agrupa por ESTADO
WITH ranked_local AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state,
    ROW_NUMBER() OVER (
      PARTITION BY ul.state 
      ORDER BY up.total_points DESC, up.updated_at ASC
    ) as position
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
  state as region  -- Armazena o ESTADO (RJ, SP, MG)
FROM ranked_local;

COMMIT;

-- ========================================
-- VERIFICAÇÕES
-- ========================================

-- 5. TOTAL POR TIPO
SELECT 
  '📊 TOTAL POR TIPO' as verificacao,
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  STRING_AGG(DISTINCT region, ', ') as regioes
FROM rankings
WHERE period = 'all_time'
GROUP BY ranking_type
ORDER BY ranking_type;

-- 6. TOP 3 NACIONAL (deve mostrar estado de cada jogador)
SELECT 
  '🇧🇷 TOP 3 NACIONAL' as verificacao,
  r.position,
  p.name as nome,
  r.total_points as pontos,
  r.region as estado
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.ranking_type = 'national' AND r.period = 'all_time'
ORDER BY r.position
LIMIT 3;

-- 7. REGIONAL SUDESTE (deve mostrar jogadores de SP, MG, ES, RJ)
SELECT 
  '🏴 REGIONAL SUDESTE' as verificacao,
  r.position,
  p.name as nome,
  r.total_points as pontos,
  ul.state as estado_jogador,
  r.region as regiao
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN user_locations ul ON ul.user_id = r.user_id
WHERE r.ranking_type = 'regional' 
  AND r.region = 'Sudeste' 
  AND r.period = 'all_time'
ORDER BY r.position
LIMIT 5;

-- 8. LOCAL RJ (deve mostrar apenas jogadores do RJ)
SELECT 
  '📍 LOCAL RJ' as verificacao,
  r.position,
  p.name as nome,
  r.total_points as pontos,
  ul.state as estado,
  ul.city_approximate as cidade
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN user_locations ul ON ul.user_id = r.user_id
WHERE r.ranking_type = 'local' 
  AND r.region = 'RJ' 
  AND r.period = 'all_time'
ORDER BY r.position
LIMIT 5;

-- 9. VERIFICAR SE TEM DUPLICATAS
SELECT 
  '⚠️ VERIFICAR DUPLICATAS' as verificacao,
  user_id,
  ranking_type,
  COUNT(*) as quantidade
FROM rankings
WHERE period = 'all_time'
GROUP BY user_id, ranking_type
HAVING COUNT(*) > 1;
-- Se retornar linhas, AINDA TEM DUPLICATAS!
