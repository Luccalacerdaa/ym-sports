-- =============================================
-- Corrigir Níveis Incorretos dos Usuários
-- =============================================
-- Problema: Usuários com nível calculado pela fórmula antiga
-- Solução: Recalcular níveis baseado em level_thresholds

BEGIN;

-- Atualizar níveis de todos os usuários baseado em level_thresholds
UPDATE user_progress
SET current_level = (
  SELECT COALESCE(
    (
      SELECT level 
      FROM level_thresholds 
      WHERE points_required <= user_progress.total_points
      ORDER BY level DESC 
      LIMIT 1
    ),
    1 -- Nível mínimo é 1
  )
)
WHERE user_id IS NOT NULL;

-- Validação: Mostrar resultado
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NIVEIS CORRIGIDOS';
  RAISE NOTICE '========================================';
  
  FOR rec IN 
    SELECT 
      up.user_id,
      p.name,
      up.total_points,
      up.current_level
    FROM user_progress up
    LEFT JOIN profiles p ON p.id = up.user_id
    ORDER BY up.total_points DESC
    LIMIT 10
  LOOP
    RAISE NOTICE 'Usuario: % | Pontos: % | Nivel: %', 
      COALESCE(rec.name, rec.user_id::text), 
      rec.total_points, 
      rec.current_level;
  END LOOP;
  
  RAISE NOTICE '========================================';
END $$;

COMMIT;
