# 🎯 Notificações Personalizadas por Jogador

## 📋 **Visão Geral**

Sistema de notificações **inteligentes e personalizadas** baseadas nas ações e dados de cada jogador.

---

## 🎮 **Tipos de Notificações Personalizadas**

### **1. 🏋️ Notificações de Treino**

#### **Cenários:**

**A) Treino não realizado:**
```
Horário: 18:00 (ou horário do treino agendado)
Condição: Jogador tem treino agendado mas não marcou como completo
Mensagem: "🏋️ Seu treino de hoje está te esperando! Não perca!"
URL: /dashboard/training
```

**B) Sequência de treinos:**
```
Quando: Após completar 7 dias seguidos
Mensagem: "🔥 7 dias de treino! Você é imparável!"
URL: /dashboard/achievements
```

**C) Lembrete pré-treino:**
```
Quando: 30 minutos antes do horário do treino
Mensagem: "⏰ Seu treino começa em 30 minutos. Prepare-se!"
URL: /dashboard/training
```

---

### **2. 🏆 Notificações de Conquistas**

#### **Cenários:**

**A) Nova conquista desbloqueada:**
```
Quando: Jogador completa critério de conquista
Mensagem: "🎉 Nova conquista desbloqueada: [Nome da Conquista]!"
URL: /dashboard/achievements
```

**B) Progresso de conquista:**
```
Quando: 80% do progresso para uma conquista
Mensagem: "📈 Você está quase lá! Faltam apenas [X] para desbloquear [Conquista]"
URL: /dashboard/achievements
```

**C) Conquista rara:**
```
Quando: Conquistou algo que poucos têm
Mensagem: "⭐ Uau! Você desbloqueou uma conquista rara! Apenas 5% dos jogadores têm isso!"
URL: /dashboard/achievements
```

---

### **3. 🥗 Notificações de Nutrição**

#### **Cenários:**

**A) Meta de água não atingida:**
```
Quando: 20:00 e bebeu menos de 2L
Mensagem: "💧 Ainda faltam [X]ml para sua meta de hidratação hoje!"
URL: /dashboard/nutrition
```

**B) Refeição planejada:**
```
Quando: Horário da refeição no plano nutricional
Mensagem: "🍽️ Hora do [almoço/jantar]! Confira seu plano nutricional"
URL: /dashboard/nutrition
```

**C) Macros do dia:**
```
Quando: 21:00
Mensagem: "📊 Resumo do dia: [X]g proteína, [Y]g carbs. Ótimo trabalho!"
URL: /dashboard/nutrition
```

---

### **4. 💪 Notificações Motivacionais**

#### **Cenários:**

**A) Inatividade:**
```
Quando: 3 dias sem treinar
Mensagem: "🤔 Sentimos sua falta! Que tal voltar aos treinos hoje?"
URL: /dashboard/training
```

**B) Progresso semanal:**
```
Quando: Domingo 20:00
Mensagem: "📈 Essa semana você treinou [X] vezes! Parabéns!"
URL: /dashboard
```

**C) Motivação diária:**
```
Quando: Horário aleatório (10:00-16:00)
Mensagem: "[Frase motivacional personalizada]"
URL: /dashboard/motivational
```

---

### **5. 🏅 Notificações de Ranking**

#### **Cenários:**

**A) Subiu de posição:**
```
Quando: Ranking atualiza e jogador subiu
Mensagem: "🚀 Você subiu para a posição #[X] no ranking!"
URL: /dashboard/ranking
```

**B) Ameaça de ultrapassagem:**
```
Quando: Jogador logo atrás está próximo
Mensagem: "⚠️ Cuidado! [Nome] está quase te alcançando no ranking!"
URL: /dashboard/ranking
```

**C) Novo recorde:**
```
Quando: Bateu recorde pessoal
Mensagem: "🎯 Novo recorde! Você nunca esteve tão bem!"
URL: /dashboard
```

---

## ⚙️ **Como Implementar**

### **Opção 1: Via GitHub Actions (Recomendado)**

Criar workflows específicos para cada tipo:

```yaml
# .github/workflows/training-reminders.yml
name: Lembretes de Treino

on:
  schedule:
    - cron: '0 18 * * *'  # 18:00 UTC (15:00 BRT)

jobs:
  check-training:
    runs-on: ubuntu-latest
    steps:
      - name: Buscar jogadores com treino não feito
        run: |
          # Buscar do Supabase jogadores que:
          # - Tem treino agendado para hoje
          # - Não marcaram como completo
          # - Horário passou
          
      - name: Enviar lembretes
        run: |
          # Para cada jogador, enviar via /api/notify
```

### **Opção 2: Via Hooks no App**

No código do app, quando algo acontece:

```typescript
// Em useProgress.ts - Quando ganha conquista
if (achievementUnlocked) {
  await notificationService.sendPushNotification(
    userId,
    "🏆 Nova Conquista!",
    `Você desbloqueou: ${achievementName}`,
    "/dashboard/achievements"
  );
}

// Em useTrainings.ts - Quando completa treino
if (trainingCompleted && streak === 7) {
  await notificationService.sendPushNotification(
    userId,
    "🔥 7 Dias Seguidos!",
    "Você está em uma sequência incrível!",
    "/dashboard/achievements"
  );
}
```

### **Opção 3: Sistema Híbrido (Melhor)**

**No App (imediato):**
- Conquistas desbloqueadas
- Level up
- Novo recorde pessoal

**GitHub Actions (agendado):**
- Treino não realizado
- Meta de água
- Relatórios semanais
- Lembretes de eventos

