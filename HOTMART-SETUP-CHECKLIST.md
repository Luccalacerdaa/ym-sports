# ✅ Checklist de Configuração - Hotmart

## 📋 Passos para Ativar o Sistema de Pagamentos

### 1️⃣ Execute as Migrations no Supabase

```bash
# No dashboard do Supabase, vá em SQL Editor e execute:
supabase/migrations/20260210_create_subscriptions_system.sql
```

**Importante:** Antes de executar, edite o arquivo e substitua:
- `SEU_PRODUCT_ID_HOTMART_MENSAL` → ID real do produto mensal
- `OFFER_CODE_MENSAL` → Código da oferta mensal (se houver)
- Repita para Trimestral e Anual

### 2️⃣ Configure os Produtos na Hotmart

1. Acesse: **Hotmart → Meus Produtos → Criar Produto**

2. Crie 3 produtos (ou ofertas de um mesmo produto):

   **Plano Mensal:**
   - Nome: YM Sports - Mensal
   - Preço: R$ 29,90
   - Tipo: Assinatura Mensal (30 dias)
   - Copie o **Product ID**

   **Plano Trimestral:**
   - Nome: YM Sports - Trimestral
   - Preço: R$ 79,90  
   - Tipo: Assinatura ou Pagamento Único (90 dias)
   - Copie o **Product ID**

   **Plano Anual:**
   - Nome: YM Sports - Anual
   - Preço: R$ 299,90
   - Tipo: Assinatura ou Pagamento Único (365 dias)
   - Copie o **Product ID**

### 3️⃣ Configure Campos Personalizados na Hotmart

1. Vá em: **Produto → Configurações → Checkout**
2. Adicione campo personalizado:
   - **Nome:** `sck_user_id`
   - **Tipo:** Texto
   - **Obrigatório:** Não
   - **Visível:** Não

> Este campo será preenchido automaticamente pelo seu sistema e retornará no webhook.

### 4️⃣ Configure o Webhook

1. Vá em: **Produto → Configurações → Webhooks**
2. Adicione novo webhook:
   ```
   URL: https://ym-sports.vercel.app/api/hotmart-webhook
   ```
3. Selecione eventos:
   - ✅ `PURCHASE_COMPLETE`
   - ✅ `PURCHASE_APPROVED`
   - ✅ `SUBSCRIPTION_CANCELLATION`
   - ✅ `PURCHASE_CANCELED`
   - ✅ `PURCHASE_REFUNDED`
   - ✅ `REFUND_REQUESTED`

4. **Copie o HOTTOK** (token de segurança do webhook)

### 5️⃣ Configure Variáveis de Ambiente

#### No Vercel Dashboard:
```
Settings → Environment Variables → Add
```

Adicione:
```bash
HOTMART_WEBHOOK_TOKEN=seu_hottok_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
```

#### No .env.local (desenvolvimento):
```bash
HOTMART_WEBHOOK_TOKEN=seu_hottok_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

### 6️⃣ Atualize os IDs dos Produtos

Edite o arquivo:
```
supabase/migrations/20260210_create_subscriptions_system.sql
```

Substitua na seção `INSERT INTO subscription_plans`:

```sql
-- Linha do Plano Mensal
'SEU_PRODUCT_ID_HOTMART_MENSAL'    →  'coloque_o_id_real_aqui'
'OFFER_CODE_MENSAL'                →  'coloque_o_codigo_da_oferta' (ou NULL)

-- Linha do Plano Trimestral  
'SEU_PRODUCT_ID_HOTMART_TRIMESTRAL' →  'coloque_o_id_real_aqui'
'OFFER_CODE_TRIMESTRAL'            →  'coloque_o_codigo_da_oferta' (ou NULL)

-- Linha do Plano Anual
'SEU_PRODUCT_ID_HOTMART_ANUAL'     →  'coloque_o_id_real_aqui'
'OFFER_CODE_ANUAL'                 →  'coloque_o_codigo_da_oferta' (ou NULL)
```

Execute a migration novamente no Supabase.

### 7️⃣ Teste o Fluxo Completo

#### Teste 1: Compra Direta
1. Acesse a landing page: `https://ym-sports.vercel.app`
2. Clique em "Assinar Agora" no plano desejado
3. Cadastre-se (se não estiver logado)
4. Complete o pagamento no checkout da Hotmart
5. Verifique:
   - Webhook recebido (Vercel → Functions → hotmart-webhook → Logs)
   - Assinatura criada no banco (`user_subscriptions`)
   - Redirecionamento para `/payment/success`

#### Teste 2: Compra via Afiliado
1. Acesse: `https://ym-sports.vercel.app/?src=teste123`
2. Siga mesmo fluxo acima
3. Verifique:
   - No banco, coluna `affiliate_code = 'teste123'`
   - Webhook recebeu `affiliates.affiliate_code`

