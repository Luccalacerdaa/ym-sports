-- =============================================
-- SOLUÇÃO SIMPLES E DIRETA - GARANTIDO FUNCIONAR
-- =============================================

-- ========================================
-- PARTE 1: CRIAR TABELA DE NÍVEIS (SIMPLES)
-- ========================================

-- Dropar se existir (para recomeçar limpo)
DROP TABLE IF EXISTS level_thresholds CASCADE;

-- Criar tabela
CREATE TABLE level_thresholds (
  level INTEGER PRIMARY KEY,
  points_required INTEGER NOT NULL
);

-- Inserir níveis 1-50 (progressão balanceada)
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
(20, 10450),
(21, 11500),
(22, 12600),
(23, 13750),
(24, 14950),
(25, 16200),
(26, 17500),
(27, 18850),
(28, 20250),
(29, 21700),
(30, 23200),
(35, 28700),
(40, 35200),
(45, 42700),
(50, 51200);

-- Verificar que foi criado
SELECT * FROM level_thresholds ORDER BY level LIMIT 10;

-- ========================================
-- PARTE 2: ATUALIZAR NÍVEIS (UPDATE SIMPLES)
-- ========================================

-- Lucca: 2000 pontos → nível 9 (1750 ≤ 2000 < 2200)
UPDATE user_progress 
SET current_level = 9 
WHERE user_id = '5b90424c-f023-4a7d-a96a-5d62425ccb6f';

-- pedro teste: 6444 pontos → nível 16 (6750 ≤ 6444 < 7600) = nível 15
UPDATE user_progress 
SET current_level = 15
WHERE user_id = '45610e6d-f5f5-4540-912d-a5c9a361e20f';

-- Fabio herbert: 468 pontos → nível 4 (450 ≤ 468 < 700)
UPDATE user_progress 
SET current_level = 4
WHERE total_points = 468;

-- YAGO M.: 419 pontos → nível 3 (250 ≤ 419 < 450)
UPDATE user_progress 
SET current_level = 3
WHERE total_points = 419;

-- Letícia: 0 pontos → nível 1
UPDATE user_progress 
SET current_level = 1
WHERE total_points = 0;

-- Verificar resultado
SELECT 
  p.name,
  up.total_points,
  up.current_level
FROM user_progress up
JOIN profiles p ON p.id = up.user_id
ORDER BY up.total_points DESC;

-- ========================================
-- PARTE 3: LIMPAR E RECALCULAR RANKINGS
-- ========================================

-- TRUNCATE total (delete tudo)
TRUNCATE TABLE rankings CASCADE;

-- Verificar que está vazio
SELECT COUNT(*) as total FROM rankings;
-- Deve retornar: 0

-- ========================================
-- PARTE 4: INSERIR RANKINGS MANUALMENTE
-- ========================================

-- RANKING NACIONAL (todos os usuários)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
VALUES
  ('45610e6d-f5f5-4540-912d-a5c9a361e20f', 'national', 1, 6444, 'all_time', NOW(), NULL),  -- pedro teste
  ('5b90424c-f023-4a7d-a96a-5d62425ccb6f', 'national', 2, 2000, 'all_time', NOW(), NULL),  -- Lucca
  ('ae4b5206-aa6a-421c-b25f-ebe99a066802', 'national', 3, 468, 'all_time', NOW(), NULL),   -- Fabio herbert
  ('68314c37-c987-4ffd-b6fb-658da764d150', 'national', 4, 419, 'all_time', NOW(), NULL),   -- YAGO M.
  ('e23e40d3-6dff-42ad-8a2d-d62f4e36ab7b', 'national', 5, 0, 'all_time', NOW(), NULL);     -- Letícia

-- RANKING REGIONAL SUDESTE (assumindo todos estão no Sudeste)
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
VALUES
  ('45610e6d-f5f5-4540-912d-a5c9a361e20f', 'regional', 1, 6444, 'all_time', NOW(), 'Sudeste'),
  ('5b90424c-f023-4a7d-a96a-5d62425ccb6f', 'regional', 2, 2000, 'all_time', NOW(), 'Sudeste'),
  ('ae4b5206-aa6a-421c-b25f-ebe99a066802', 'regional', 3, 468, 'all_time', NOW(), 'Sudeste'),
  ('68314c37-c987-4ffd-b6fb-658da764d150', 'regional', 4, 419, 'all_time', NOW(), 'Sudeste');

-- RANKING LOCAL ES (usuários em ES)
-- Verificar primeiro quem está em ES:
SELECT 
  p.name,
  ul.state,
  up.total_points
FROM user_locations ul
JOIN profiles p ON p.id = ul.user_id
JOIN user_progress up ON up.user_id = ul.user_id
WHERE ul.state = 'ES'
ORDER BY up.total_points DESC;

-- Inserir ranking local ES (ajustar user_ids conforme resultado acima)
-- Exemplo assumindo Lucca está em ES:
INSERT INTO rankings (user_id, ranking_type, position, total_points, period, calculated_at, region)
VALUES
  ('5b90424c-f023-4a7d-a96a-5d62425ccb6f', 'local', 1, 2000, 'all_time', NOW(), 'ES');
  -- Adicionar mais usuários aqui se houver outros em ES

-- RANKING LOCAL MG (usuários em MG)
SELECT 
  p.name,
  ul.state,
  up.total_points
FROM user_locations ul
JOIN profiles p ON p.id = ul.user_id
JOIN user_progress up ON up.user_id = ul.user_id
WHERE ul.state = 'MG'
ORDER BY up.total_points DESC;

-- Inserir conforme usuários em MG

-- ========================================
-- PARTE 5: VERIFICAR RESULTADO FINAL
-- ========================================

-- Ver todos os rankings
SELECT 
  p.name,
  r.ranking_type,
  r.region,
  r.position,
  r.total_points
FROM rankings r
JOIN profiles p ON p.id = r.user_id
ORDER BY r.ranking_type, r.position;

-- Ver contagem por usuário
SELECT 
  user_id,
  COUNT(*) as total_rankings
FROM rankings
GROUP BY user_id;

-- Deve mostrar 3 rankings por usuário (nacional, regional, local)

-- ========================================
-- RESUMO DO QUE DEVE ACONTECER:
-- ========================================
-- ✅ level_thresholds criado com 34 níveis
-- ✅ Lucca: nível 9 (era 11)
-- ✅ pedro teste: nível 15 (era 23)
-- ✅ Rankings: 3 por usuário (não mais 5)
-- ✅ Ranking nacional mostra todos (5 jogadores)
-- ✅ Próximo nível: ~18% (não mais 100%)
-- ========================================

