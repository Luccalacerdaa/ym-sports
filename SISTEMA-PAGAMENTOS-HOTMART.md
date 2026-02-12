# 💳 Sistema de Pagamentos - Hotmart Integration

## 📋 Visão Geral

Sistema completo de assinaturas integrado com Hotmart, incluindo:
- ✅ 3 planos de assinatura (Mensal, Trimestral, Anual)
- ✅ Checkout seguro via Hotmart
- ✅ Webhook automático para ativar assinaturas
- ✅ Sistema de afiliados integrado
- ✅ Rastreamento de vendas por afiliado

---

## 🔄 Fluxo Completo de Compra

### 1. Cliente na Landing Page
```
Cliente → Vê planos → Clica "Assinar Agora"
```

### 2. Sistema Verifica Autenticação
```javascript
if (!user) {
  // Salva plano selecionado
  localStorage.setItem('selected_plan_id', plan.id);
  // Redireciona para /signup
  navigate('/signup');
}
```

### 3. Após Cadastro
```javascript
// Recupera plano selecionado
const planId = localStorage.getItem('selected_plan_id');
// Redireciona para checkout Hotmart com parâmetros
```

### 4. Checkout Hotmart
```
URL gerada:
https://pay.hotmart.com/SEU_PRODUTO?
  off=OFFER_CODE                    // Oferta específica
  &sck_user_id=UUID_DO_USUARIO      // SEU user_id (importante!)
  &src=CODIGO_AFILIADO              // Código do afiliado (se houver)
  &email=user@email.com             // Email pré-preenchido
  &name=Nome do Usuario             // Nome pré-preenchido
```

### 5. Pagamento Aprovado
```
Hotmart → Webhook → /api/hotmart-webhook
                 → Ativa assinatura no banco
                 → Registra afiliado (se houver)
```

### 6. Cliente Retorna ao App
```
App verifica assinatura → Status: ATIVO ✅
```

---

## 👥 Como Funciona o Sistema de Afiliados

### Passo a Passo:

#### 1. **Afiliado se cadastra na Hotmart**
- Acessa a página do produto YM Sports na Hotmart
- Clica em "Divulgar este produto"
- Recebe link único: `https://pay.hotmart.com/SEU_PRODUTO?src=CODIGO_AFILIADO`

#### 2. **Afiliado compartilha link**
```
Opções de link:
- Link direto: https://pay.hotmart.com/PRODUTO?src=abc123
- Link com seu domínio: https://ymsports.com.br/?ref=abc123
  (redireciona para Hotmart com src=abc123)
```

#### 3. **Cliente clica no link do afiliado**
```
Cliente acessa → Hotmart salva cookie → Cliente navega pelo site
                                      → Cliente se cadastra
                                      → Cliente vai para checkout
                                      → Cookie do afiliado persiste
```

#### 4. **No checkout, Hotmart envia:**
```
URL final:
https://pay.hotmart.com/PRODUTO?
  src=abc123              ← Código do afiliado (Hotmart controla)
  &sck_user_id=user-uuid  ← Seu user_id (você controla)
```

#### 5. **Cliente finaliza pagamento**
Hotmart processa → Webhook enviado com:
```json
{
  "event": "PURCHASE_COMPLETE",
  "data": {
    "buyer": {
      "email": "cliente@email.com"
    },
    "product": {
      "id": "12345"
    },
    "purchase": {
      "transaction": "HP12345678",
      "price": {
        "value": 29.90
      }
    },
    "affiliates": {
      "affiliate_code": "abc123",
      "name": "Nome do Afiliado",
      "commission_percentage": 30
    },
    "custom_fields": {
      "sck_user_id": "user-uuid"  ← SEU user_id!
    }
  }
}
```

#### 6. **Seu sistema processa:**
```javascript
// api/hotmart-webhook.js
const userId = data.custom_fields.sck_user_id;
const affiliateCode = data.affiliates.affiliate_code;

// Salva no banco:
await supabase.from('user_subscriptions').insert({
  user_id: userId,
  status: 'active',
  affiliate_code: affiliateCode,    // ✅ Registra afiliado
  affiliate_name: "Nome Afiliado"
});
```

