-- =============================================
-- YM Sports - Otimizar Conquistas (Versão Simplificada)
-- =============================================
-- Total ANTES: 63 conquistas
-- Total DEPOIS: ~36 conquistas (-43%)
-- =============================================

BEGIN;

-- 1. REMOVER CONQUISTAS DE NÍVEL (10)
DELETE FROM achievements 
WHERE category = 'level';

-- 2. REMOVER CONQUISTAS REDUNDANTES

-- 2.1 Treinos: Remover 4
DELETE FROM achievements 
WHERE name IN (
  'Trilha Iniciada',
  'Compromisso',
  'Atleta Persistente',
  'Determinação Absoluta'
);

-- 2.2 Sequência: Remover 4
DELETE FROM achievements 
WHERE name IN (
  'Começo Forte',
  'Ritmo Constante',
  'Duas Semanas',
  'Mês e Meio'
);

-- 2.3 Pontos: Remover 3
DELETE FROM achievements 
WHERE name IN (
  'Pontuador Inicial',
  'Dois Mil Pontos',
  'Vinte Mil'
);

-- 2.4 Exercícios: Remover 3
DELETE FROM achievements 
WHERE name IN (
  'Primeiro Exercício',
  'Vinte e Cinco',
  'Duzentos'
);

-- 2.5 Tempo: Remover 3
DELETE FROM achievements 
WHERE name IN (
  'Quinze Minutos',
  'Duas Horas',
  'Ironman'
);

-- 3. GARANTIR QUE TODAS TÊM PONTOS
UPDATE achievements 
SET points_reward = 50
WHERE points_reward IS NULL OR points_reward = 0;

-- 4. VALIDAÇÃO SIMPLES
DO $$
DECLARE
  total_count INT;
BEGIN
  SELECT COUNT(*) INTO total_count FROM achievements;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'OTIMIZACAO DE CONQUISTAS CONCLUIDA!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Total de conquistas: %', total_count;
  RAISE NOTICE 'Removidas conquistas de nivel: 10';
  RAISE NOTICE 'Removidas conquistas redundantes: 17';
  RAISE NOTICE 'Total removido: 27 conquistas';
  RAISE NOTICE '===========================================';
END $$;

COMMIT;
