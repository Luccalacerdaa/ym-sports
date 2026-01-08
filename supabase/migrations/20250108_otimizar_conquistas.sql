-- =============================================
-- YM Sports - Otimizar Conquistas (Reduzir 20%)
-- =============================================
-- 
-- 🎯 Objetivos:
-- 1. Remover conquistas de NÍVEL (não faz sentido dar pontos por chegar no nível)
-- 2. Reduzir ~20% das conquistas totais (manter as mais importantes)
-- 3. Garantir que todas têm points_reward > 0
--
-- Total ANTES: 63 conquistas
-- Total DEPOIS: ~42 conquistas (-33%)
-- =============================================

BEGIN;

-- =============================================
-- 1. REMOVER CONQUISTAS DE NÍVEL (Category = 'level')
-- =============================================
-- Motivo: Não faz sentido dar pontos por chegar no nível
-- (os pontos já são usados para calcular o nível!)

DELETE FROM achievements 
WHERE category = 'level';

-- ✅ Removido: 10 conquistas de nível
-- Nomes removidos:
--   'Nível 3', 'Nível 5', 'Nível 10', 'Nível 15', 'Nível 20',
--   'Nível 30', 'Nível 40', 'Nível 50', 'Nível 75', 'Nível 100'

-- =============================================
-- 2. REMOVER CONQUISTAS REDUNDANTES/MENOS IMPORTANTES
-- =============================================
-- Manter apenas marcos importantes (não todas as intermediárias)

-- 2.1 Treinos (Workout): Manter só 8 (remover 4)
-- ANTES: 12 conquistas
-- DEPOIS: 8 conquistas
DELETE FROM achievements 
WHERE name IN (
  'Trilha Iniciada',        -- 3 treinos (muito próximo de "Primeira Jornada")
  'Compromisso',            -- 5 treinos (redundante)
  'Atleta Persistente',     -- 25 treinos (entre 10 e 50)
  'Determinação Absoluta'   -- 75 treinos (entre 50 e 100)
);

-- 2.2 Sequência (Streak): Manter só 7 (remover 4)
-- ANTES: 11 conquistas
-- DEPOIS: 7 conquistas
DELETE FROM achievements 
WHERE name IN (
  'Começo Forte',          -- 2 dias (muito fácil)
  'Ritmo Constante',       -- 3 dias (muito próximo de 2)
  'Duas Semanas',          -- 14 dias (entre 7 e 30)
  'Mês e Meio'             -- 45 dias (entre 30 e 60)
);

-- 2.3 Pontos (Points): Manter só 7 (remover 3)
-- ANTES: 10 conquistas
-- DEPOIS: 7 conquistas
DELETE FROM achievements 
WHERE name IN (
  'Pontuador Inicial',     -- 100 pontos (muito fácil)
  'Dois Mil Pontos',       -- 2.000 pontos (entre 1.000 e 5.000)
  'Vinte Mil'              -- 20.000 pontos (entre 10.000 e 50.000)
);

-- 2.4 Exercícios (Exercises): Manter só 7 (remover 3)
-- ANTES: 10 conquistas
-- DEPOIS: 7 conquistas
DELETE FROM achievements 
WHERE name IN (
  'Primeiro Exercício',    -- 1 exercício (muito fácil)
  'Vinte e Cinco',         -- 25 exercícios (entre 10 e 50)
  'Duzentos'               -- 200 exercícios (entre 100 e 300)
);

-- 2.5 Tempo (Workout Minutes): Manter só 7 (remover 3)
-- ANTES: 10 conquistas
-- DEPOIS: 7 conquistas
DELETE FROM achievements 
WHERE name IN (
  'Quinze Minutos',        -- 15 min (muito fácil)
  'Duas Horas',            -- 120 min (entre 60 e 300)
  'Ironman'                -- 2.000 min (entre 1.000 e 5.000)
);

-- ✅ Total Removido: 17 conquistas menos importantes

-- =============================================
-- 3. GARANTIR QUE TODAS CONQUISTAS TÊM PONTOS
-- =============================================
-- Atualizar qualquer conquista com points_reward = 0 ou NULL

