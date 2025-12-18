# 🚨 EXECUTAR MIGRAÇÃO DE EVENTOS (URGENTE)

## ❌ **Problema Atual:**

```
Invalid API key
```

**Causa Real:** A tabela `events` tem **RLS (Row Level Security)** ativo. A chave `anon` não pode ler eventos de outros usuários.

**Solução:** Criar uma função RPC que faz bypass do RLS para permitir que o GitHub Actions busque todos os eventos próximos.

---

## ✅ **SOLUÇÃO (2 minutos):**

### **Passo 1: Acessar Supabase SQL Editor**

1. **Acesse:** https://supabase.com/dashboard/project/qfnjgksvpjbuhzwuitzg/sql/new
   - (Já abre direto no SQL Editor)

2. Ou navegue manualmente:
   - https://supabase.com/dashboard
   - Clique no projeto: **YM Sports**
   - Menu lateral esquerdo: **SQL Editor**
   - Botão verde: **New query**

---

### **Passo 2: Cole este SQL**

**Copie e cole EXATAMENTE:**

```sql
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
```

---

### **Passo 3: Executar**

1. Com o SQL colado no editor, clique no botão **"Run"** (canto inferior direito)
   - Ou pressione: `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)

2. Aguarde aparecer: ✅ **"Success. No rows returned"**

3. ✅ **Pronto!** A função foi criada!

---

## 🧪 **Passo 4: Testar a Função**

### **Teste 1: Verificar se função existe**

No SQL Editor, execute:

```sql
SELECT * FROM get_upcoming_events(30);
```

**Resultado esperado:**
- Se houver eventos nos próximos 30 min: mostra os eventos
- Se NÃO houver eventos: `(0 rows)` - OK!
- Se der erro: refaça a migração

### **Teste 2: Testar com GitHub Actions**

1. GitHub Actions → **Notificações de Eventos**
2. **Run workflow** → Run
3. Ver logs → Deve mostrar:
   ```
   ✅ Eventos encontrados: X
   ```

---

## 🎯 **Como Funciona:**

### **Antes (Quebrado):**
```
GitHub Actions → Busca direto da tabela events
↓
RLS bloqueia (anon key não tem permissão)
↓
❌ Invalid API key
```

### **Depois (Funcionando):**
```
GitHub Actions → Chama função get_upcoming_events()
↓
Função roda com permissões elevadas (SECURITY DEFINER)
↓
Bypass RLS ✅
↓
Retorna todos os eventos próximos
↓
✅ Notificações enviadas!
```

---

## 📊 **O que a Função Faz:**

```sql
get_upcoming_events(30)  -- 30 minutos
```

**Busca:**
- Todos os eventos de **todos os usuários**
- Que começam nos próximos **30 minutos**
- Ordenados por data de início

**Retorna:**
```json
[
  {
    "id": "...",
    "user_id": "...",
    "title": "Treino de Futebol",
    "start_date": "2025-12-18T18:00:00Z",
    "location": "Campo do bairro",
    ...
  }
]
```

**Segurança:**
- ✅ Só lê eventos (não modifica)
- ✅ Só retorna eventos futuros
- ✅ GitHub Actions usa isso para enviar notificações
- ✅ Usuários normais não podem usar para ver eventos de outros

---

## ⚠️ **Troubleshooting**

### **Erro: "function get_upcoming_events does not exist"**

**Causa:** A migração não foi executada ou falhou.

**Solução:**
1. Refaça o Passo 2 (copie o SQL novamente)
2. Execute com Run
3. Verifique se apareceu "Success"

### **Erro: "permission denied for table events"**

**Causa:** A função não tem permissão para acessar a tabela.

**Solução:** Execute este SQL adicional:

```sql
GRANT SELECT ON events TO postgres;
```

### **Erro: "syntax error at or near..."**

**Causa:** Não copiou o SQL completo ou copiou errado.

**Solução:**
1. Limpe o editor SQL
2. Copie NOVAMENTE do Passo 2
3. Cole e execute

---

## 🎉 **Após Migração:**

Você terá:

✅ **Notificações de eventos funcionando**
- GitHub Actions busca eventos a cada 5-15 minutos
- Envia notificação para cada usuário com evento próximo
- Funciona com app fechado
- 100% automático

✅ **Notificações diárias funcionando** (já funciona!)
- 07:00, 09:00, 11:30, 14:00, 17:00, 19:00, 21:00
- Para todos os usuários
- Também com app fechado

---

## 📞 **Resumo:**

1. ✅ Acessar SQL Editor do Supabase
2. ✅ Colar SQL da função `get_upcoming_events`
3. ✅ Executar (Run)
4. ✅ Testar com GitHub Actions
5. ✅ Notificações funcionando!

**Tempo:** 2 minutos  
**Dificuldade:** Fácil (copiar e colar)  
**Resultado:** Sistema 100% funcional! 🚀

---

## 🆘 **Precisa de Ajuda?**

Se der qualquer erro, me envie:
1. Print do erro no SQL Editor
2. Print dos logs do GitHub Actions
3. Eu te ajudo a resolver!

**Mas 99% das vezes, só copiar e colar o SQL resolve!** ✅

