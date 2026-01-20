-- ============================================
-- LIMPEZA DEFINITIVA E RECONSTRUÇÃO DE RANKINGS
-- ============================================

-- 1. TRUNCATE completo da tabela rankings
TRUNCATE TABLE rankings RESTART IDENTITY CASCADE;

-- 2. Adicionar índice único para prevenir duplicatas
-- (se não existir, criar; se existir, recriar)
DROP INDEX IF EXISTS idx_rankings_unique_user_type_period;
CREATE UNIQUE INDEX idx_rankings_unique_user_type_period 
ON rankings (user_id, ranking_type, period, COALESCE(region, ''));

-- 3. Verificar que está limpo
DO $$
DECLARE
  count_rankings INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_rankings FROM rankings;
  RAISE NOTICE '✅ Tabela rankings limpa: % registros', count_rankings;
END $$;
