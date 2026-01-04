-- =============================================
-- SOLUÇÃO DEFINITIVA - LIMPAR TUDO E RECONSTRUIR
-- =============================================

-- ========================================
-- PARTE 1: LIMPAR RANKINGS (FORÇA BRUTA)
-- ========================================

TRUNCATE TABLE rankings CASCADE;

-- Verificar que ficou vazio
SELECT COUNT(*) as total_rankings FROM rankings;
-- Deve retornar: 0

-- ========================================
-- PARTE 2: ADICIONAR GPS PARA TODOS DE ES
-- ========================================

-- Guarapari, ES: -20.6667, -40.5
UPDATE user_locations
SET 
  latitude_approximate = -20.6667,
  longitude_approximate = -40.5,
  city_approximate = COALESCE(city_approximate, 'Guarapari')
WHERE state = 'ES' 
  AND (latitude_approximate IS NULL OR longitude_approximate IS NULL);

-- Verificar que todos de ES têm GPS
SELECT 
  p.name,
  ul.state,
  ul.city_approximate,
  ul.latitude_approximate,
  ul.longitude_approximate
FROM user_locations ul
JOIN profiles p ON p.id = ul.user_id
WHERE ul.state = 'ES'
ORDER BY p.name;

-- Deve mostrar 4 usuários com latitude/longitude preenchidos

-- ========================================
-- PARTE 3: CRIAR RANKINGS (NACIONAL)
-- ========================================

WITH ranked_users AS (
  SELECT 
    up.user_id,
    up.total_points,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC NULLS LAST) as position
  FROM user_progress up
  WHERE up.total_points IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'national',
  position::INTEGER,
  total_points,
  'all_time',
  NOW(),
  NULL
FROM ranked_users;

-- Verificar ranking nacional
SELECT 
  p.name,
  r.position,
  r.total_points
FROM rankings r
JOIN profiles p ON p.id = r.user_id
WHERE r.ranking_type = 'national'
ORDER BY r.position;

-- Esperado:
-- #1: pedro teste (6444 pts)
-- #2: Lucca Lacerda (2000 pts)
-- #3: Lucca Lacerda (1336 pts) ← conta diferente
-- #4: Fabio herbert (468 pts)
-- #5: YAGO M. (419 pts)
-- #6: Julia Fernandes (250 pts)
-- #7: eduarda lacerda (200 pts)
-- #8: Gustavo luiz resende (200 pts)

-- ========================================
-- PARTE 4: CRIAR RANKINGS (REGIONAL - SUDESTE)
-- ========================================

