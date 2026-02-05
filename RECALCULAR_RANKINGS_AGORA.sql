-- =====================================================
-- ⚡ COPIE E COLE ESTE SCRIPT NO SUPABASE SQL EDITOR
-- =====================================================
-- Vai recalcular rankings de TODOS os usuários
-- Execute TUDO de uma vez (Ctrl+A, Ctrl+Enter)

-- 1️⃣ LIMPAR RANKINGS ANTIGOS
DELETE FROM rankings;

-- 2️⃣ RANKING NACIONAL (TODOS)
INSERT INTO rankings (user_id, ranking_type, region, position, total_points, period, calculated_at)
SELECT 
  up.user_id,
  'national',
  NULL,
  ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.user_id),
  COALESCE(up.total_points, 0),
  'all_time',
  NOW()
FROM user_progress up
WHERE COALESCE(up.total_points, 0) >= 0
ORDER BY up.total_points DESC;

-- 3️⃣ RANKING REGIONAL (POR REGIÃO: Sudeste, Sul, etc)
INSERT INTO rankings (user_id, ranking_type, region, position, total_points, period, calculated_at)
SELECT 
  up.user_id,
  'regional',
  ul.region,
  ROW_NUMBER() OVER (PARTITION BY ul.region ORDER BY up.total_points DESC, up.user_id),
  COALESCE(up.total_points, 0),
  'all_time',
  NOW()
FROM user_progress up
INNER JOIN user_locations ul ON up.user_id = ul.user_id
WHERE ul.region IS NOT NULL
  AND COALESCE(up.total_points, 0) >= 0
ORDER BY ul.region, up.total_points DESC;

-- 4️⃣ RANKING LOCAL (POR ESTADO: MG, SP, RJ, etc)
INSERT INTO rankings (user_id, ranking_type, region, position, total_points, period, calculated_at)
SELECT 
  up.user_id,
  'local',
  ul.state,
  ROW_NUMBER() OVER (PARTITION BY ul.state ORDER BY up.total_points DESC, up.user_id),
  COALESCE(up.total_points, 0),
  'all_time',
  NOW()
FROM user_progress up
INNER JOIN user_locations ul ON up.user_id = ul.user_id
WHERE ul.state IS NOT NULL
  AND COALESCE(up.total_points, 0) >= 0
ORDER BY ul.state, up.total_points DESC;

-- 5️⃣ VERIFICAR RESULTADO
SELECT 
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM rankings
GROUP BY ranking_type;

-- ✅ PRONTO! Agora atualize a página do app e veja todos os jogadores!
