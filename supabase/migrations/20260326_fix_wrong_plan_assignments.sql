-- ============================================================
-- Correção: planos errados atribuídos como 'mensal'
-- Causa: offer_code não extraído corretamente do payload Hotmart
--
-- NOTA: hw.user_id é do tipo UUID — joins diretos sem cast
-- ============================================================

-- ── 1. Ver todos os webhooks recentes com o valor pago ──────
SELECT 
  hw.id,
  hw.event_type,
  hw.transaction_id,
  hw.user_id,
  hw.created_at,
  (hw.payload->'data'->'purchase'->'price'->>'value')::numeric AS valor_pago,
  hw.payload->'data'->'purchase'->'offer'->>'code'             AS offer_code,
  hw.payload->'data'->'subscription'->'plan'->>'name'          AS plan_name,
  p.subscription_plan       AS plano_atual,
  p.subscription_expires_at AS expiracao_atual
FROM hotmart_webhooks hw
LEFT JOIN profiles p ON p.id = hw.user_id
WHERE hw.event_type IN ('PURCHASE_APPROVED', 'PURCHASE_COMPLETE')
  AND hw.user_id IS NOT NULL
ORDER BY hw.created_at DESC
LIMIT 50;


-- ── 2. Corrigir usuário específico: a3c14655 (pagou semestral, ficou como mensal) ──
UPDATE profiles SET
  subscription_plan        = 'semestral',
  subscription_expires_at  = (
    SELECT COALESCE(
      MIN(created_at) + INTERVAL '180 days',
      NOW()           + INTERVAL '180 days'
    )
    FROM hotmart_webhooks
    WHERE user_id = 'a3c14655-ec89-40e7-bd8a-cf9f6e52c2a1'
      AND event_type IN ('PURCHASE_APPROVED', 'PURCHASE_COMPLETE')
  )
WHERE id = 'a3c14655-ec89-40e7-bd8a-cf9f6e52c2a1';


-- ── 3. Listar todos com plano possivelmente errado (baseado no valor pago) ──
WITH purchases_with_value AS (
  SELECT DISTINCT ON (hw.user_id)
    hw.user_id,
    (hw.payload->'data'->'purchase'->'price'->>'value')::numeric AS valor_pago,
    hw.created_at AS purchase_date,
    p.subscription_plan       AS plano_atual,
    p.subscription_expires_at AS expiracao_atual
  FROM hotmart_webhooks hw
  JOIN profiles p ON p.id = hw.user_id
  WHERE hw.event_type IN ('PURCHASE_APPROVED', 'PURCHASE_COMPLETE')
    AND p.subscription_status = 'active'
    AND hw.user_id IS NOT NULL
  ORDER BY hw.user_id, hw.created_at DESC
)
SELECT 
  user_id,
  plano_atual,
  valor_pago,
  CASE 
    WHEN valor_pago >= 150 THEN 'semestral (180 dias)'
    WHEN valor_pago >= 70  THEN 'trimestral (90 dias)'
    ELSE 'mensal (30 dias)'
  END AS plano_correto,
  purchase_date,
  expiracao_atual,
  CASE 
    WHEN valor_pago >= 150 THEN purchase_date + INTERVAL '180 days'
    WHEN valor_pago >= 70  THEN purchase_date + INTERVAL '90 days'
    ELSE purchase_date + INTERVAL '30 days'
  END AS expiracao_correta
FROM purchases_with_value
WHERE 
  (valor_pago >= 150 AND plano_atual != 'semestral')
  OR (valor_pago >= 70 AND valor_pago < 150 AND plano_atual != 'trimestral')
ORDER BY valor_pago DESC;


-- ── 4. APLICAR correção em lote (rode após conferir o SELECT acima) ──
-- Descomente para aplicar:

/*
WITH purchases_with_value AS (
  SELECT DISTINCT ON (hw.user_id)
    hw.user_id,
    (hw.payload->'data'->'purchase'->'price'->>'value')::numeric AS valor_pago,
    hw.created_at AS purchase_date
  FROM hotmart_webhooks hw
  JOIN profiles p ON p.id = hw.user_id
  WHERE hw.event_type IN ('PURCHASE_APPROVED', 'PURCHASE_COMPLETE')
    AND p.subscription_status = 'active'
    AND hw.user_id IS NOT NULL
  ORDER BY hw.user_id, hw.created_at DESC
)
UPDATE profiles p
SET
  subscription_plan       = CASE
    WHEN pwv.valor_pago >= 150 THEN 'semestral'
    WHEN pwv.valor_pago >= 70  THEN 'trimestral'
    ELSE 'mensal'
  END,
  subscription_expires_at = CASE
    WHEN pwv.valor_pago >= 150 THEN pwv.purchase_date + INTERVAL '180 days'
    WHEN pwv.valor_pago >= 70  THEN pwv.purchase_date + INTERVAL '90 days'
    ELSE pwv.purchase_date + INTERVAL '30 days'
  END
FROM purchases_with_value pwv
WHERE p.id = pwv.user_id
  AND p.subscription_status = 'active'
  AND (
    (pwv.valor_pago >= 150 AND p.subscription_plan != 'semestral')
    OR (pwv.valor_pago >= 70 AND pwv.valor_pago < 150 AND p.subscription_plan != 'trimestral')
  );
*/


-- ── 5. Confirmar resultado ───────────────────────────────────
SELECT 
  id,
  name,
  email,
  subscription_status,
  subscription_plan,
  subscription_expires_at,
  EXTRACT(DAY FROM subscription_expires_at - NOW())::int AS dias_restantes
FROM profiles
WHERE subscription_status = 'active'
ORDER BY subscription_expires_at;
