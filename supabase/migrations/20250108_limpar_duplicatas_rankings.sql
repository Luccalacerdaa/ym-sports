-- ========================================
-- LIMPAR DUPLICATAS DE RANKINGS
-- ========================================
-- Problema: Banco tem 10-13 entradas duplicadas por usuário
-- Solução: Manter apenas 1 entrada por (user_id, ranking_type, region)

-- Passo 1: Deletar TODAS as duplicatas, mantendo apenas UMA entrada por combinação
DELETE FROM rankings
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, ranking_type, COALESCE(region, ''))
    id
  FROM rankings
  ORDER BY user_id, ranking_type, COALESCE(region, ''), position ASC
);

-- Passo 2: Criar índice único para IMPEDIR duplicatas futuras
CREATE UNIQUE INDEX IF NOT EXISTS idx_rankings_unique_entry
ON rankings (user_id, ranking_type, COALESCE(region, ''));

-- Passo 3: Verificar resultado
DO $$
DECLARE
  total_after INT;
  users_count INT;
BEGIN
  SELECT COUNT(*) INTO total_after FROM rankings;
  SELECT COUNT(DISTINCT user_id) INTO users_count FROM rankings;
  
  RAISE NOTICE '✅ Limpeza concluída!';
  RAISE NOTICE '📊 Total de rankings: %', total_after;
  RAISE NOTICE '👥 Usuários únicos: %', users_count;
  RAISE NOTICE '📈 Média por usuário: %', ROUND(total_after::NUMERIC / NULLIF(users_count, 0), 2);
END $$;
