-- ============================================
-- REMOVER DUPLICATAS DO USUÁRIO ESPECÍFICO
-- ============================================
-- Problema: user_id 5b90424c-f023-4a7d-a96a-5d62425ccb6f tem duplicatas
-- Causa: Rankings antigos não foram deletados pelo TRUNCATE

BEGIN;

-- ========================================
-- PARTE 1: DELETAR DUPLICATAS DO USUÁRIO
-- ========================================

-- Deletar TODOS os rankings deste usuário
DELETE FROM rankings 
WHERE user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f'
  AND period = 'all_time';

-- Verificar que foi deletado
SELECT '🗑️ RANKINGS DELETADOS' as status, COUNT(*) as total 
FROM rankings 
WHERE user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f';
-- Deve retornar: 0

-- ========================================
-- PARTE 2: RECRIAR RANKINGS DO USUÁRIO
-- ========================================

-- 2.1 NACIONAL
WITH user_progress_data AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state,
    (
      SELECT COUNT(*) + 1
      FROM user_progress up2
      WHERE up2.total_points > up.total_points
    ) as position
  FROM user_progress up
  LEFT JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f'
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'national' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  NOW(),
  state as region
FROM user_progress_data;

-- 2.2 REGIONAL (Sudeste)
WITH user_regional_data AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state,
    ul.region,
    (
      SELECT COUNT(*) + 1
      FROM user_progress up2
      INNER JOIN user_locations ul2 ON ul2.user_id = up2.user_id
      WHERE up2.total_points > up.total_points
        AND ul2.region = 'Sudeste'
    ) as position
  FROM user_progress up
  INNER JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f'
    AND ul.region = 'Sudeste'
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'regional' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  NOW(),
  state as region
FROM user_regional_data;

-- 2.3 LOCAL (RJ)
WITH user_local_data AS (
  SELECT 
    up.user_id,
    up.total_points,
    ul.state,
    (
      SELECT COUNT(*) + 1
      FROM user_progress up2
      INNER JOIN user_locations ul2 ON ul2.user_id = up2.user_id
      WHERE up2.total_points > up.total_points
        AND ul2.state = 'RJ'
    ) as position
  FROM user_progress up
  INNER JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f'
    AND ul.state = 'RJ'
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'local' as ranking_type,
  position,
  total_points,
  'all_time' as period,
  NOW(),
  state as region
FROM user_local_data;

COMMIT;

-- ========================================
-- VERIFICAÇÕES FINAIS
-- ========================================

-- 1. VERIFICAR SE AINDA TEM DUPLICATAS DO USUÁRIO
SELECT 
  '⚠️ DUPLICATAS DO USUÁRIO' as verificacao,
  user_id,
  ranking_type,
  COUNT(*) as quantidade
FROM rankings
WHERE user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f'
  AND period = 'all_time'
GROUP BY user_id, ranking_type
HAVING COUNT(*) > 1;
-- Deve retornar: 0 linhas

-- 2. VER RANKINGS DO USUÁRIO (deve ser apenas 3: nacional, regional, local)
SELECT 
  '✅ RANKINGS DO USUÁRIO' as verificacao,
  ranking_type,
  position,
  total_points,
  region as estado_armazenado
FROM rankings
WHERE user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f'
  AND period = 'all_time'
ORDER BY ranking_type;
-- Deve retornar: 3 linhas (1 de cada tipo)

-- 3. VERIFICAR TOTAL GERAL (após correção)
SELECT 
  '📊 TOTAL GERAL' as verificacao,
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM rankings
WHERE period = 'all_time'
GROUP BY ranking_type
ORDER BY ranking_type;
-- Agora deve estar correto: total = usuarios_unicos
