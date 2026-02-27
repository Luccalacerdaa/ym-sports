-- Ativar manualmente usuários que já pagaram mas não tiveram o profile atualizado
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- Verificar usuário pelo email da compra:
-- email do payload: lacerdalucca1dd@gmail.com
-- sck (user_id): d60d90b6-3ae8-4902-97c3-b2c344279141

-- Passo 1: Ver o perfil do usuário
SELECT id, name, email, subscription_status, subscription_plan, subscription_expires_at
FROM profiles
WHERE id = 'd60d90b6-3ae8-4902-97c3-b2c344279141'
   OR email = 'lacerdalucca1dd@gmail.com';

-- Passo 2: Ativar o plano manualmente (Mensal = 30 dias)
UPDATE profiles
SET
  subscription_status = 'active',
  subscription_plan = 'mensal',
  subscription_expires_at = NOW() + INTERVAL '30 days'
WHERE id = 'd60d90b6-3ae8-4902-97c3-b2c344279141'
   OR email = 'lacerdalucca1dd@gmail.com';

-- Passo 3: Confirmar atualização
SELECT id, name, email, subscription_status, subscription_plan, subscription_expires_at
FROM profiles
WHERE id = 'd60d90b6-3ae8-4902-97c3-b2c344279141'
   OR email = 'lacerdalucca1dd@gmail.com';
