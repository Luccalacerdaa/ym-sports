-- =============================================
-- DIAGNÓSTICO E CORREÇÃO URGENTE
-- =============================================

-- 1️⃣ VER QUANTOS RANKINGS EXISTEM POR USUÁRIO
SELECT 
  user_id,
  COUNT(*) as total_rankings,
  STRING_AGG(DISTINCT ranking_type, ', ') as tipos,
  STRING_AGG(DISTINCT region, ', ') as regioes
FROM rankings
WHERE period = 'all_time'
GROUP BY user_id
ORDER BY total_rankings DESC;

-- Se aparecer mais de 3 rankings por usuário, PROBLEMA!

-- 2️⃣ VER DETALHES DOS RANKINGS
SELECT 
  r.user_id,
  p.name as usuario_nome,
  r.ranking_type,
  r.region,
  r.position,
  r.total_points,
  r.calculated_at
FROM rankings r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.period = 'all_time'
ORDER BY r.user_id, r.ranking_type;

-- 3️⃣ FORÇAR DELETE COMPLETO (se ainda houver duplicatas)
TRUNCATE TABLE rankings CASCADE;

-- ⚠️ ATENÇÃO: TRUNCATE deleta TUDO!
-- Os rankings serão recriados automaticamente pelo app

-- 4️⃣ VERIFICAR TABELA level_thresholds
SELECT * FROM level_thresholds ORDER BY level LIMIT 10;

-- Se retornar erro "relation does not exist", a tabela não foi criada!

-- 5️⃣ VERIFICAR NÍVEIS DOS USUÁRIOS
SELECT 
  p.name,
  up.total_points,
  up.current_level,
  (SELECT points_required FROM level_thresholds WHERE level = up.current_level) as pontos_nivel_atual,
  (SELECT points_required FROM level_thresholds WHERE level = up.current_level + 1) as pontos_proximo_nivel,
  (SELECT level FROM level_thresholds WHERE points_required <= up.total_points ORDER BY level DESC LIMIT 1) as nivel_correto
FROM user_progress up
LEFT JOIN profiles p ON p.id = up.user_id;

-- Se "nivel_correto" for diferente de "current_level", está errado!

-- 6️⃣ FORÇAR RECÁLCULO DE NÍVEIS
DO $$
DECLARE
  user_record RECORD;
  correct_level INTEGER;
BEGIN
  FOR user_record IN SELECT user_id, total_points FROM user_progress LOOP
    -- Calcular nível correto
    SELECT level INTO correct_level
    FROM level_thresholds
    WHERE points_required <= user_record.total_points
    ORDER BY level DESC
    LIMIT 1;
    
    -- Se não encontrou, usar nível 1
    IF correct_level IS NULL THEN
      correct_level := 1;
    END IF;
    
    -- Atualizar
    UPDATE user_progress
    SET current_level = correct_level
    WHERE user_id = user_record.user_id;
    
    RAISE NOTICE 'Usuário % atualizado para nível %', user_record.user_id, correct_level;
  END LOOP;
END $$;

-- 7️⃣ VERIFICAR CONQUISTAS PENDENTES
SELECT 
  a.id as achievement_id,
  a.name as conquista,
  a.requirement_type,
  a.requirement_value as requisito,
  a.category,
  COUNT(ua.id) as usuarios_que_tem
FROM achievements a
LEFT JOIN user_achievements ua ON ua.achievement_id = a.id
WHERE a.category IN ('workout', 'streak', 'level')
GROUP BY a.id, a.name, a.requirement_type, a.requirement_value, a.category
ORDER BY a.category, a.requirement_value;

-- 8️⃣ VERIFICAR PROGRESSO VS CONQUISTAS DO USUÁRIO
-- Substituir 'SEU_USER_ID' pelo seu ID real
SELECT 
  up.total_workouts_completed,
  up.current_workout_streak,
  up.current_level,
  up.total_exercises_completed,
  COUNT(ua.id) as conquistas_obtidas
