# 🔍 Diagnóstico: Notificações de Eventos

## ❌ **Problema:**

Mesmo após executar a migração SQL, continua dando:
```
Invalid API key
```

---

## 🧪 **DIAGNÓSTICO PASSO A PASSO:**

### **Teste 1: Verificar se função existe**

**Abra o Supabase SQL Editor e execute:**

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'get_upcoming_events';
```

**✅ Resultado esperado:**
```
routine_name          | routine_type
----------------------|-------------
get_upcoming_events   | FUNCTION
```

**❌ Se retornar 0 rows:**
- A função NÃO foi criada
- O SQL deu erro silenciosamente
- **Solução:** Execute a Versão 2 (mais abaixo)

---

### **Teste 2: Verificar permissões**

```sql
SELECT 
  routine_name,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'get_upcoming_events'
ORDER BY grantee;
```

**✅ Resultado esperado:**
```
routine_name          | grantee        | privilege_type
----------------------|----------------|---------------
get_upcoming_events   | anon           | EXECUTE
get_upcoming_events   | authenticated  | EXECUTE
```

**❌ Se NÃO aparecer `anon`:**
- Permissão não foi dada
- **Solução:** Execute:
```sql
GRANT EXECUTE ON FUNCTION get_upcoming_events TO anon;
```

---

### **Teste 3: Testar função diretamente**

```sql
SELECT get_upcoming_events(30);
```

**✅ Se funcionar:**
- Mostra `[]` (lista vazia) se não houver eventos
- Mostra eventos se houver
- Função está OK!

**❌ Se der erro:**
- Copie o erro completo
- Me envie para eu ajudar

---

### **Teste 4: Verificar RLS da tabela events**

```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'events';
```

**Resultado:**
```
tablename | rowsecurity
----------|------------
events    | t           ← 't' = RLS está ativo
```

Se `rowsecurity = f`, o RLS está desativado (estranho mas ok).

---

### **Teste 5: Ver policies da tabela**

```sql
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'events';
```

**Resultado esperado:**
- Deve mostrar as policies que controlam acesso
- Se houver policy restritiva para `anon`, isso explica o erro

---

## ✅ **SOLUÇÃO 1: Versão 2 da Função (Mais Simples)**

Execute este SQL no Supabase:

```sql
-- Deletar função anterior
DROP FUNCTION IF EXISTS get_upcoming_events(INTEGER);

-- Criar versão mais simples que retorna JSON direto
CREATE OR REPLACE FUNCTION get_upcoming_events(minutes_ahead INTEGER DEFAULT 30)
RETURNS JSON
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT COALESCE(json_agg(row_to_json(e)), '[]'::json)
  INTO result
  FROM (
    SELECT 
      id,
      user_id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      opponent
    FROM events
    WHERE 
      start_date >= NOW() 
      AND start_date <= (NOW() + (minutes_ahead || ' minutes')::INTERVAL)
    ORDER BY start_date ASC
  ) e;
  
  RETURN result;
END;
$$;

-- Dar permissões explícitas
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO service_role;

-- Testar
SELECT get_upcoming_events(30);
```

**Se aparecer `[]` ou eventos = FUNCIONOU!** ✅

---

## ✅ **SOLUÇÃO 2: Usar Service Role Key**

Se nada funcionar, podemos usar a **Service Role Key** que tem permissão total:

### **Passo 1: Pegar Service Role Key**

1. Supabase Dashboard
2. Settings → API
3. **service_role key** (não é a anon!)
4. Copiar

### **Passo 2: Adicionar secret no GitHub**

1. GitHub → Settings → Secrets → Actions
2. New repository secret
3. Name: `SUPABASE_SERVICE_KEY`
4. Value: `eyJ...` (sua service role key)
5. Add secret

### **Passo 3: Atualizar workflow**

Trocar de:
```yaml
-H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}"
-H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

Para:
```yaml
-H "apikey: ${{ secrets.SUPABASE_SERVICE_KEY }}"
-H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}"
```

**⚠️ Service Role Key tem ACESSO TOTAL!**
- Só use para workflows do GitHub (seguro)
- NUNCA exponha no frontend
- NUNCA commite no código

---

## ✅ **SOLUÇÃO 3: Desativar RLS (Temporário para Teste)**

**⚠️ APENAS PARA TESTAR! NÃO RECOMENDADO EM PRODUÇÃO!**

```sql
-- Desativar RLS da tabela events
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

**Testar workflow:**
- Se funcionar = problema era RLS
- Reativar depois:
```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

---

## 📊 **Checklist de Diagnóstico:**

Execute os testes na ordem e me diga o resultado:

- [ ] **Teste 1:** Função existe? (sim/não)
- [ ] **Teste 2:** Permissão para `anon`? (sim/não)
- [ ] **Teste 3:** Função executa? (sim/não)
- [ ] **Teste 4:** RLS está ativo? (sim/não)
- [ ] **Teste 5:** Quais policies existem? (copie resultado)

---

## 🔧 **Solução Rápida (99% dos casos):**

**Execute a Versão 2 do SQL:**
- Arquivo: `supabase/migrations/20251218_events_rpc_v2.sql`
- Ou copie o SQL da "Solução 1" acima
- Execute no Supabase SQL Editor
- Teste: `SELECT get_upcoming_events(30);`

**Se retornar `[]` = FUNCIONOU!** ✅

Depois teste o workflow do GitHub Actions!

---

## 📞 **Me envie:**

Se ainda não funcionar, me envie:

1. **Resultado do Teste 1** (função existe?)
2. **Resultado do Teste 2** (permissões)
3. **Resultado do Teste 3** (executar função)
4. **Print do erro** (se houver)

Vou descobrir o problema! 🔍

