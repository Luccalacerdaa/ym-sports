-- Função para buscar eventos próximos (bypass RLS para notificações)
-- Esta função roda com permissões de segurança elevadas (SECURITY DEFINER)
-- para permitir que o GitHub Actions busque todos os eventos próximos

CREATE OR REPLACE FUNCTION get_upcoming_events(
  minutes_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  event_type TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  opponent TEXT
)
SECURITY DEFINER -- Roda com permissões do owner, bypass RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.user_id,
    e.title,
    e.description,
    e.event_type,
    e.start_date,
    e.end_date,
    e.location,
    e.opponent
  FROM events e
  WHERE 
    e.start_date >= NOW() 
    AND e.start_date <= (NOW() + (minutes_ahead || ' minutes')::INTERVAL)
  ORDER BY e.start_date ASC;
END;
$$;

-- Permitir que qualquer um chame esta função (necessário para GitHub Actions)
GRANT EXECUTE ON FUNCTION get_upcoming_events TO anon, authenticated;

-- Comentário para documentação
COMMENT ON FUNCTION get_upcoming_events IS 'Busca eventos próximos para sistema de notificações (bypass RLS)';