FROM user_progress up
LEFT JOIN user_achievements ua ON ua.user_id = up.user_id
WHERE up.user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f' -- ← TROCAR AQUI
GROUP BY up.total_workouts_completed, up.current_workout_streak, up.current_level, up.total_exercises_completed;

-- 9️⃣ DESBLOQUEAR CONQUISTAS MANUALMENTE
-- Para "Primeira Jornada" (1 treino)
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 
  up.user_id,
  a.id,
  NOW()
FROM user_progress up
CROSS JOIN achievements a
WHERE a.name = 'Primeira Jornada'
  AND up.total_workouts_completed >= 1
  AND NOT EXISTS (
    SELECT 1 FROM user_achievements ua 
    WHERE ua.user_id = up.user_id 
    AND ua.achievement_id = a.id
  )
ON CONFLICT DO NOTHING;

-- Para "Começo Forte" (2 dias consecutivos)
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 
  up.user_id,
  a.id,
  NOW()
FROM user_progress up
CROSS JOIN achievements a
WHERE a.name = 'Começo Forte'
  AND up.current_workout_streak >= 2
  AND NOT EXISTS (
    SELECT 1 FROM user_achievements ua 
    WHERE ua.user_id = up.user_id 
    AND ua.achievement_id = a.id
  )
ON CONFLICT DO NOTHING;

-- Para "Nível 3"
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 
  up.user_id,
  a.id,
  NOW()
FROM user_progress up
CROSS JOIN achievements a
WHERE a.name = 'Nível 3'
  AND up.current_level >= 3
  AND NOT EXISTS (
    SELECT 1 FROM user_achievements ua 
    WHERE ua.user_id = up.user_id 
    AND ua.achievement_id = a.id
  )
ON CONFLICT DO NOTHING;

-- 🔟 VERIFICAR JOGADORES PRÓXIMOS (GPS)
SELECT 
  p.name,
  ul.state,
  ul.city_approximate,
  ul.latitude_approximate,
  ul.longitude_approximate,
  up.total_points
FROM user_locations ul
JOIN profiles p ON p.id = ul.user_id
JOIN user_progress up ON up.user_id = ul.user_id
WHERE ul.state = 'ES'
ORDER BY up.total_points DESC;

-- Se só aparecer 1 jogador, problema é que só há 1 usuário em ES!

-- 1️⃣1️⃣ CALCULAR DISTÂNCIA ENTRE JOGADORES
-- Substituir as coordenadas pelo seu local
SELECT 
  p.name,
  ul.city_approximate,
  ul.latitude_approximate,
  ul.longitude_approximate,
  -- Fórmula Haversine para calcular distância
  (
    6371 * acos(
      cos(radians(-20.66682)) * -- ← Sua latitude
      cos(radians(ul.latitude_approximate::FLOAT)) *
      cos(radians(ul.longitude_approximate::FLOAT) - radians(-40.50473)) + -- ← Sua longitude
      sin(radians(-20.66682)) *
      sin(radians(ul.latitude_approximate::FLOAT))
    )
  )::NUMERIC(10,2) as distancia_km
FROM user_locations ul
JOIN profiles p ON p.id = ul.user_id
WHERE ul.latitude_approximate IS NOT NULL
  AND ul.longitude_approximate IS NOT NULL
ORDER BY distancia_km;

-- Se distância > 100km, não aparecerá no ranking local

-- =============================================
-- ORDEM DE EXECUÇÃO RECOMENDADA:
-- =============================================
-- 1. Execute SQL #1 (diagnóstico rankings)
-- 2. Se aparecer > 3 rankings por usuário, execute SQL #3 (TRUNCATE)
-- 3. Execute SQL #4 (verificar level_thresholds)
-- 4. Execute SQL #6 (forçar recálculo níveis)
-- 5. Execute SQL #9 (desbloquear conquistas manualmente)
-- 6. Execute SQL #10 (ver jogadores em ES)
-- 7. Hard Refresh (Ctrl+Shift+R)
-- =============================================