#### 7. **Relatórios de Vendas**
```sql
-- Ver todas as vendas por afiliado
SELECT 
  affiliate_code,
  affiliate_name,
  COUNT(*) as total_vendas,
  SUM(amount_paid) as total_faturado
FROM user_subscriptions
WHERE affiliate_code IS NOT NULL
GROUP BY affiliate_code, affiliate_name
ORDER BY total_faturado DESC;
```

---

## 🔧 Configuração Necessária

### 1. **No Supabase**

Execute as migrations:
```bash
# Migration 1: Sistema de assinaturas
supabase/migrations/20260210_create_subscriptions_system.sql

# Migration 2: Cache de notificações
supabase/migrations/20260210_event_notifications_cache.sql

# Migration 3: Storage policies (manual no dashboard)
STORAGE_POLICIES_FIX.sql
```

### 2. **Na Hotmart**

#### A) Configure os produtos:
1. Acesse Hotmart → Meus Produtos
2. Crie 3 ofertas:
   - **Mensal** (R$ 29,90)
   - **Trimestral** (R$ 79,90)  
   - **Anual** (R$ 299,90)

#### B) Configure campos personalizados:
1. Vá em Configurações → Campos Personalizados
2. Adicione campo: `sck_user_id`
   - Tipo: Texto
   - Obrigatório: Não (será preenchido automaticamente)

#### C) Configure o webhook:
1. Vá em Configurações → Webhooks
2. URL: `https://ym-sports.vercel.app/api/hotmart-webhook`
3. Eventos selecionados:
   - ✅ PURCHASE_COMPLETE
   - ✅ SUBSCRIPTION_CANCELLATION
   - ✅ PURCHASE_REFUNDED
4. Salve o **Hottok** (token de segurança)

### 3. **No Vercel (Variáveis de Ambiente)**

Adicione em `.env.local` e no Vercel Dashboard:
```bash
# Hotmart
HOTMART_WEBHOOK_TOKEN=seu_hottok_aqui  # Token do webhook da Hotmart

# Já existentes
VITE_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 4. **Atualizar os IDs dos produtos**

Edite o arquivo SQL:
`supabase/migrations/20260210_create_subscriptions_system.sql`

Substitua:
```sql
'SEU_PRODUCT_ID_HOTMART_MENSAL'    → 'ID_REAL_DA_HOTMART'
'OFFER_CODE_MENSAL'                → 'CODIGO_OFERTA_REAL'
```

---

## 🎯 Como Afiliados Vendem

### Opção 1: Link Direto da Hotmart (Mais Simples)
```
https://pay.hotmart.com/SEU_PRODUTO?src=CODIGO_AFILIADO
```
✅ Afiliado compartilha direto  
✅ Hotmart rastreia automaticamente  
✅ Comissão calculada pela Hotmart

### Opção 2: Link Bonito pelo Seu Domínio
```
https://ymsports.com.br/?ref=CODIGO_AFILIADO
```

Você cria uma página de redirect:
```javascript
// Detectar ref na URL
const ref = urlParams.get('ref');
if (ref) {
  // Salvar no localStorage
  localStorage.setItem('affiliate_code', ref);
  
  // Usuário navega normal pelo site
  // Quando clicar em "Assinar", o código é enviado
}
```

### Como o Sistema Identifica o Afiliado:

1. **Cliente clica no link:** `?src=afiliado123`
2. **Código fica salvo** no localStorage
3. **Cliente se cadastra** (código persiste)
4. **Cliente vai para checkout:**
   ```
   https://pay.hotmart.com/PRODUTO?
     src=afiliado123         ← Código do afiliado
     &sck_user_id=user-uuid  ← ID do cliente no seu sistema
   ```
5. **Hotmart processa:**
   - Registra venda para o afiliado
   - Calcula comissão automaticamente
6. **Webhook chega com:**
   ```json
   {
     "affiliates": {
       "affiliate_code": "afiliado123",
       "name": "João Silva",
       "commission_percentage": 30
     }
   }
   ```
7. **Seu sistema salva:**
   ```sql
   INSERT INTO user_subscriptions (
     user_id,
     affiliate_code,
     affiliate_name
   ) VALUES (
     'user-uuid',
     'afiliado123',  ✅ REGISTRADO!
     'João Silva'
   );
   ```

---

## 📊 Relatórios de Afiliados

### Query para ver vendas por afiliado:
```sql
SELECT 
  affiliate_code,
  affiliate_name,
  COUNT(*) as total_vendas,
  SUM(amount_paid) as receita_gerada,
  AVG(affiliate_commission_percentage) as comissao_media
