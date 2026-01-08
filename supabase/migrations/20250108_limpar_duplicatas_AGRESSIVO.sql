-- ========================================
-- LIMPAR DUPLICATAS AGRESSIVAMENTE
-- ========================================

-- Passo 1: DELETAR TUDO (começar do zero)
TRUNCATE TABLE rankings CASCADE;

-- Passo 2: Remover constraints e índices problemáticos
DROP INDEX IF EXISTS idx_rankings_unique_entry;
ALTER TABLE rankings DROP CONSTRAINT IF EXISTS rankings_user_id_ranking_type_region_period_key;

-- Passo 3: Criar índice de performance (NÃO único)
CREATE INDEX IF NOT EXISTS idx_rankings_lookup
ON rankings (user_id, ranking_type, region, period);

-- Passo 4: Verificar que está vazio
DO $$
DECLARE
  total_after INT;
BEGIN
  SELECT COUNT(*) INTO total_after FROM rankings;
  
  IF total_after = 0 THEN
    RAISE NOTICE '✅ Tabela rankings limpa com sucesso!';
    RAISE NOTICE '📊 Total de rankings: 0 (pronto para recalcular)';
  ELSE
    RAISE WARNING '⚠️ Ainda existem % rankings na tabela', total_after;
  END IF;
END $$;