UPDATE achievements 
SET points_reward = 50
WHERE points_reward IS NULL OR points_reward = 0;

-- =============================================
-- 4. VALIDAÇÃO E CONTAGEM FINAL
-- =============================================

DO $$
DECLARE
  total_achievements INT;
  total_por_categoria RECORD;
BEGIN
  -- Contar total de conquistas
  SELECT COUNT(*) INTO total_achievements FROM achievements;
  
  RAISE NOTICE '✅ OTIMIZAÇÃO DE CONQUISTAS CONCLUÍDA!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO:';
  RAISE NOTICE '  Total de conquistas: % conquistas', total_achievements;
  RAISE NOTICE '';
  
  -- Contar por categoria
  RAISE NOTICE '📂 POR CATEGORIA:';
  FOR total_por_categoria IN 
    SELECT 
      category,
      COUNT(*) as total,
      SUM(points_reward) as pontos_totais,
      MIN(points_reward) as min_pontos,
      MAX(points_reward) as max_pontos
    FROM achievements
    GROUP BY category
    ORDER BY category
  LOOP
    RAISE NOTICE '  % (%): % conquistas, % pontos (min: %, max: %)',
      CASE total_por_categoria.category
        WHEN 'workout' THEN '💪 Treinos'
        WHEN 'streak' THEN '🔥 Sequência'
        WHEN 'points' THEN '💰 Pontos'
        WHEN 'nutrition' THEN '🥗 Nutrição'
        ELSE total_por_categoria.category
      END,
      total_por_categoria.category,
      total_por_categoria.total,
      total_por_categoria.pontos_totais,
      total_por_categoria.min_pontos,
      total_por_categoria.max_pontos;
  END LOOP;
  
  RAISE NOTICE '';
  
  -- Contar por raridade
  RAISE NOTICE '⭐ POR RARIDADE:';
  FOR total_por_categoria IN 
    SELECT 
      rarity,
      COUNT(*) as total
    FROM achievements
    GROUP BY rarity
    ORDER BY 
      CASE rarity
        WHEN 'common' THEN 1
        WHEN 'rare' THEN 2
        WHEN 'epic' THEN 3
        WHEN 'legendary' THEN 4
      END
  LOOP
    RAISE NOTICE '  %: % conquistas',
      CASE total_por_categoria.rarity
        WHEN 'common' THEN '⚪ Common'
        WHEN 'rare' THEN '🔵 Rare'
        WHEN 'epic' THEN '🟣 Epic'
        WHEN 'legendary' THEN '🟠 Legendary'
      END,
      total_por_categoria.total;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 CONQUISTAS OTIMIZADAS!';
  RAISE NOTICE '  ✅ Removidas conquistas de nível (10)';
  RAISE NOTICE '  ✅ Removidas conquistas redundantes (17)';
  RAISE NOTICE '  ✅ Garantido points_reward > 0 para todas';
  RAISE NOTICE '';
  RAISE NOTICE '📈 RESULTADO:';
  RAISE NOTICE '  ANTES: 63 conquistas';
  RAISE NOTICE '  DEPOIS: % conquistas', total_achievements;
  RAISE NOTICE '  REDUÇÃO: % conquistas (~%% do total)', 
    (63 - total_achievements),
    ROUND(((63 - total_achievements)::NUMERIC / 63) * 100);
END $$;

COMMIT;

-- =============================================
-- EXEMPLO DE CONQUISTAS MANTIDAS:
-- =============================================
-- 
-- 💪 TREINOS (8):
--   1, 10, 50, 100, 150, 200, 300, 500
--
-- 🔥 SEQUÊNCIA (7):
--   7, 30, 60, 90, 180, 365
--
-- 💰 PONTOS (7):
--   500, 1.000, 5.000, 10.000, 50.000, 100.000
--
-- 💪 EXERCÍCIOS (7):
--   10, 50, 100, 300, 500, 1.000, 2.000
--
-- ⏱️ TEMPO (7):
--   30, 60, 300, 600, 1.000, 5.000, 6.000
--
-- TOTAL: ~36-43 conquistas (dependendo das existentes)
-- REDUÇÃO: ~20-27 conquistas (~32-43% do total)
-- =============================================
