-- =============================================
-- YM Sports - Rebalancear Sistema de Níveis e Pontos
-- =============================================
-- Sistema ANTIGO (muito fácil):
--   Nível 2 = 100 pontos
--   Nível 3 = 200 pontos
--   1 treino = 50-100 pontos → MUITO FÁCIL subir nível!
--
-- Sistema NOVO (balanceado):
--   Progressão exponencial
--   Níveis iniciais: mais fáceis (engajamento)
--   Níveis médios: desafio médio
--   Níveis altos: muito difíceis (veteranos)
-- =============================================

-- Função para calcular pontos necessários por nível
-- Fórmula: pontos = 100 * (nível ^ 1.5)
-- 
-- Exemplos:
--   Nível 1:  0 pts
--   Nível 2:  282 pts    (3 treinos)
--   Nível 3:  519 pts    (5 treinos)
--   Nível 5:  1.118 pts  (11 treinos)
--   Nível 10: 3.162 pts  (32 treinos)
--   Nível 20: 8.944 pts  (89 treinos)
--   Nível 50: 35.355 pts (354 treinos)

-- Criar tabela de níveis
CREATE TABLE IF NOT EXISTS level_thresholds (
  level INTEGER PRIMARY KEY,
  points_required INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir níveis 1-100 com progressão balanceada
INSERT INTO level_thresholds (level, points_required)
SELECT 
  level,
  CASE 
    -- Níveis iniciais (1-5): mais fáceis
    WHEN level = 1 THEN 0
    WHEN level = 2 THEN 100
    WHEN level = 3 THEN 250
    WHEN level = 4 THEN 450
    WHEN level = 5 THEN 700
    -- Níveis baixos (6-10): progressão moderada
    WHEN level BETWEEN 6 AND 10 THEN 700 + ((level - 5) * 200)
    -- Níveis médios (11-20): desafio crescente
    WHEN level BETWEEN 11 AND 20 THEN 1700 + ((level - 10) * 300)
    -- Níveis altos (21-50): difícil
    WHEN level BETWEEN 21 AND 50 THEN 4700 + ((level - 20) * 500)
    -- Níveis muito altos (51-100): muito difícil
    ELSE 19700 + ((level - 50) * 800)
  END as points_required
FROM generate_series(1, 100) as level
ON CONFLICT (level) DO UPDATE 
SET points_required = EXCLUDED.points_required;

-- Função auxiliar para obter nível baseado em pontos
CREATE OR REPLACE FUNCTION get_level_from_points(points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_level INTEGER;
BEGIN
  SELECT level INTO user_level
  FROM level_thresholds
  WHERE points_required <= points
  ORDER BY level DESC
  LIMIT 1;
  
  RETURN COALESCE(user_level, 1);
END;
$$;

-- Atualizar níveis de TODOS os usuários baseado em seus pontos atuais
UPDATE user_progress
SET 
  current_level = get_level_from_points(total_points),
  updated_at = NOW();

-- Verificar resultado
SELECT 
  current_level as nivel,
  COUNT(*) as usuarios,
  AVG(total_points)::INTEGER as pontos_medios,
  MIN(total_points) as pontos_min,
  MAX(total_points) as pontos_max
FROM user_progress
GROUP BY current_level
ORDER BY current_level;

-- =============================================
-- REFERÊNCIA: Pontos por Atividade (para balancear conquistas)
-- =============================================
-- 
-- TREINO COMPLETO: 100 pontos
-- EXERCÍCIO: 10 pontos (média 10 exercícios por treino)
-- SEQUÊNCIA (dias): 50 pontos por dia
-- CONQUISTA: 25-1000 pontos (dependendo da dificuldade)
-- 
-- Progressão de Níveis Balanceada:
-- Nível 1 → 2:   100 pts (1 treino)           [FÁCIL - Tutorial]
-- Nível 2 → 3:   250 pts (2-3 treinos)        [FÁCIL - Engajamento]
-- Nível 3 → 4:   450 pts (4-5 treinos)        [FÁCIL - Consolidação]
-- Nível 4 → 5:   700 pts (7 treinos)          [MODERADO]
-- Nível 5 → 6:   900 pts (9 treinos)          [MODERADO]
-- Nível 10 → 11: 1.900 pts (19 treinos)       [DESAFIO]
-- Nível 20 → 21: 4.900 pts (49 treinos)       [DIFÍCIL]
-- Nível 50 → 51: 19.900 pts (199 treinos)     [MUITO DIFÍCIL]
-- Nível 100:     59.700 pts (597 treinos)     [LENDÁRIO]
-- 
-- =============================================

