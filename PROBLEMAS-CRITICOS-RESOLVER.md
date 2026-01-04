# 🚨 URGENTE: Problemas Críticos e Como Resolver

## ❌ Problemas Identificados

### 1️⃣ **Array(413) Rankings - NÃO RESOLVIDO**
```
Console: "Rankings do usuário: Array(413)"
```

**CAUSA:** O código tem DELETE no `calculateRankings`, mas o banco ainda não deletou os registros antigos.

**SOLUÇÃO URGENTE:**
```sql
-- Execute este SQL NO SUPABASE AGORA:
DELETE FROM rankings WHERE period = 'all_time';
```

Após deletar:
1. Hard Refresh (`Ctrl + Shift + R`)
2. Rankings serão recalculados automaticamente
3. Cada usuário terá apenas 3 rankings (nacional, regional, local)

---

### 2️⃣ **Ranking Local Não Mostra Outros Jogadores**

**PROBLEMA:**
- Você está em Guarapari
- Outra conta está em Guarapari
- Ranking local só mostra você

**CAUSA PROVÁVEL:** 
O Array(413) está poluindo o banco. Quando você deletar os rankings (solução 1), este problema deve ser resolvido.

**SE NÃO RESOLVER APÓS DELETAR:**
O problema pode ser o `fetchRankings` filtrando incorretamente. Verifique se `localRanking` está usando GPS + raio de 100km ou apenas estado.

---

### 3️⃣ **Sistema de Níveis Desbalanceado**

**PROBLEMA:**
- Nível 1 → 2: 100 pontos (1 treino)
- Nível 2 → 3: 100 pontos (1 treino)
- **MUITO FÁCIL!**

**SISTEMA ATUAL (Linear - Ruim):**
```
Nível 1:  0 pts
Nível 2:  100 pts  (1 treino)
Nível 3:  200 pts  (2 treinos total)
Nível 10: 900 pts  (9 treinos total)
Nível 21: 2000 pts (20 treinos total)
```

**SISTEMA NOVO (Progressivo - Balanceado):**
```
Nível 1:  0 pts
Nível 2:  100 pts   (1 treino)       [FÁCIL - Tutorial]
Nível 3:  250 pts   (2-3 treinos)    [FÁCIL - Engajamento]
Nível 4:  450 pts   (4-5 treinos)    [MODERADO]
Nível 5:  700 pts   (7 treinos)      [MODERADO]
Nível 10: 1.700 pts (17 treinos)     [DESAFIO]
Nível 20: 4.700 pts (47 treinos)     [DIFÍCIL]
Nível 50: 19.700 pts (197 treinos)   [MUITO DIFÍCIL]
```

**PARA APLICAR:**
Execute o SQL: `20250105_rebalancear_niveis.sql`

---

### 4️⃣ **Conquistas Completadas Não Sendo Concretizadas**

**PROBLEMA:**
- Você completou a conquista
- Aparece como "Pendente"
- Barra de progresso: 9/7, 270/10, etc.

**CAUSA:**
As conquistas estão verificando requisitos, mas não estão sendo "unlocked" corretamente.

**POSSÍVEIS CAUSAS:**
1. `checkAchievements()` não está sendo chamado após atividades
2. Requisitos das conquistas estão incorretos
3. Tabela `user_achievements` não está registrando

**PARA VERIFICAR:**
```sql
-- Ver conquistas do usuário
SELECT 
  ua.unlocked_at,
  a.name,
  a.requirement_type,
  a.requirement_value
FROM user_achievements ua
JOIN achievements a ON a.id = ua.achievement_id
WHERE ua.user_id = 'SEU_USER_ID'
ORDER BY ua.unlocked_at DESC;

-- Ver progresso atual
SELECT 
  total_points,
  current_level,
  total_workouts_completed,
  total_exercises_completed,
  current_workout_streak
FROM user_progress
WHERE user_id = 'SEU_USER_ID';
```

---

## 📋 ORDEM DE EXECUÇÃO (PASSO A PASSO)

### ✅ Passo 1: Limpar Rankings Duplicados

```sql
-- Abra Supabase Dashboard → SQL Editor
-- Cole e execute:
DELETE FROM rankings WHERE period = 'all_time';

-- Verificar:
SELECT COUNT(*) as total FROM rankings WHERE period = 'all_time';
-- Deve retornar: 0
```

