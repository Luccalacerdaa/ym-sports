-- ============================================
-- LIMPAR TUDO E RECONSTRUIR - VERSÃO FINAL
-- ============================================
-- Problema: Ainda há duplicatas no banco (11 rankings, 8 usuários)
-- Solução: TRUNCATE CASCADE + Reconstruir tudo do zero

BEGIN;

-- ========================================
-- PARTE 1: LIMPAR TUDO (FORÇA BRUTA)
-- ========================================

TRUNCATE TABLE rankings CASCADE;

-- Confirmar que está vazio
SELECT '🗑️ LIMPEZA' as status, COUNT(*) as total_rankings FROM rankings;
-- Deve retornar: 0

-- ========================================
-- PARTE 2: RANKING NACIONAL
-- ========================================

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
  state as region  -- Armazena estado (RJ, SP, MG)
FROM ranked_national;

-- ========================================
-- PARTE 3: RANKING REGIONAL (POR REGIÃO)
-- ========================================

WITH ranked_regional AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state,      -- Estado individual
    ul.region,     -- Região para agrupamento
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
  state as region  -- Armazena ESTADO (RJ, SP) não região (Sudeste)
FROM ranked_regional;

-- ========================================
-- PARTE 4: RANKING LOCAL (POR ESTADO)
-- ========================================

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
  state as region  -- Armazena estado (RJ, SP)
FROM ranked_local;

COMMIT;

-- ========================================
-- VERIFICAÇÕES FINAIS
-- ========================================

-- 1. TOTAL POR TIPO
SELECT 
  '📊 TOTAL POR TIPO' as verificacao,
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM rankings
WHERE period = 'all_time'
GROUP BY ranking_type
ORDER BY ranking_type;

-- Esperado:
-- nacional  | 11 | 11  ← Total = Usuários únicos (sem duplicatas)
-- regional  | 8  | 8   ← Total = Usuários únicos
-- local     | 2  | 2   ← Total = Usuários únicos (RJ tem 2)

-- 2. VERIFICAR DUPLICATAS (CRÍTICO!)
SELECT 
  '⚠️ VERIFICAR DUPLICATAS' as verificacao,
  user_id,
  ranking_type,
  COUNT(*) as quantidade
FROM rankings
WHERE period = 'all_time'
GROUP BY user_id, ranking_type
HAVING COUNT(*) > 1;

-- Deve retornar: 0 linhas (nenhuma duplicata)

-- 3. REGIONAL SUDESTE (todos com estado individual)
SELECT 
  '🏴 REGIONAL SUDESTE' as verificacao,
  r.position,
  p.name as nome,
  r.total_points as pontos,
  r.region as estado_armazenado,
  ul.region as regiao_real
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN user_locations ul ON ul.user_id = r.user_id
WHERE r.ranking_type = 'regional' 
  AND ul.region = 'Sudeste'
  AND r.period = 'all_time'
ORDER BY r.position
LIMIT 8;

-- 4. LOCAL RJ (com cidades)
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
ORDER BY r.position;
