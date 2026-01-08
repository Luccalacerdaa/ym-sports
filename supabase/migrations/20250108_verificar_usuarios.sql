-- ========================================
-- VERIFICAR USUÁRIOS NO BANCO
-- ========================================

-- Ver quantos usuários têm progresso
SELECT 
  COUNT(*) as total_usuarios_com_progresso,
  SUM(total_points) as total_pontos_somados,
  MAX(total_points) as maior_pontuacao,
  MIN(total_points) as menor_pontuacao
FROM user_progress;

-- Ver os 10 usuários com mais pontos
SELECT 
  up.user_id,
  p.name as nome,
  up.total_points as pontos,
  up.current_level as nivel,
  ul.state as estado,
  ul.region as regiao
FROM user_progress up
LEFT JOIN profiles p ON p.id = up.user_id
LEFT JOIN user_locations ul ON ul.user_id = up.user_id
ORDER BY up.total_points DESC
LIMIT 10;

-- Ver quantos rankings existem agora
SELECT 
  ranking_type,
  COUNT(*) as quantidade,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM rankings
GROUP BY ranking_type;