### ✅ Passo 2: Aplicar Novo Sistema de Níveis

```sql
-- Abra Supabase Dashboard → SQL Editor
-- Cole TODO o conteúdo de: 20250105_rebalancear_niveis.sql
-- Execute

-- Verificar:
SELECT level, points_required FROM level_thresholds ORDER BY level LIMIT 10;
```

### ✅ Passo 3: Recalcular Níveis de Todos os Usuários

```sql
-- Atualizar níveis baseado nos novos thresholds
UPDATE user_progress
SET current_level = (
  SELECT level 
  FROM level_thresholds 
  WHERE points_required <= user_progress.total_points 
  ORDER BY level DESC 
  LIMIT 1
);

-- Verificar:
SELECT 
  user_id,
  total_points,
  current_level,
  (SELECT points_required FROM level_thresholds WHERE level = current_level) as pontos_nivel_atual,
  (SELECT points_required FROM level_thresholds WHERE level = current_level + 1) as pontos_proximo_nivel
FROM user_progress;
```

### ✅ Passo 4: Hard Refresh no App

```
Ctrl + Shift + R
```

### ✅ Passo 5: Testar

**Teste 1: Rankings**
```
1. F12 → Console
2. Buscar: "Rankings do usuário:"
3. Deve mostrar: Array(3) [nacional, regional, local]
4. NÃO deve mostrar: Array(413)
```

**Teste 2: Outros Jogadores**
```
1. Ranking → Local
2. Deve mostrar TODOS jogadores próximos
3. NÃO deve mostrar só você
```

**Teste 3: Níveis**
```
1. Ver nível atual (ex: 21)
2. Ver pontos (ex: 2000)
3. Completar treino (+100 pts = 2100 pts)
4. Nível NÃO deve mudar (ainda nível 21)
5. Agora precisa ~2700 pts para nível 22
```

**Teste 4: Conquistas**
```
1. Completar um treino
2. Verificar conquistas
3. "Primeira Jornada" deve ser concluída (se for o 1º treino)
4. Barra deve estar correta (ex: 1/1, não 0/1)
```

---

## 🎯 Resultados Esperados

| Antes | Depois |
|-------|--------|
| Array(413) rankings | Array(3) rankings |
| Só você no ranking local | Todos jogadores próximos |
| Nível 2→3 com 1 treino | Nível 2→3 com 2-3 treinos |
| Conquistas não concluem | Conquistas concluem corretamente |

---

## ⚠️ Se Ainda Tiver Problemas

### Problema: Ranking local ainda não mostra outros jogadores

**Solução:**
1. Verifique se os 2 dispositivos estão REALMENTE na mesma localização
2. Verifique no banco:

```sql
SELECT 
  p.name,
  ul.state,
  ul.city_approximate,
  ul.latitude_approximate,
  ul.longitude_approximate
FROM user_locations ul
JOIN profiles p ON p.id = ul.user_id;
```

3. Se as coordenadas estão muito diferentes (>100km), o GPS pode estar pegando localizações incorretas

### Problema: Conquistas ainda não concluem

**Solução:**
1. Force uma recalcul

ação:

```sql
-- No SQL Editor
SELECT * FROM achievements WHERE category = 'workout' ORDER BY requirement_value;

-- Verificar se os requisitos fazem sentido
-- Ex: "Primeira Jornada" deve ter requirement_value = 1
```

2. Teste manualmente desbloquear uma conquista:

```sql
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
VALUES ('SEU_USER_ID', 'ID_DA_CONQUISTA', NOW())
ON CONFLICT DO NOTHING;
```

---

## 📞 Resumo Rápido

**3 SQLs para executar NO SUPABASE:**

1. `DELETE FROM rankings WHERE period = 'all_time';`
2. Cole todo `20250105_rebalancear_niveis.sql`
3. `UPDATE user_progress SET current_level = (SELECT level FROM level_thresholds WHERE points_required <= user_progress.total_points ORDER BY level DESC LIMIT 1);`

**Depois:**
- `Ctrl + Shift + R` no app
- Testar rankings, níveis, conquistas

**Tempo total:** 5 minutos

---

Criado em: 05/01/2025  
Arquivos: 
- `20250105_limpar_rankings_duplicados.sql`
- `20250105_rebalancear_niveis.sql`

