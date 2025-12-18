-- ===================================================================
-- FUNÇÃO RPC PARA BUSCAR EVENTOS PRÓXIMOS (VERSÃO 3 - FINAL)
-- ===================================================================
-- Retorna um array JSON simples de eventos, sem wrapper
-- ===================================================================

-- Deletar versões anteriores
DROP FUNCTION IF EXISTS get_upcoming_events(INTEGER);

-- Criar função que retorna JSONB (melhor que JSON)
CREATE OR REPLACE FUNCTION get_upcoming_events(minutes_ahead INTEGER DEFAULT 30)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE sql
AS $$
  -- Usar CTE para ordenar antes de agregar
  WITH ordered_events AS (
    SELECT 
      id,
      user_id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      opponent
    FROM events
    WHERE 
      start_date >= NOW() 
      AND start_date <= (NOW() + (minutes_ahead || ' minutes')::INTERVAL)
    ORDER BY start_date ASC
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', e.id,
        'user_id', e.user_id,
        'title', e.title,
        'description', COALESCE(e.description, ''),
        'event_type', e.event_type,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'location', COALESCE(e.location, ''),
        'opponent', COALESCE(e.opponent, '')
      )
    ),
    '[]'::jsonb
  )
  FROM ordered_events e;
$$;

-- Dar permissões
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO postgres;

-- Comentário
COMMENT ON FUNCTION get_upcoming_events(INTEGER) IS 'Busca eventos próximos - retorna array JSON direto';

-- Teste (deve retornar array limpo: [{...}] ou [])
SELECT get_upcoming_events(30);

