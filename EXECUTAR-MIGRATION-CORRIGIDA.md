# ✅ MIGRATION CORRIGIDA - EXECUTAR AGORA

## 🔧 O que foi corrigido?

**Erro anterior:**
```
ERROR: 42601: syntax error at or near "("
LINE 28: CONSTRAINT rankings_cache_unique UNIQUE (user_id, ranking_type, COALESCE(region, ''), COALESCE(city, ''))
```

**Problema:** PostgreSQL não permite `COALESCE` em `CONSTRAINT UNIQUE` inline.

**Solução:** Usar `UNIQUE INDEX` separado (suporta expressões).

---

## 🚀 EXECUTAR AGORA NO SUPABASE

### Passo 1: Acesse o Supabase
1. https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**

### Passo 2: Copie e Execute
1. Abra o arquivo: `supabase/migrations/20250120_novo_sistema_rankings.sql`
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor
4. Clique em **RUN**

### Passo 3: Aguarde
- A execução leva 10-30 segundos
- Você verá várias mensagens ✅ de sucesso

---

## ✅ O que a migration faz agora?

```sql
1. DROP TABLE IF EXISTS rankings CASCADE
   ↓ Limpa tabela antiga

2. CREATE TABLE rankings_cache
   ↓ Cria nova tabela (sem constraint inline)

3. CREATE UNIQUE INDEX idx_rankings_cache_unique
   ↓ Cria índice único (suporta COALESCE)

4. CREATE INDEXES para performance
   ↓ 5 índices otimizados

5. ENABLE ROW LEVEL SECURITY + Políticas
   ↓ Segurança configurada

6. INSERT INTO rankings_cache
   ↓ Popula com dados atuais (nacional, regional, local)

7. CREATE FUNCTION refresh_user_rankings
   ↓ Função para atualizar (usa DELETE + INSERT)

8. CREATE TRIGGERs automáticos
   ↓ Atualiza quando pontos ou localização mudam
```

---

## 🎯 Verificar se Funcionou

Após executar, rode esta query:

```sql
-- Ver quantos rankings foram criados
SELECT 
  ranking_type,
  COUNT(*) as total
FROM rankings_cache
GROUP BY ranking_type
ORDER BY ranking_type;
```

**Resultado esperado:**
```
ranking_type | total
-------------+------
local        |   X
national     |   X
regional     |   X
```

Se aparecer números maiores que 0, funcionou! ✅

---

## 🔍 Testar Duplicações

```sql
-- Verificar se há duplicatas (deve retornar 0)
SELECT 
  user_id, 
  ranking_type, 
  COALESCE(region, '') as region,
  COALESCE(city, '') as city,
  COUNT(*)
FROM rankings_cache
GROUP BY user_id, ranking_type, COALESCE(region, ''), COALESCE(city, '')
HAVING COUNT(*) > 1;
```

**Resultado esperado:** 0 linhas (nenhuma duplicação!)

---

## 📱 Testar no App

Depois que executar:

1. Acesse: https://ym-sports.vercel.app
2. Faça login
3. Vá em **Rankings**
4. Você verá:
   - ✅ Interface nova e moderna
   - ✅ Tabs: Nacional / Regional / Local
   - ✅ Todos os jogadores aparecendo
   - ✅ Sem duplicações
   - ✅ Sua posição destacada

---

## 🆘 Se der algum erro

**Copie a mensagem de erro completa e me envie!**

Possíveis erros:
- Se falar de "relation already exists" → Ok, execute mesmo assim
- Se falar de "syntax error" → Me avise imediatamente
- Se falar de "permission denied" → Verifique se está como admin

---

## ✅ Tudo Certo?

Após executar com sucesso:
1. ✅ Migration executada
2. ✅ Tabela rankings_cache criada
3. ✅ Índices criados
4. ✅ Triggers configurados
5. ✅ Dados populados
6. ✅ App funcionando!

**Sistema pronto para uso!** 🎉

---

**Atualizado em:** 20/01/2026 - 10:15  
**Status:** ✅ PRONTO PARA EXECUTAR
