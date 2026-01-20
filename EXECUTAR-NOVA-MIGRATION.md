# 🚀 EXECUTAR NOVA MIGRATION - SISTEMA DE RANKINGS

## ⚠️ IMPORTANTE - LEIA ANTES DE EXECUTAR

Este é um **NOVO SISTEMA DE RANKINGS** completamente refeito do zero.

## 📋 Passo a Passo

### 1️⃣ Ir para o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)

### 2️⃣ Executar a Migration
1. Copie **TODO** o conteúdo do arquivo:
   ```
   supabase/migrations/20250120_novo_sistema_rankings.sql
   ```

2. Cole no SQL Editor

3. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

4. Aguarde a execução (pode demorar 10-30 segundos)

5. Você deverá ver mensagens de sucesso como:
   - ✅ DROP TABLE IF EXISTS rankings CASCADE
   - ✅ CREATE TABLE rankings_cache
   - ✅ INSERT INTO rankings_cache (múltiplas linhas)
   - ✅ CREATE FUNCTION refresh_user_rankings
   - ✅ CREATE TRIGGER on_user_progress_change

### 3️⃣ Verificar se Funcionou
Execute esta query para verificar:

```sql
-- Ver quantos rankings foram criados
SELECT 
  ranking_type,
  COUNT(*) as total
FROM rankings_cache
GROUP BY ranking_type
ORDER BY ranking_type;
```

Você deve ver algo como:
```
ranking_type | total
-------------+------
local        |   X
national     |   X
regional     |   X
```

### 4️⃣ Testar no App
Depois que o deploy for concluído:
1. Acesse o app
2. Vá em **Rankings**
3. Você verá a nova interface moderna
4. Os rankings devem carregar sem erros
5. Sem duplicações! 🎉

## 🆕 O Que Mudou?

### Estrutura Antiga (Problemática)
- ❌ Tabela `rankings` com lógica complexa
- ❌ Duplicações frequentes
- ❌ Múltiplos `upserts` causando conflitos
- ❌ Posições calculadas e armazenadas (causava bugs)

### Estrutura Nova (Limpa)
- ✅ Tabela `rankings_cache` mais simples
- ✅ Sem duplicações (constraint única correta)
- ✅ Posições calculadas em tempo real
- ✅ Triggers automáticos quando pontos mudam
- ✅ Função `refresh_user_rankings` para atualizar

## 🔧 Como o Novo Sistema Funciona

1. **Armazenamento Simples**
   - Apenas armazena: `user_id`, `points`, `ranking_type`, `region`, `city`
   - Não armazena `position` (calculado em tempo real)

2. **Atualização Automática**
   - Quando usuário ganha pontos → Trigger atualiza automaticamente
   - Quando usuário muda localização → Trigger atualiza automaticamente

3. **Cálculo em Tempo Real**
   - Frontend ordena por `points DESC`
   - Posição = índice no array + 1
   - Sem conflitos, sem duplicações

4. **Cache Inteligente**
   - Dados em `localStorage` por 5 minutos
   - Reduz chamadas à API
   - Melhor performance

## 📊 Funções Disponíveis

### Atualizar Rankings de Um Usuário
```sql
SELECT refresh_user_rankings('USER_ID_AQUI');
```

### Limpar e Recalcular Tudo
```sql
TRUNCATE rankings_cache;
INSERT INTO rankings_cache (user_id, ranking_type, points)
SELECT user_id, 'national', total_points
FROM user_progress
WHERE total_points > 0;
-- (e assim por diante para regional e local)
```

## 🎯 Resultado Final

- ✅ Rankings funcionando perfeitamente
- ✅ Sem duplicações
- ✅ Interface moderna
- ✅ Performance otimizada
- ✅ Fácil de manter

## ⚠️ Se Algo Der Errado

Se a migration falhar:
1. Copie a mensagem de erro
2. Informe ao desenvolvedor
3. Não tente executar novamente sem verificar

---

**Criado em:** 20/01/2026  
**Versão:** 2.0 (Sistema completamente novo)