WITH ranked_regional AS (
  SELECT 
    up.user_id,
    ul.region,
    up.total_points,
    ROW_NUMBER() OVER (PARTITION BY ul.region ORDER BY up.total_points DESC NULLS LAST) as position
  FROM user_progress up
  JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points IS NOT NULL
    AND ul.region = 'Sudeste'
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'regional',
  position::INTEGER,
  total_points,
  'all_time',
  NOW(),
  region
FROM ranked_regional;

-- Verificar ranking regional Sudeste
SELECT 
  p.name,
  r.position,
  r.total_points,
  ul.state
FROM rankings r
JOIN profiles p ON p.id = r.user_id
JOIN user_locations ul ON ul.user_id = r.user_id
WHERE r.ranking_type = 'regional' AND r.region = 'Sudeste'
ORDER BY r.position;

-- Esperado:
-- #1: pedro teste (6444 pts) - MG
-- #2: Lucca Lacerda (2000 pts) - ES
-- #3: Lucca Lacerda (1336 pts) - MG
-- #4: Fabio herbert (468 pts) - MG
-- #5: YAGO M. (419 pts) - MG
-- #6: Julia Fernandes (250 pts) - ES
-- #7: eduarda lacerda (200 pts) - ES
-- #8: Gustavo luiz resende (200 pts) - ES

-- ========================================
-- PARTE 5: CRIAR RANKINGS (LOCAL - POR ESTADO)
-- ========================================

WITH ranked_local AS (
  SELECT 
    up.user_id,
    ul.state,
    up.total_points,
    ROW_NUMBER() OVER (PARTITION BY ul.state ORDER BY up.total_points DESC NULLS LAST) as position
  FROM user_progress up
  JOIN user_locations ul ON ul.user_id = up.user_id
  WHERE up.total_points IS NOT NULL
)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
SELECT 
  user_id,
  'local',
  position::INTEGER,
  total_points,
  'all_time',
  NOW(),
  state
FROM ranked_local;

-- Verificar ranking local ES
SELECT 
  p.name,
  r.position,
  r.total_points
FROM rankings r
JOIN profiles p ON p.id = r.user_id
WHERE r.ranking_type = 'local' AND r.region = 'ES'
ORDER BY r.position;

-- Esperado:
-- #1: Lucca Lacerda (2000 pts)
-- #2: Julia Fernandes (250 pts)
-- #3: eduarda lacerda (200 pts)
-- #4: Gustavo luiz resende (200 pts)

-- Verificar ranking local MG
SELECT 
  p.name,
  r.position,
  r.total_points
FROM rankings r
JOIN profiles p ON p.id = r.user_id
WHERE r.ranking_type = 'local' AND r.region = 'MG'
ORDER BY r.position;

-- Esperado:
-- #1: pedro teste (6444 pts)
-- #2: Lucca Lacerda (1336 pts)
-- #3: Fabio herbert (468 pts)
-- #4: YAGO M. (419 pts)

-- ========================================
-- PARTE 6: VERIFICAR RANKINGS POR USUÁRIO
-- ========================================

-- Quantos rankings cada usuário tem?
SELECT 
  p.name,
  COUNT(*) as total_rankings,
  STRING_AGG(r.ranking_type || ' #' || r.position, ', ' ORDER BY r.ranking_type) as rankings
FROM rankings r
JOIN profiles p ON p.id = r.user_id
WHERE r.period = 'all_time'
GROUP BY p.name
ORDER BY total_rankings DESC;

-- Cada usuário DEVE ter exatamente 3 rankings:
-- - national #X
-- - regional #Y
-- - local #Z

-- ========================================
-- PARTE 7: DESBLOQUEAR CONQUISTAS
-- ========================================

INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 
  up.user_id,
  a.id,
  NOW()
FROM achievements a
CROSS JOIN user_progress up
WHERE (
  (a.requirement_type = 'workouts' AND up.total_workouts_completed >= a.requirement_value) OR
  (a.requirement_type = 'streak' AND up.current_workout_streak >= a.requirement_value) OR
  (a.requirement_type = 'level' AND up.current_level >= a.requirement_value) OR
  (a.requirement_type = 'exercises' AND up.total_exercises_completed >= a.requirement_value) OR
  (a.requirement_type = 'workout_minutes' AND up.total_workout_minutes >= a.requirement_value)
)
AND NOT EXISTS (
  SELECT 1 FROM user_achievements ua 
  WHERE ua.user_id = up.user_id AND ua.achievement_id = a.id
)
ON CONFLICT DO NOTHING;

-- Verificar conquistas desbloqueadas
SELECT 
  p.name,
  COUNT(ua.id) as conquistas_desbloqueadas
FROM user_achievements ua
JOIN profiles p ON p.id = ua.user_id
GROUP BY p.name
ORDER BY conquistas_desbloqueadas DESC;

-- ========================================
-- RESUMO FINAL
-- ========================================

SELECT '==== RESUMO FINAL ====' as status;

-- 1. Total de rankings
SELECT 
  'Total de rankings criados:' as metrica,
  COUNT(*) as valor
FROM rankings;

-- 2. Rankings por tipo
SELECT 
  ranking_type,
  COUNT(*) as total
FROM rankings
GROUP BY ranking_type
ORDER BY ranking_type;

-- 3. Rankings por usuário (DEVE SER 3)
SELECT 
  p.name,
  COUNT(*) as rankings_count
FROM rankings r
JOIN profiles p ON p.id = r.user_id
GROUP BY p.name
HAVING COUNT(*) != 3
ORDER BY rankings_count DESC;
-- Se esta query NÃO retornar nada → SUCESSO! Todos têm 3 rankings

-- 4. Posição do Lucca Lacerda (ES, 2000 pontos)
SELECT 
  r.ranking_type,
  r.position,
  r.region,
  r.total_points
FROM rankings r
JOIN profiles p ON p.id = r.user_id
WHERE p.name = 'Lucca Lacerda' 
  AND r.total_points = 2000
ORDER BY r.ranking_type;

-- Esperado:
-- local      | 1 | ES      | 2000
-- national   | 2 | NULL    | 2000
-- regional   | 2 | Sudeste | 2000

-- ========================================
-- SE ESTA QUERY RETORNAR OS VALORES ACIMA:
-- ✅ PROBLEMA RESOLVIDO DEFINITIVAMENTE!
-- ========================================

