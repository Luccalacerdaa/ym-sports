-- Adicionar campos de assinatura na tabela profiles
-- Permite verificação rápida de acesso sem depender da tabela user_subscriptions

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
-- Valores possíveis: 'none', 'active', 'cancelled', 'expired', 'refunded'

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
-- Valores possíveis: 'mensal', 'trimestral', 'semestral'

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
-- Data de expiração da assinatura ativa

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hotmart_subscriber_code TEXT;
-- Código do assinante na Hotmart (ex: YE8RL7TB)

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Atualizar offer code do plano Mensal (confirmado via webhook)
UPDATE subscription_plans SET hotmart_offer_code = 'olbidtw7' WHERE name = 'Mensal';

-- Verificar resultado
SELECT id, name, subscription_status, subscription_plan, subscription_expires_at
FROM profiles
LIMIT 5;

SELECT name, hotmart_product_id, hotmart_checkout_code, hotmart_offer_code
FROM subscription_plans
ORDER BY price_brl;
