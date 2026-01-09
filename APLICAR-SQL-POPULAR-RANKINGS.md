# 🚀 APLICAR SQL: POPULAR RANKINGS DE TODOS USUÁRIOS

## ⚠️ PROBLEMA IDENTIFICADO

**Sintomas:**
- Só aparece 1 usuário no ranking (você)
- Usuários antigos não aparecem
- `getLevelProgress` está sendo chamado 20+ vezes (piscando)

**Causa:**
1. Rankings só têm o usuário atual no banco
2. `getLevelProgress` não tem cache, recalcula sempre

---

## ✅ SOLUÇÃO

### Parte 1: Popular Rankings no Banco

1. **Abra o Supabase** (https://supabase.com)
2. **Vá em SQL Editor**
3. **Cole o SQL** de `supabase/migrations/20250108_popular_rankings_todos_usuarios.sql`
4. **Execute (RUN)**

**O que faz:**
- Limpa rankings antigos
- Recria rankings para TODOS os usuários com progresso
- Cria rankings: Nacional, Regional (por região), Local (por estado)

### Parte 2: Cache no Frontend (já aplicado!)

✅ Adicionei cache de 30 segundos no `getLevelProgress`
✅ Mudei Dashboard para usar `useEffect` ao invés de chamar direto no render

---

## 🧪 TESTAR

### 1. Executar SQL de Verificação

Primeiro, veja quantos usuários têm progresso:

```sql
-- Copie e cole no SQL Editor do Supabase
SELECT 
  up.user_id,
  p.name as nome,
  up.total_points as pontos,
  up.current_level as nivel,
  ul.state as estado,
  ul.region as regiao
FROM user_progress up
LEFT JOIN profiles p ON p.id = up.user_id
LEFT JOIN user_locations ul ON ul.user_id = up.user_id
WHERE up.total_points > 0
ORDER BY up.total_points DESC;
```

**Anote quantos usuários aparecem!**

### 2. Executar SQL Principal

Agora aplique o SQL de `20250108_popular_rankings_todos_usuarios.sql`

### 3. Verificar Resultado

```sql
-- Copie e cole no SQL Editor do Supabase
SELECT 
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM rankings
WHERE period = 'all_time'
GROUP BY ranking_type
ORDER BY ranking_type;
```

**Deve mostrar:**
- `national`: X usuários
- `regional`: X usuários (com localização)
- `local`: X usuários (com estado)

### 4. Limpar Cache do Navegador

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 5. Entrar no App

- Vá para a aba "Ranking"
- Verifique se outros usuários aparecem
- Observe o console: deve ter MENOS chamadas `getLevelProgress`

---

## 📊 RESULTADO ESPERADO

### Antes:
```
Posição nacional: #1
Posição regional (Sudeste): #1
Posição local (RJ): #1
```
*(só você aparece)*

### Depois:
```
Posição nacional: #2 (ou outra)
Posição regional (Sudeste): #1 ou #2
Posição local (RJ): #1 ou #2
```
*(outros jogadores aparecem na lista!)*

### Console:
**Antes:** 20+ logs `🔍 [getLevelProgress] Entrada:`
**Depois:** 2-3 logs + vários `✅ [getLevelProgress] Usando cache:`

---

## ❓ SE NÃO FUNCIONAR

1. **Verifique quantos usuários têm progresso** (SQL de verificação acima)
2. **Se só tiver 1 usuário**, o ranking está correto (só tem você mesmo)
3. **Se tiver mais usuários mas não aparecem**, tire print do console e me envie
4. **Se ainda piscar muito**, limpe completamente o cache do navegador

---

## 📝 RESUMO

1. ✅ Execute `20250108_popular_rankings_todos_usuarios.sql` no Supabase
2. ✅ Limpe cache do navegador (Ctrl/Cmd + Shift + R)
3. ✅ Teste no app
4. ✅ Me avise o resultado!
