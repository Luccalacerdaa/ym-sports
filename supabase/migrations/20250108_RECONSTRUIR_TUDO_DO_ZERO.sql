-- ========================================
-- RECONSTRUIR TUDO DO ZERO - VERSÃO FINAL
-- ========================================
-- Este SQL deleta TUDO e reconstrói corretamente
-- SEM DUPLICATAS, SEM ERROS

BEGIN;

-- ========================================
-- PASSO 1: LIMPAR TUDO
-- ========================================
TRUNCATE TABLE rankings RESTART IDENTITY CASCADE;

-- ========================================
-- PASSO 2: REMOVER CONSTRAINTS PROBLEMÁTICOS
-- ========================================
DROP INDEX IF EXISTS idx_rankings_unique_entry;
ALTER TABLE rankings DROP CONSTRAINT IF EXISTS rankings_user_id_ranking_type_region_period_key;

-- ========================================
-- PASSO 3: CRIAR ÍNDICE DE PERFORMANCE (NÃO ÚNICO)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_rankings_lookup
ON rankings (user_id, ranking_type, region, period);

-- ========================================
-- PASSO 4: RECONSTRUIR RANKINGS
-- ========================================

-- 🇧🇷 RANKING NACIONAL (TODOS OS USUÁRIOS)
WITH ranked_users AS (
  SELECT 
    up.user_id,
    up.total_points,
    COALESCE(ul.state, 'N/A') as state,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC NULLS LAST) as position
  FROM user_progress up
  LEFT JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points IS NOT NULL
    AND up.total_points > 0
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'national',
  position::INTEGER,
  total_points,
  'all_time',
  NOW(),
  state -- Armazena o estado do jogador para exibição
FROM ranked_users;

-- 🏴 RANKING REGIONAL (POR REGIÃO - MOSTRANDO ESTADO)
WITH ranked_regional AS (
  SELECT 
    up.user_id,
    ul.region as user_region, -- Para agrupar (Sudeste, Sul, etc.)
    ul.state as user_state,   -- Para exibir (RJ, SP, etc.)
    up.total_points,
    ROW_NUMBER() OVER (
      PARTITION BY ul.region 
      ORDER BY up.total_points DESC NULLS LAST
    ) as position
  FROM user_progress up
  JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points IS NOT NULL
    AND up.total_points > 0
    AND ul.region IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'regional',
  position::INTEGER,
  total_points,
  'all_time',
  NOW(),
  user_state -- Armazena o ESTADO para exibição (não a região)
FROM ranked_regional;

-- 📍 RANKING LOCAL (POR ESTADO - MOSTRANDO CIDADE)
WITH ranked_local AS (
  SELECT 
    up.user_id,
    ul.state as user_state,           -- Para agrupar (RJ, SP, etc.)
    ul.city_approximate as user_city, -- Para exibir
    up.total_points,
    ROW_NUMBER() OVER (
      PARTITION BY ul.state 
      ORDER BY up.total_points DESC NULLS LAST
    ) as position
  FROM user_progress up
  JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points IS NOT NULL
    AND up.total_points > 0
    AND ul.state IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'local',
  position::INTEGER,
  total_points,
  'all_time',
  NOW(),
  user_state -- Armazena o ESTADO (não cidade) para compatibilidade
FROM ranked_local;

COMMIT;

-- ========================================
-- VERIFICAÇÕES AUTOMÁTICAS
-- ========================================

-- 1. 📊 TOTAL POR TIPO
SELECT 
  '📊 TOTAL POR TIPO' as verificacao,
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM rankings
WHERE period = 'all_time'
GROUP BY ranking_type
ORDER BY ranking_type;

-- 2. ⚠️ DUPLICATAS (DEVE RETORNAR 0!)
SELECT 
  '⚠️ DUPLICATAS GLOBAIS (deve ser 0)' as verificacao,
  user_id,
  ranking_type,
  COUNT(*) as quantidade
FROM rankings
WHERE period = 'all_time'
GROUP BY user_id, ranking_type
HAVING COUNT(*) > 1;

-- 3. 👤 SEUS RANKINGS (deve ter exatamente 3)
SELECT 
  '👤 SEUS RANKINGS' as verificacao,
  r.ranking_type,
  r.position,
  r.total_points,
  r.region as estado_armazenado,
  p.name as seu_nome
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f'
  AND r.period = 'all_time'
ORDER BY 
  CASE r.ranking_type
    WHEN 'national' THEN 1
    WHEN 'regional' THEN 2
    WHEN 'local' THEN 3
  END;

-- 4. 🇧🇷 TOP 3 NACIONAL
SELECT 
  '🇧🇷 TOP 3 NACIONAL' as verificacao,
  r.position,
  p.name as nome,
  r.total_points as pontos,
  r.region as estado
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.ranking_type = 'national' 
  AND r.period = 'all_time'
ORDER BY r.position
LIMIT 3;

-- 5. 📍 LOCAL RJ (TOP 3)
SELECT 
  '📍 LOCAL RJ (TOP 3)' as verificacao,
  r.position,
  p.name as nome,
  r.total_points as pontos,
  ul.city_approximate as cidade
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN user_locations ul ON ul.user_id = r.user_id
WHERE r.ranking_type = 'local' 
  AND r.region = 'RJ'
  AND r.period = 'all_time'
ORDER BY r.position
LIMIT 3;
