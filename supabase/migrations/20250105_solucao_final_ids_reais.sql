-- =============================================
-- SOLUÇÃO FINAL - COM IDs REAIS DO SEU BANCO
-- =============================================

-- ========================================
-- PARTE 1: BUSCAR IDS REAIS DOS USUÁRIOS
-- ========================================

-- Ver todos os user_ids reais
SELECT 
  p.id as user_id,
  p.name,
  ul.state,
  up.total_points,
  up.current_level
FROM profiles p
LEFT JOIN user_locations ul ON ul.user_id = p.id
LEFT JOIN user_progress up ON up.user_id = p.id
ORDER BY up.total_points DESC NULLS LAST;

-- COPIE OS IDs QUE APARECER E ANOTE:
-- Exemplo:
-- user_id: abc123... | name: pedro teste | state: MG | points: 6444
-- user_id: def456... | name: Lucca Lacerda | state: ES | points: 2000
-- etc...

-- ========================================
-- PARTE 2: LIMPAR RANKINGS
-- ========================================

TRUNCATE TABLE rankings CASCADE;

-- ========================================
-- PARTE 3: CRIAR level_thresholds (SE NÃO EXISTIR)
-- ========================================

DROP TABLE IF EXISTS level_thresholds CASCADE;

CREATE TABLE level_thresholds (
  level INTEGER PRIMARY KEY,
  points_required INTEGER NOT NULL
);

INSERT INTO level_thresholds (level, points_required) VALUES
(1, 0),
(2, 100),
(3, 250),
(4, 450),
(5, 700),
(6, 1000),
(7, 1350),
(8, 1750),
(9, 2200),
(10, 2700),
(11, 3250),
(12, 3850),
(13, 4500),
(14, 5200),
(15, 5950),
(16, 6750),
(17, 7600),
(18, 8500),
(19, 9450),
(20, 10450);

-- ========================================
-- PARTE 4: ATUALIZAR NÍVEIS (USANDO FUNÇÃO SQL)
-- ========================================

UPDATE user_progress up
SET current_level = (
  SELECT COALESCE(
    (SELECT level 
     FROM level_thresholds 
     WHERE points_required <= up.total_points 
     ORDER BY level DESC 
     LIMIT 1),
    1
  )
)
WHERE up.total_points IS NOT NULL;

-- Verificar resultado
SELECT 
  p.name,
  up.total_points,
  up.current_level,
  (SELECT points_required FROM level_thresholds WHERE level = up.current_level) as pontos_nivel_atual,
  (SELECT points_required FROM level_thresholds WHERE level = up.current_level + 1) as pontos_proximo_nivel
FROM user_progress up
JOIN profiles p ON p.id = up.user_id
ORDER BY up.total_points DESC;

-- ========================================
-- PARTE 5: INSERIR RANKINGS (COM IDs DINÂMICOS)
-- ========================================

-- RANKING NACIONAL (TODOS OS USUÁRIOS)
WITH ranked_users AS (
  SELECT 
    up.user_id,
    up.total_points,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as position
  FROM user_progress up
  WHERE up.total_points IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'national',
  position,
  total_points,
  'all_time',
  NOW(),
  NULL
FROM ranked_users;

-- RANKING REGIONAL (POR REGIÃO)
WITH ranked_regional AS (
  SELECT 
    up.user_id,
    ul.region,
    up.total_points,
    ROW_NUMBER() OVER (PARTITION BY ul.region ORDER BY up.total_points DESC) as position
  FROM user_progress up
  JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'regional',
  position,
  total_points,
  'all_time',
  NOW(),
  region
FROM ranked_regional;

-- RANKING LOCAL (POR ESTADO)
WITH ranked_local AS (
  SELECT 
    up.user_id,
    ul.state,
    up.total_points,
    ROW_NUMBER() OVER (PARTITION BY ul.state ORDER BY up.total_points DESC) as position
  FROM user_progress up
  JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'local',
  position,
  total_points,
  'all_time',
  NOW(),
  state
FROM ranked_local;

-- ========================================
-- PARTE 6: VERIFICAR RESULTADO
-- ========================================

-- Ver todos os rankings
SELECT 
  p.name,
  ul.state,
  r.ranking_type,
  r.region,
  r.position,
  r.total_points
FROM rankings r
JOIN profiles p ON p.id = r.user_id
LEFT JOIN user_locations ul ON ul.user_id = r.user_id
ORDER BY r.ranking_type, r.position;

-- Ver quantos rankings por usuário
SELECT 
  p.name,
  COUNT(*) as total_rankings
FROM rankings r
JOIN profiles p ON p.id = r.user_id
GROUP BY p.name
ORDER BY total_rankings DESC;

-- Ver ranking local de ES
SELECT 
  p.name,
  r.position,
  r.total_points
FROM rankings r
JOIN profiles p ON p.id = r.user_id
WHERE r.ranking_type = 'local' AND r.region = 'ES'
ORDER BY r.position;

-- ========================================
-- RESUMO DO QUE DEVE ACONTECER:
-- ========================================
-- ✅ Usa IDs REAIS do banco (não hardcoded)
-- ✅ Rankings criados automaticamente para TODOS
-- ✅ Ranking local ES mostra 4 jogadores:
--    #1: (maior pontuação em ES)
--    #2: (segunda maior em ES)
--    #3: (terceira em ES)
--    #4: (quarta em ES)
-- ✅ Níveis atualizados corretamente
-- ✅ 3 rankings por usuário (nacional, regional, local)
-- ========================================

