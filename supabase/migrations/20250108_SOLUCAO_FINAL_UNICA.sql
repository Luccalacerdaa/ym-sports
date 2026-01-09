-- ============================================
-- SOLUÇÃO FINAL ÚNICA - APAGAR TUDO E RECONSTRUIR
-- ============================================
-- Este SQL resolve DEFINITIVAMENTE o problema de duplicatas
-- Execução única, não precisa de mais nada depois

BEGIN;

-- ========================================
-- PARTE 1: APAGAR TUDO (FORÇA BRUTA MÁXIMA)
-- ========================================

TRUNCATE TABLE rankings RESTART IDENTITY CASCADE;

-- Confirmar vazio
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM rankings) > 0 THEN
    RAISE EXCEPTION 'ERRO: Rankings não foram apagados!';
  END IF;
  RAISE NOTICE '✅ Tabela rankings está vazia';
END $$;

-- ========================================
-- PARTE 2: RANKING NACIONAL (TODOS OS JOGADORES)
-- ========================================

INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  up.user_id,
  'national' as ranking_type,
  ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.updated_at ASC) as position,
  up.total_points,
  'all_time' as period,
  NOW(),
  COALESCE(ul.state, 'Brasil') as region  -- Estado ou 'Brasil' como fallback
FROM user_progress up
LEFT JOIN user_locations ul ON ul.user_id = up.user_id
WHERE up.total_points > 0
ORDER BY up.total_points DESC;

-- ========================================
-- PARTE 3: RANKING REGIONAL (POR REGIÃO)
-- ========================================

INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  up.user_id,
  'regional' as ranking_type,
  ROW_NUMBER() OVER (
    PARTITION BY ul.region 
    ORDER BY up.total_points DESC, up.updated_at ASC
  ) as position,
  up.total_points,
  'all_time' as period,
  NOW(),
  ul.state as region  -- IMPORTANTE: Armazena ESTADO (RJ, SP) não REGIÃO (Sudeste)
FROM user_progress up
INNER JOIN user_locations ul ON ul.user_id = up.user_id
WHERE up.total_points > 0 
  AND ul.region IS NOT NULL
  AND ul.state IS NOT NULL
ORDER BY ul.region, up.total_points DESC;

-- ========================================
-- PARTE 4: RANKING LOCAL (POR ESTADO)
-- ========================================

INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  up.user_id,
  'local' as ranking_type,
  ROW_NUMBER() OVER (
    PARTITION BY ul.state 
    ORDER BY up.total_points DESC, up.updated_at ASC
  ) as position,
  up.total_points,
  'all_time' as period,
  NOW(),
  ul.state as region  -- Armazena estado (RJ, SP)
FROM user_progress up
INNER JOIN user_locations ul ON ul.user_id = up.user_id
WHERE up.total_points > 0 
  AND ul.state IS NOT NULL
ORDER BY ul.state, up.total_points DESC;

COMMIT;

-- ========================================
-- VERIFICAÇÕES CRÍTICAS
-- ========================================

-- 1. TOTAL GERAL (deve ser N = N)
SELECT 
  '📊 TOTAL' as verificacao,
  ranking_type,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as unicos
FROM rankings
GROUP BY ranking_type
ORDER BY ranking_type;

-- 2. DUPLICATAS GLOBAIS (deve retornar 0 linhas)
SELECT 
  '⚠️ DUPLICATAS GLOBAIS' as verificacao,
  user_id,
  ranking_type,
  COUNT(*) as qtd
FROM rankings
WHERE period = 'all_time'
GROUP BY user_id, ranking_type
HAVING COUNT(*) > 1;

-- 3. RANKINGS DO USUÁRIO ESPECÍFICO
SELECT 
  '👤 SEU USUÁRIO' as verificacao,
  ranking_type,
  position,
  total_points,
  region
FROM rankings
WHERE user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f'
ORDER BY ranking_type;

-- 4. REGIONAL SUDESTE (deve mostrar 8 com estados)
SELECT 
  '🏴 REGIONAL SUDESTE' as verificacao,
  r.position,
  p.name,
  r.region as estado_armazenado,
  ul.region as regiao_real
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN user_locations ul ON ul.user_id = r.user_id
WHERE r.ranking_type = 'regional'
  AND ul.region = 'Sudeste'
ORDER BY r.position
LIMIT 8;

-- 5. CONTAGEM FINAL
SELECT 
  '✅ RESUMO FINAL' as status,
  (SELECT COUNT(*) FROM rankings) as total_rankings,
  (SELECT COUNT(DISTINCT user_id) FROM rankings) as usuarios_unicos,
  (SELECT COUNT(*) FROM rankings WHERE ranking_type = 'national') as nacional,
  (SELECT COUNT(*) FROM rankings WHERE ranking_type = 'regional') as regional,
  (SELECT COUNT(*) FROM rankings WHERE ranking_type = 'local') as local;
