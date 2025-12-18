# 🚨 EXECUTAR MIGRAÇÃO NO SUPABASE (URGENTE)

## ❌ Erro Atual:

```
Could not find the 'auth' column of 'push_subscriptions' in the schema cache
```

**Causa:** A tabela `push_subscriptions` não existe ou está com estrutura errada no Supabase.

---

## ✅ SOLUÇÃO (2 minutos):

### **Passo 1: Acessar Supabase SQL Editor**

1. Acesse: https://supabase.com/dashboard/project/qfnjgksvpjbuhzwuitzg/sql/new
   - (Já abre direto no SQL Editor)

2. Ou navegue manualmente:
   - https://supabase.com/dashboard
   - Seu projeto: YM Sports
   - Menu lateral: **SQL Editor**
   - Botão: **New query**

---

### **Passo 2: Cole este SQL**

**Copie e cole EXATAMENTE este código:**

```sql
-- Deletar tabela antiga se existir (para recriar corretamente)
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- Criar tabela com estrutura correta
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Index para buscar por usuário (performance)
CREATE INDEX idx_push_subs_user ON push_subscriptions(user_id);

-- Habilitar Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: usuários gerenciam suas próprias inscrições
CREATE POLICY "Users manage own subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- Comentário para documentação
COMMENT ON TABLE push_subscriptions IS 'Armazena subscriptions de push notifications dos usuários';
```

---

### **Passo 3: Executar**

1. Com o SQL colado, clique no botão **"Run"** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)
2. Aguarde aparecer: **"Success. No rows returned"**
3. ✅ Pronto!

---

## 🧪 Testar Após Migração:

### **Teste 1: Verificar se tabela foi criada**

No SQL Editor, execute:

```sql
SELECT * FROM push_subscriptions LIMIT 5;
```

**✅ Resultado esperado:**
```
No rows found
```
(Normal, pois a tabela está vazia)

**❌ Se der erro:**
- A migração não foi executada
- Execute novamente o Passo 2

---

### **Teste 2: Reativar Push no App**

1. **Recarregue o app**: `Ctrl+Shift+R`
2. **Limpe cache**: `Ctrl+Shift+Del` → Limpar
3. **Faça login** novamente
4. **Vá em**: `/dashboard/settings`
5. **Clique**: "🔄 Reativar Push"

**✅ Deve aparecer:**
```
✅ Push reativado com sucesso!
```

**Se ainda der erro**, continue para o próximo teste.

---

### **Teste 3: Verificar se subscription foi salva**

No Supabase SQL Editor:

```sql
SELECT 
  id,
  user_id,
  LEFT(endpoint, 50) as endpoint_preview,
  LEFT(p256dh, 20) as p256dh_preview,
  LEFT(auth, 20) as auth_preview,
  created_at
FROM push_subscriptions;
```

**✅ Deve mostrar:**
- 1 linha com seus dados
- `endpoint` começando com `https://fcm.googleapis.com/...`
- `p256dh` e `auth` com valores

**❌ Se tabela vazia:**
- Subscription não foi salva
- Verifique logs do Vercel (próximo passo)

---

### **Teste 4: Teste Rápido no App**

1. Na página de Configurações
2. **Clique**: "Teste Rápido"

**✅ Deve aparecer:**
```
✅ Teste enviado! (1 dispositivo(s))
```

**E a notificação deve aparecer no sistema!** 🎉

---

## 📊 Estrutura da Tabela:

```
push_subscriptions
├── id (UUID) - Primary Key
├── user_id (UUID) - FK para auth.users
├── endpoint (TEXT) - URL do Firebase Cloud Messaging
├── p256dh (TEXT) - Chave pública de criptografia
├── auth (TEXT) - Token de autenticação
├── created_at (TIMESTAMPTZ) - Data de criação
└── updated_at (TIMESTAMPTZ) - Última atualização
```

---

## ⚠️ IMPORTANTE:

### **Por que DROP TABLE?**

O `DROP TABLE IF EXISTS` remove qualquer tabela antiga que possa estar com estrutura errada.

**Não se preocupe:**
- ✅ Se a tabela não existe, apenas cria uma nova
- ✅ Se existe mas está errada, recria corretamente
- ✅ Não afeta outras tabelas do seu app
- ✅ O `CASCADE` remove dependências automáticas

---

## 🔍 Verificar Logs do Vercel:

Se após a migração ainda der erro:

1. Vá em: https://vercel.com/luccalacerdaa/ym-sports
2. **Deployments** → Último deploy
3. **Functions** → `api/subscribe.js`
4. **Logs**

**Procure por:**
- ✅ `📝 Salvando subscription para user: ...`
- ✅ `✅ Nova subscription criada`
- ❌ `❌ Erro: ...`

---

## 📝 Checklist:

- [ ] Acessei Supabase SQL Editor
- [ ] Colei o SQL completo
- [ ] Cliquei em "Run"
- [ ] Vi "Success. No rows returned"
- [ ] Recarreguei o app (Ctrl+Shift+R)
- [ ] Limpei cache
- [ ] Fiz login novamente
- [ ] Cliquei em "Reativar Push"
- [ ] Vi "✅ Push reativado com sucesso!"
- [ ] Cliquei em "Teste Rápido"
- [ ] Recebi a notificação!

---

## 🎯 Por Que Isso Aconteceu?

As migrações do Supabase precisam ser executadas **manualmente** no SQL Editor.

O arquivo `supabase/migrations/push_subscriptions_simples.sql` no repositório é apenas um **template**.

**Para aplicar:**
1. ✅ Copiar o SQL do arquivo
2. ✅ Colar no Supabase SQL Editor
3. ✅ Executar (Run)

---

## 🆘 Ainda com Erro?

Se após executar a migração ainda houver erro:

### **1. Verificar se tabela existe:**

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'push_subscriptions'
ORDER BY ordinal_position;
```

**Deve mostrar:**
```
push_subscriptions | id         | uuid
push_subscriptions | user_id    | uuid
push_subscriptions | endpoint   | text
push_subscriptions | p256dh     | text
push_subscriptions | auth       | text
push_subscriptions | created_at | timestamp with time zone
push_subscriptions | updated_at | timestamp with time zone
```

### **2. Se faltar alguma coluna:**

```sql
-- Adicionar coluna que estiver faltando
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS auth TEXT NOT NULL DEFAULT '';

ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS p256dh TEXT NOT NULL DEFAULT '';

ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

---

## ⏱️ Tempo Total:

- 1 min: Executar migração
- 30s: Recarregar app
- 30s: Reativar push
- **Total: 2 minutos** ✅

---

**Execute a migração AGORA e em 2 minutos estará funcionando!** 🚀

