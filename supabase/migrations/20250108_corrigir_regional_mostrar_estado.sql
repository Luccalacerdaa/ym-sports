-- ============================================
-- CORRIGIR REGIONAL: MOSTRAR ESTADO AO INVÉS DE "SUDESTE"
-- ============================================
-- Problema: Regional armazena "Sudeste" na coluna region
-- Solução: Armazenar o ESTADO individual (RJ, SP, MG, ES)

BEGIN;

-- 1. APAGAR APENAS O REGIONAL (manter nacional e local)
DELETE FROM rankings 
WHERE ranking_type = 'regional' 
  AND period = 'all_time';

-- 2. RECRIAR RANKING REGIONAL COM ESTADO INDIVIDUAL
-- A chave é: agrupa por REGIÃO, mas armazena o ESTADO na coluna region
WITH ranked_regional AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state,      -- ← Estado individual do jogador
    ul.region,     -- ← Região para agrupamento (Sudeste, Sul, etc.)
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
  state as region  -- ← MUDANÇA: Armazenar STATE (RJ, SP) ao invés de REGION (Sudeste)
FROM ranked_regional;

COMMIT;

-- ========================================
-- VERIFICAÇÕES
-- ========================================

-- 3. VERIFICAR REGIONAL SUDESTE (agora deve mostrar estados individuais!)
SELECT 
  '🏴 REGIONAL SUDESTE - COM ESTADOS' as verificacao,
  r.position,
  p.name as nome,
  r.total_points as pontos,
  r.region as estado_armazenado,  -- ← Agora deve ser RJ, SP, MG, ES
  ul.region as regiao_real         -- ← Deve ser "Sudeste" para todos
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN user_locations ul ON ul.user_id = r.user_id
WHERE r.ranking_type = 'regional' 
  AND ul.region = 'Sudeste'  -- ← Filtrar por região real
  AND r.period = 'all_time'
ORDER BY r.position
LIMIT 5;

-- Esperado:
-- #1 | pedro teste | 6594 | RJ | Sudeste
-- #2 | Lucca       | 2158 | RJ | Sudeste  
-- #3 | Outro       | 1336 | SP | Sudeste (se tiver)

-- 4. CONTAR POR REGIÃO
SELECT 
  '📊 TOTAL POR REGIÃO' as verificacao,
  ul.region as regiao,
  COUNT(DISTINCT r.user_id) as usuarios_unicos
FROM rankings r
INNER JOIN user_locations ul ON ul.user_id = r.user_id
WHERE r.ranking_type = 'regional'
  AND r.period = 'all_time'
GROUP BY ul.region
ORDER BY ul.region;