---

## 💾 **Estrutura de Dados Necessária**

### **Tabela: `player_preferences`**

```sql
CREATE TABLE player_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- Horários preferidos
  morning_training_time TIME,      -- Ex: 07:00
  evening_training_time TIME,      -- Ex: 18:00
  
  -- Preferências de notificação
  notify_training_reminder BOOLEAN DEFAULT true,
  notify_achievements BOOLEAN DEFAULT true,
  notify_nutrition BOOLEAN DEFAULT true,
  notify_ranking BOOLEAN DEFAULT true,
  notify_motivation BOOLEAN DEFAULT true,
  
  -- Frequência
  motivation_frequency TEXT DEFAULT 'daily', -- daily, weekly, never
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Tabela: `notification_history`**

```sql
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  
  type TEXT NOT NULL, -- 'training', 'achievement', 'nutrition', etc
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB, -- Dados extras (achievement_id, training_id, etc)
  
  INDEX idx_user_sent (user_id, sent_at DESC)
);
```

---

## 🚀 **Exemplo de Implementação**

### **Workflow: Lembrete de Treino**

```yaml
# .github/workflows/training-reminders.yml
name: Lembretes de Treino

on:
  schedule:
    # Verificar 3x por dia: 9h, 15h, 18h BRT
    - cron: '0 12 * * *'  # 09:00 BRT
    - cron: '0 18 * * *'  # 15:00 BRT
    - cron: '0 21 * * *'  # 18:00 BRT

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Buscar jogadores
        run: |
          # Buscar jogadores que:
          # 1. Tem treinos agendados para hoje
          # 2. Ainda não completaram
          # 3. Opt-in para notificações
          
          PLAYERS=$(curl -s "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/get_players_with_pending_training" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}")
          
      - name: Enviar notificações
        run: |
          echo "$PLAYERS" | jq -c '.[]' | while read player; do
            USER_ID=$(echo "$player" | jq -r '.user_id')
            TRAINING_NAME=$(echo "$player" | jq -r '.training_name')
            
            curl -X POST https://ym-sports.vercel.app/api/notify \
              -H "Content-Type: application/json" \
              -d "{
                \"user_id\": \"$USER_ID\",
                \"title\": \"🏋️ Lembrete de Treino\",
                \"body\": \"Seu treino '$TRAINING_NAME' está te esperando!\",
                \"url\": \"/dashboard/training\"
              }"
            
            sleep 1
          done
```

---

## 📊 **Estatísticas e Insights**

### **Rastrear efetividade:**

```typescript
// Quando usuário clica na notificação
await supabase
  .from('notification_history')
  .update({ clicked: true, clicked_at: new Date() })
  .eq('id', notificationId);

// Analytics
const clickRate = (clicked / sent) * 100;
console.log(`Taxa de clique: ${clickRate}%`);
```

---

## 🎯 **Próximos Passos**

### **Fase 1: Básico (Atual)** ✅
- Notificações diárias genéricas
- Notificações de eventos

### **Fase 2: Personalizado (Próximo)**
1. Criar tabelas no Supabase
2. Adicionar preferências no app
3. Criar workflows específicos
4. Hooks de conquistas/level up

### **Fase 3: Inteligente (Futuro)**
1. Machine Learning para melhor horário
2. A/B testing de mensagens
3. Notificações baseadas em comportamento
4. Gamificação avançada

---

## 💡 **Exemplo Completo: Treino Não Realizado**

### **1. Função SQL no Supabase:**

```sql
CREATE OR REPLACE FUNCTION get_players_with_pending_training()
RETURNS TABLE (
  user_id UUID,
  training_name TEXT,
  scheduled_time TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.user_id,
    t.name as training_name,
    t.scheduled_time
  FROM trainings t
  INNER JOIN player_preferences p ON t.user_id = p.user_id
  WHERE 
    -- Treino é para hoje
    t.scheduled_day = EXTRACT(DOW FROM NOW())
    -- Ainda não foi completado hoje
    AND NOT EXISTS (
      SELECT 1 FROM training_completions tc
      WHERE tc.training_id = t.id
      AND DATE(tc.completed_at) = CURRENT_DATE
    )
    -- Jogador quer receber notificações
    AND p.notify_training_reminder = true
    -- Horário já passou
    AND t.scheduled_time < CURRENT_TIME;
END;
$$ LANGUAGE plpgsql;
```

### **2. Workflow GitHub Actions:**

Ver exemplo acima.

### **3. Resultado:**

Jogadores recebem notificação personalizada:
```
🏋️ Lembrete de Treino
Seu treino 'Peito e Tríceps' estava agendado para 18:00.
Ainda dá tempo de fazer!
```

---

## ✅ **Resumo**

**Notificações personalizadas funcionam assim:**

1. **GitHub Actions** busca dados do Supabase
2. Filtra jogadores baseado em condições específicas
3. Envia notificação personalizada via `/api/notify`
4. Jogador recebe mesmo com app fechado
5. Rastreia cliques e efetividade

**Benefícios:**
- ✅ 100% personalizado por jogador
- ✅ Baseado em dados reais
- ✅ Funciona com app fechado
- ✅ Escalável
- ✅ Rastreável

---

## 📚 **Documentação Relacionada**

- `NOTIFICACOES_AUTOMATICAS_API.md` - Sistema base
- `CONFIGURAR_GITHUB_ACTIONS.md` - Como configurar
- `GUIA_RAPIDO_SECRETS.md` - Setup rápido

