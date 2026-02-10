-- Tabela para rastrear notificações de eventos enviadas
-- Evita duplicatas e permite controle fino de quando notificar

CREATE TABLE IF NOT EXISTS event_notifications_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- '30min' ou 'now'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Índices para performance
  CONSTRAINT unique_event_notification UNIQUE (event_id, notification_type)
);

-- Índice para buscar notificações de um evento
CREATE INDEX IF NOT EXISTS idx_event_notifications_event_id 
  ON event_notifications_sent(event_id);

-- Índice para buscar por usuário
CREATE INDEX IF NOT EXISTS idx_event_notifications_user_id 
  ON event_notifications_sent(user_id);

-- Índice para limpar notificações antigas
CREATE INDEX IF NOT EXISTS idx_event_notifications_sent_at 
  ON event_notifications_sent(sent_at);

-- RLS (Row Level Security)
ALTER TABLE event_notifications_sent ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver suas próprias notificações
CREATE POLICY "Users can view own notification history"
  ON event_notifications_sent
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: apenas o sistema pode inserir (service role)
CREATE POLICY "Service can insert notifications"
  ON event_notifications_sent
  FOR INSERT
  WITH CHECK (true);

-- Função para limpar notificações antigas (eventos passados há mais de 7 dias)
CREATE OR REPLACE FUNCTION cleanup_old_event_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM event_notifications_sent
  WHERE sent_at < NOW() - INTERVAL '7 days';
END;
$$;

COMMENT ON TABLE event_notifications_sent IS 'Rastreia notificações de eventos enviadas para evitar duplicatas';
COMMENT ON COLUMN event_notifications_sent.notification_type IS 'Tipo: 30min (30 minutos antes) ou now (na hora do evento)';
