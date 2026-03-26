-- =============================================================================
-- CORREÇÃO: Assinaturas com plano errado (mensal em vez de trimestral/semestral)
--
-- Causa: o webhook não conseguia ler o offer.code e caía no fallback
-- por product_id que sempre retornava 'mensal' (mesmo produto para todas as ofertas).
--
-- Execute este script no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qfnjgksvpjbuhzwuitzg/sql
-- =============================================================================

-- ── 1. Ver situação atual (diagnóstico) ──────────────────────────────────────
SELECT
  p.id,
  p.email,
  p.subscription_plan,
  p.subscription_status,
  p.subscription_expires_at,
  us.amount_paid,
  us.hotmart_transaction_id,
  us.started_at
FROM profiles p
LEFT JOIN user_subscriptions us ON us.user_id = p.id
WHERE p.subscription_status = 'active'
ORDER BY us.started_at DESC;


-- ── 2. Corrigir usuário específico: a3c14655-ec89-40e7-bd8a-cf9f6e52c2a1 ────
-- Semestral = 180 dias a partir da data de inicio da assinatura
UPDATE profiles
SET
  subscription_plan       = 'semestral',
  subscription_expires_at = (
    SELECT (started_at + INTERVAL '180 days')
    FROM user_subscriptions
    WHERE user_id = 'a3c14655-ec89-40e7-bd8a-cf9f6e52c2a1'
    ORDER BY started_at DESC
    LIMIT 1
  )
WHERE id = 'a3c14655-ec89-40e7-bd8a-cf9f6e52c2a1';

-- Verificar resultado
SELECT id, subscription_plan, subscription_expires_at
FROM profiles
WHERE id = 'a3c14655-ec89-40e7-bd8a-cf9f6e52c2a1';


-- ── 3. Corrigir TODOS os usuários com plano errado baseado no valor pago ─────
-- Isso corrige quem pagou trimestral ou semestral mas ficou como mensal

-- 3a. Corrigir assinaturas TRIMESTRAIS (pagou entre R$80 e R$169)
UPDATE profiles p
SET
  subscription_plan       = 'trimestral',
  subscription_expires_at = (
    SELECT (us2.started_at + INTERVAL '90 days')
    FROM user_subscriptions us2
    WHERE us2.user_id = p.id
    ORDER BY us2.started_at DESC
    LIMIT 1
  )
FROM user_subscriptions us
WHERE us.user_id = p.id
  AND p.subscription_plan = 'mensal'        -- só corrigir quem está como mensal
  AND us.amount_paid >= 80
  AND us.amount_paid < 170
  AND us.status = 'active';

-- 3b. Corrigir assinaturas SEMESTRAIS (pagou R$170 ou mais)
UPDATE profiles p
SET
  subscription_plan       = 'semestral',
  subscription_expires_at = (
    SELECT (us2.started_at + INTERVAL '180 days')
    FROM user_subscriptions us2
    WHERE us2.user_id = p.id
    ORDER BY us2.started_at DESC
    LIMIT 1
  )
FROM user_subscriptions us
WHERE us.user_id = p.id
  AND p.subscription_plan = 'mensal'        -- só corrigir quem está como mensal
  AND us.amount_paid >= 170
  AND us.status = 'active';


-- ── 4. Corrigir user_subscriptions também (para o histórico ficar certo) ─────
-- Sincronizar plan_id na tabela user_subscriptions

UPDATE user_subscriptions us
SET plan_id = sp.id
FROM subscription_plans sp
WHERE us.amount_paid >= 170
  AND sp.name = 'Semestral'
  AND us.plan_id IS DISTINCT FROM sp.id;

UPDATE user_subscriptions us
SET plan_id = sp.id
FROM subscription_plans sp
WHERE us.amount_paid >= 80
  AND us.amount_paid < 170
  AND sp.name = 'Trimestral'
  AND us.plan_id IS DISTINCT FROM sp.id;


-- ── 5. Confirmar resultado final ─────────────────────────────────────────────
SELECT
  p.id,
  p.email,
  p.subscription_plan,
  p.subscription_expires_at,
  CEIL(EXTRACT(EPOCH FROM (p.subscription_expires_at - NOW())) / 86400) AS dias_restantes,
  us.amount_paid
FROM profiles p
LEFT JOIN user_subscriptions us ON us.user_id = p.id
WHERE p.subscription_status = 'active'
ORDER BY us.started_at DESC;