#### Teste 3: Webhook Manual
1. No Hotmart: **Webhooks → Testar Webhook**
2. Selecione evento: `PURCHASE_COMPLETE`
3. Verifique logs no Vercel

---

## 🔍 Como Encontrar os IDs dos Produtos

### Método 1: URL de Checkout
1. Crie um link de pagamento na Hotmart
2. A URL será algo como:
   ```
   https://pay.hotmart.com/A12345678?off=xyz123
   ```
3. O `A12345678` é o **Product ID**
4. O `xyz123` é o **Offer Code**

### Método 2: Dashboard da Hotmart
1. Vá em **Meus Produtos**
2. Clique no produto
3. Vá em **Links de Pagamento**
4. O ID aparece na URL

---

## 🎯 Sistema de Afiliados - Como Funciona

### Para o Afiliado:

1. Afiliado se cadastra no produto na Hotmart
2. Hotmart gera automaticamente:
   ```
   https://pay.hotmart.com/SEU_PRODUTO?src=CODIGO_DO_AFILIADO
   ```
3. Afiliado compartilha este link
4. Hotmart rastreia vendas automaticamente

### No Seu Sistema:

O afiliado pode usar também:
```
https://ym-sports.vercel.app/?src=CODIGO_DO_AFILIADO
```

Quando o cliente clicar:
1. Sistema salva `src` no `localStorage`
2. Cliente navega, se cadastra normalmente
3. Ao ir para checkout, o `src` é passado para Hotmart
4. Hotmart retorna no webhook: `affiliates.affiliate_code`
5. Sistema salva na coluna `affiliate_code`

### Comissões:

✅ Gerenciadas 100% pela Hotmart  
✅ Você só precisa configurar a % na Hotmart  
✅ Pagamento automático aos afiliados  

---

## 📊 Consultas Úteis no Supabase

### Ver todas as assinaturas ativas:
```sql
SELECT 
  u.email,
  us.status,
  p.name as plano,
  us.started_at,
  us.expires_at,
  us.affiliate_code
FROM user_subscriptions us
JOIN auth.users u ON u.id = us.user_id
JOIN subscription_plans p ON p.id = us.plan_id
WHERE us.status = 'active'
ORDER BY us.started_at DESC;
```

### Ver vendas por afiliado:
```sql
SELECT 
  affiliate_code,
  affiliate_name,
  COUNT(*) as total_vendas,
  SUM(amount_paid) as receita_total
FROM user_subscriptions
WHERE affiliate_code IS NOT NULL
GROUP BY affiliate_code, affiliate_name
ORDER BY receita_total DESC;
```

### Ver histórico de webhooks:
```sql
SELECT 
  event_type,
  transaction_id,
  processed,
  error_message,
  created_at
FROM hotmart_webhooks
ORDER BY created_at DESC
LIMIT 50;
```

---

## 🚨 Troubleshooting

### Problema: Webhook não está chegando
**Solução:**
1. Verifique URL: `https://ym-sports.vercel.app/api/hotmart-webhook` (sem `/` no final)
2. Teste manualmente na Hotmart
3. Verifique logs no Vercel: Functions → hotmart-webhook
4. Verifique se `HOTMART_WEBHOOK_TOKEN` está configurado

### Problema: Assinatura não ativa após pagamento
**Solução:**
1. Verifique se webhook foi recebido:
   ```sql
   SELECT * FROM hotmart_webhooks 
   WHERE transaction_id = 'HP12345678';
   ```
2. Verifique coluna `processed` e `error_message`
3. Verifique logs no Vercel
4. Verifique se `hotmart_product_id` no banco bate com o da Hotmart

### Problema: Afiliado não está sendo registrado
**Solução:**
1. Verifique se o link tem `?src=codigo`
2. Verifique localStorage: `localStorage.getItem('affiliate_code')`
3. Verifique payload do webhook: deve ter `affiliates.affiliate_code`
4. Verifique se coluna `affiliate_code` tem valor NULL

---

## ✅ Checklist Final

Antes de fazer deploy:

- [ ] Migrations executadas no Supabase
- [ ] Produtos criados na Hotmart com IDs corretos
- [ ] Campo `sck_user_id` configurado na Hotmart
- [ ] Webhook configurado com URL correta
- [ ] `HOTMART_WEBHOOK_TOKEN` configurado no Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado no Vercel
- [ ] IDs dos produtos atualizados na migration
- [ ] Teste de compra realizado com sucesso
- [ ] Webhook processando corretamente
- [ ] Assinatura ativando no banco
- [ ] Página `/payment/success` funcionando

---

## 📞 Suporte

Se algo não funcionar:

1. **Logs do Vercel:** Vercel Dashboard → Functions → hotmart-webhook → Logs
2. **Logs do Supabase:** SQL Editor → Query para ver `hotmart_webhooks`
3. **Teste Webhook:** Hotmart → Webhooks → Testar Webhook

Todos os eventos são logados na tabela `hotmart_webhooks` para auditoria.
