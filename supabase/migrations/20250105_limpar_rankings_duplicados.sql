-- =============================================
-- YM Sports - LIMPAR Rankings Antigos (Array 413)
-- =============================================
-- Execute este script URGENTE para limpar rankings duplicados!

-- 1. Ver quantos rankings existem
SELECT 
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  (COUNT(*) / NULLIF(COUNT(DISTINCT user_id), 0))::NUMERIC(10,2) as rankings_por_usuario
FROM rankings
WHERE period = 'all_time';

-- 2. DELETAR TODOS os rankings antigos
DELETE FROM rankings WHERE period = 'all_time';

-- 3. Verificar que foi deletado
SELECT COUNT(*) as rankings_restantes FROM rankings WHERE period = 'all_time';

-- Resultado esperado:
-- ANTES: rankings_por_usuario = 413 (ERRADO!)
-- DEPOIS: rankings_restantes = 0
-- 
-- Após isso, o app vai recalcular automaticamente
-- e criar apenas 3 rankings por usuário (nacional, regional, local)