FROM user_subscriptions
WHERE affiliate_code IS NOT NULL
  AND status IN ('active', 'cancelled', 'expired')
GROUP BY affiliate_code, affiliate_name
ORDER BY receita_gerada DESC;
```

### Query para ver vendas diretas vs afiliados:
```sql
SELECT 
  CASE 
    WHEN affiliate_code IS NULL THEN 'Venda Direta'
    ELSE 'Afiliado'
  END as origem,
  COUNT(*) as total,
  SUM(amount_paid) as receita
FROM user_subscriptions
WHERE status IN ('active', 'cancelled', 'expired')
GROUP BY origem;
```

---

## 🚀 Próximos Passos

1. ✅ Execute as migrations no Supabase
2. ✅ Configure os produtos na Hotmart
3. ✅ Configure o webhook na Hotmart
4. ✅ Adicione `HOTMART_WEBHOOK_TOKEN` no Vercel
5. ✅ Atualize os IDs dos produtos na migration
6. ✅ Teste o fluxo completo

---

## 🧪 Testando

### Teste 1: Compra Direta
```
1. Acesse a landing page (sem parâmetros)
2. Clique "Assinar Agora"
3. Cadastre-se
4. Complete pagamento na Hotmart
5. Verifique no banco: affiliate_code = NULL
```

### Teste 2: Compra via Afiliado
```
1. Acesse: https://ymsports.com.br/?src=teste123
2. Clique "Assinar Agora"
3. Cadastre-se (código persiste)
4. Complete pagamento
5. Verifique no banco: affiliate_code = 'teste123' ✅
```

### Teste 3: Webhook
```
1. Na Hotmart, vá em Webhooks → Testar
2. Escolha evento: PURCHASE_COMPLETE
3. Veja logs em: Vercel → Functions → hotmart-webhook
```

---

## ❓ FAQ

**P: O afiliado precisa fazer algo especial?**  
R: Não! A Hotmart gera o link automaticamente quando ele se torna afiliado.

**P: E se o cliente limpar cookies/localStorage?**  
R: A Hotmart mantém o tracking do afiliado mesmo assim. O cookie da Hotmart persiste.

**P: Posso criar meus próprios links de afiliado?**  
R: Sim! Você pode criar links bonitos (`ymsports.com.br/parceiro123`) que redirecionam para a Hotmart com `?src=parceiro123`.

**P: Como sei qual afiliado vendeu?**  
R: No webhook da Hotmart vem o `affiliates.affiliate_code`. Seu sistema salva automaticamente.

**P: A comissão é paga por quem?**  
R: Pela Hotmart! Você não precisa fazer nada. A Hotmart desconta a comissão e repassa automaticamente para o afiliado.

---

## 🔒 Segurança

### Token do Webhook (HOTTOK)
```javascript
// Validação no webhook:
const hotmartToken = req.headers['x-hotmart-hottok'];
const expectedToken = process.env.HOTMART_WEBHOOK_TOKEN;

if (hotmartToken !== expectedToken) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### Evitar Fraudes
- ✅ Validar HOTTOK em todo webhook
- ✅ Verificar transaction_id único
- ✅ Logar todos os webhooks (tabela `hotmart_webhooks`)
- ✅ Validar valores pagos vs plano

---

## 📱 Próxima Implementação

Vou criar agora:
1. ✅ Componente PricingSection para landing page
2. ⏳ Atualizar Index.tsx para incluir os planos
3. ⏳ Criar página de "Obrigado pelo pagamento"
4. ⏳ Criar dashboard de assinatura (ver status, cancelar)
5. ⏳ Adicionar verificação de acesso (middleware)

Quer que eu continue implementando?
