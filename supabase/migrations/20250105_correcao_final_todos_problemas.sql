-- =============================================
-- CORREÇÃO FINAL - TODOS OS PROBLEMAS
-- =============================================

-- ========================================
-- PROBLEMA 1: Só 1 jogador local aparece
-- ========================================
-- CAUSA: Outros usuários de ES não têm GPS (latitude/longitude NULL)
-- SOLUÇÃO: Adicionar coordenadas GPS para todos os usuários de ES

-- Ver quem está em ES mas sem GPS
SELECT 
  p.name,
  ul.state,
  ul.city_approximate,
  ul.latitude_approximate,
  ul.longitude_approximate
FROM user_locations ul
JOIN profiles p ON p.id = ul.user_id
WHERE ul.state = 'ES';

-- Adicionar coordenadas GPS para usuários de ES que não têm
-- Guarapari, ES: Latitude: -20.6667, Longitude: -40.5
UPDATE user_locations
SET 
  latitude_approximate = -20.6667,
  longitude_approximate = -40.5,
  city_approximate = COALESCE(city_approximate, 'Guarapari')
WHERE state = 'ES' 
  AND (latitude_approximate IS NULL OR longitude_approximate IS NULL);

-- Verificar que foi atualizado
SELECT 
  p.name,
  ul.state,
  ul.city_approximate,
  ul.latitude_approximate,
  ul.longitude_approximate
FROM user_locations ul
JOIN profiles p ON p.id = ul.user_id
WHERE ul.state = 'ES';

-- TODOS devem ter latitude/longitude agora!

-- ========================================
-- PROBLEMA 2: Array(4) - Rankings Duplicados
-- ========================================
-- CAUSA: Tem 2 rankings "national" (#1 e #2)
-- SOLUÇÃO: Deletar duplicatas

-- Ver rankings duplicados
SELECT 
  user_id,
  ranking_type,
  COUNT(*) as qtd
FROM rankings
WHERE period = 'all_time'
GROUP BY user_id, ranking_type
HAVING COUNT(*) > 1;

-- Deletar rankings duplicados (manter apenas o de menor posição)
DELETE FROM rankings r1
WHERE EXISTS (
  SELECT 1 
  FROM rankings r2 
  WHERE r1.user_id = r2.user_id 
    AND r1.ranking_type = r2.ranking_type 
    AND r1.period = r2.period
    AND r1.id > r2.id
);

-- Verificar que ficou 3 por usuário
SELECT 
  p.name,
  COUNT(*) as total_rankings
FROM rankings r
JOIN profiles p ON p.id = r.user_id
WHERE r.period = 'all_time'
GROUP BY p.name;

-- Deve mostrar 3 para cada usuário

-- ========================================
-- PROBLEMA 3: Nível 8 mas 100% progresso
-- ========================================
-- Isso é um problema no CÓDIGO (PlayerStats.tsx)
-- O SQL abaixo mostra os valores corretos:

SELECT 
  p.name,
  up.total_points,
  up.current_level,
  (SELECT points_required FROM level_thresholds WHERE level = up.current_level) as pontos_nivel_atual,
  (SELECT points_required FROM level_thresholds WHERE level = up.current_level + 1) as pontos_proximo_nivel,
  up.total_points - (SELECT points_required FROM level_thresholds WHERE level = up.current_level) as pontos_no_nivel,
  (SELECT points_required FROM level_thresholds WHERE level = up.current_level + 1) - 
    (SELECT points_required FROM level_thresholds WHERE level = up.current_level) as pontos_necessarios,
  ROUND(
    (up.total_points - (SELECT points_required FROM level_thresholds WHERE level = up.current_level))::NUMERIC / 
    ((SELECT points_required FROM level_thresholds WHERE level = up.current_level + 1) - 
     (SELECT points_required FROM level_thresholds WHERE level = up.current_level))::NUMERIC * 100,
    2
  ) as porcentagem_correta
FROM user_progress up
JOIN profiles p ON p.id = up.user_id
WHERE p.name = 'Lucca Lacerda';

-- Com 2000 pontos, nível 8:
-- pontos_nivel_atual: 1750
-- pontos_proximo_nivel: 2200
-- pontos_no_nivel: 250
-- pontos_necessarios: 450
-- porcentagem_correta: 55.56% ← CORRETO!

-- ========================================
-- PROBLEMA 4: Conquistas Pendentes
-- ========================================
-- Ver status atual vs requisitos

-- Ver conquistas que DEVEM estar desbloqueadas mas não estão
SELECT 
  a.name as conquista,
  a.requirement_type,
  a.requirement_value,
  CASE 
    WHEN a.requirement_type = 'workouts' THEN up.total_workouts_completed >= a.requirement_value
    WHEN a.requirement_type = 'streak' THEN up.current_workout_streak >= a.requirement_value
    WHEN a.requirement_type = 'level' THEN up.current_level >= a.requirement_value
    WHEN a.requirement_type = 'exercises' THEN up.total_exercises_completed >= a.requirement_value
    WHEN a.requirement_type = 'workout_minutes' THEN up.total_workout_minutes >= a.requirement_value
  END as deveria_ter,
  EXISTS (
    SELECT 1 FROM user_achievements ua 
    WHERE ua.user_id = up.user_id AND ua.achievement_id = a.id
  ) as ja_tem
FROM achievements a
CROSS JOIN user_progress up
JOIN profiles p ON p.id = up.user_id
WHERE p.name = 'Lucca Lacerda'
  AND a.category IN ('workout', 'streak', 'level')
ORDER BY a.requirement_type, a.requirement_value;

-- Desbloquear conquistas que faltam
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

-- Verificar quantas conquistas foram desbloqueadas
SELECT 
  p.name,
  COUNT(ua.id) as conquistas_desbloqueadas
FROM user_achievements ua
JOIN profiles p ON p.id = ua.user_id
GROUP BY p.name;

-- ========================================
-- RESUMO ESPERADO APÓS EXECUTAR:
-- ========================================
-- ✅ Todos usuários de ES têm GPS (latitude/longitude)
-- ✅ Ranking local mostra 4 jogadores:
--    - Lucca Lacerda (2000 pts)
--    - Julia Fernandes (250 pts)
--    - eduarda lacerda (200 pts)
--    - Gustavo luiz resende (200 pts)
-- ✅ Array(3) por usuário (não mais 4)
-- ✅ Conquistas desbloqueadas automaticamente
-- ⚠️ Porcentagem 100% precisa corrigir no CÓDIGO (veja abaixo)
-- ========================================

-- ========================================
-- CORREÇÃO DO CÓDIGO: PlayerStats.tsx
-- ========================================
-- Problema: Linha 34-35 ainda usa:
--   const pointsForCurrentLevel = (level - 1) * 100;
--   const pointsForNextLevel = level * 100;
--
-- Solução: Buscar da tabela level_thresholds
--   const { data: levelData } = await supabase
--     .from('level_thresholds')
--     .select('points_required')
--     .in('level', [level, level + 1]);
--
--   const pointsForCurrentLevel = levelData[0].points_required;
--   const pointsForNextLevel = levelData[1].points_required;
-- ========================================

