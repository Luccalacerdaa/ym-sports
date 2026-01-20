-- ============================================
-- EXECUTAR NO SUPABASE DASHBOARD - SQL EDITOR
-- ============================================
-- 
-- 1. Vá em: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. SQL Editor → New Query
-- 4. Cole ESTE código
-- 5. Clique em RUN
-- 6. Aguarde: "Success. No rows returned"
-- 7. Volte para /dashboard/admin-rankings
-- 8. Clique em "Recalcular Tudo"
-- ============================================

-- 1. REMOVER índice único temporariamente
DROP INDEX IF EXISTS idx_rankings_unique_user_type_period;

-- 2. TRUNCATE completo (limpa tudo e reseta IDs)
TRUNCATE TABLE rankings RESTART IDENTITY CASCADE;

-- 3. Verificar que está vazio
DO $$
DECLARE
  count_rankings INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_rankings FROM rankings;
  RAISE NOTICE '✅ Tabela rankings limpa: % registros', count_rankings;
  
  IF count_rankings > 0 THEN
    RAISE EXCEPTION '❌ ERRO: Ainda há % registros na tabela!', count_rankings;
  END IF;
END $$;

-- 4. RECRIAR índice único (agora sem duplicatas)
CREATE UNIQUE INDEX idx_rankings_unique_user_type_period 
ON rankings (user_id, ranking_type, period, COALESCE(region, ''));

-- Mensagem final
DO $$
BEGIN
  RAISE NOTICE '🎉 SUCESSO! Tabela limpa e índice recriado.';
  RAISE NOTICE '📋 Próximo passo: Volte para /dashboard/admin-rankings';
  RAISE NOTICE '📋 E clique em "Recalcular Tudo"';
END $$;
