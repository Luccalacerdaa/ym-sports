# 🔴 ERRO 403 - Ranking (Permissões RLS)

## Problema

```
Failed to load resource: the server responded with a status of 403
```

O erro 403 indica que o **Row Level Security (RLS)** do Supabase está bloqueando o acesso à tabela `rankings`.

---

## ✅ SOLUÇÃO

Execute este SQL no Supabase para ajustar as permissões:

### 1. Acesse o Supabase SQL Editor

👉 https://supabase.com/dashboard/project/qfnjgksvpjbuhzwuitzg/sql/new

### 2. Execute este SQL:

```sql
-- Permitir leitura pública da tabela rankings
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rankings são públicos" ON rankings;

CREATE POLICY "Rankings são públicos" 
ON rankings 
FOR SELECT 
TO authenticated
USING (true);

-- Permitir apenas service_role inserir/atualizar
DROP POLICY IF EXISTS "Apenas sistema pode gerenciar rankings" ON rankings;

CREATE POLICY "Apenas sistema pode gerenciar rankings" 
ON rankings 
FOR ALL 
TO authenticated
USING (auth.role() = 'service_role');

-- Permitir que users leiam suas próprias posições
DROP POLICY IF EXISTS "Users podem ver sua posição" ON rankings;

CREATE POLICY "Users podem ver sua posição" 
ON rankings 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Verificar se as policies foram criadas
SELECT * FROM pg_policies WHERE tablename = 'rankings';
```

---

## 🔍 Verificar Permissões Atuais

```sql
-- Ver todas as policies da tabela rankings
SELECT * FROM pg_policies WHERE tablename = 'rankings';

-- Ver se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'rankings';
```

---

## 📊 Testar Após Aplicar

1. Execute o SQL acima
2. Recarregue o app: https://ym-sports.vercel.app
3. Vá em "Ranking"
4. Deve carregar sem erro 403

---

## 💡 Se Ainda Der Erro

Se o erro persistir, pode ser que você precise criar dados primeiro:

```sql
-- Verificar se há dados
SELECT COUNT(*) FROM user_progress;

-- Se retornar 0, complete um treino no app primeiro
```

