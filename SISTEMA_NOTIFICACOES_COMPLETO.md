# 🔔 Sistema de Notificações Completo - YM Sports

## 📋 Visão Geral

Sistema centralizado e estruturado para envio de notificações push em tempo real, mesmo com o app fechado.

---

## 🏗️ Arquitetura

### **1. Serviço Centralizado**
**Arquivo:** `src/services/notificationService.ts`

Classe única que gerencia TODAS as notificações do app.

**Benefícios:**
- ✅ Código centralizado e reutilizável
- ✅ Fácil manutenção
- ✅ Logs consistentes
- ✅ Tratamento de erros padronizado

**Exemplo de uso:**
```typescript
import NotificationService from '@/services/notificationService';

// Enviar notificação de level up
await NotificationService.levelUp(user.id, 25);

// Enviar notificação de conquista
await NotificationService.achievement(user.id, "Dedicação", "7 dias consecutivos");
```

---

## 📱 Tipos de Notificações Implementadas

### **1. Level Up** 📈
**Quando:** Usuário sobe de nível
**Método:** `NotificationService.levelUp(user_id, newLevel)`
**Navegação:** `/dashboard/profile`

### **2. Conquistas** 🏆
**Quando:** Nova conquista desbloqueada
**Método:** `NotificationService.achievement(user_id, name, description)`
**Navegação:** `/dashboard/achievements`

### **3. Eventos do Calendário** 📅
**Quando:** 
- 30 minutos antes do evento
- 10 minutos antes
- Quando o evento começa

**Método:** `NotificationService.eventReminder(user_id, title, minutesUntil, location)`
**Navegação:** `/dashboard/calendar`

### **4. Lembrete de Treino** 💪
**Quando:** 
- 11:30 (antes do almoço)
- 17:00 (fim da tarde)

**Método:** `NotificationService.workoutReminder(user_id)`
**Navegação:** `/dashboard/training`

### **5. Hidratação** 💧
**Quando:**
- 09:00
- 14:00
- 19:00

**Método:** `NotificationService.hydration(user_id)`
**Navegação:** `/dashboard/nutrition`

### **6. Motivação Diária** 🌟
**Quando:**
- 07:00 (manhã)
- 21:00 (noite)

**Método:** `NotificationService.dailyMotivation(user_id)`
**Navegação:** `/dashboard/motivational`

### **7. Sequência (Streak)** 🔥
**Quando:** Atingir marcos de dias consecutivos (7, 14, 30, etc.)
**Método:** `NotificationService.streakMilestone(user_id, days)`
**Navegação:** `/dashboard/profile`

### **8. Bem-vindo** 👋
**Quando:** Novo usuário cria conta
**Método:** `NotificationService.welcome(user_id, userName)`
**Navegação:** `/dashboard`

### **9. Treino Concluído** ✅
**Quando:** Usuário completa um treino
**Método:** `NotificationService.workoutCompleted(user_id, workoutName, pointsEarned)`
**Navegação:** `/dashboard/training`

### **10. Meta Atingida** 🎯
**Quando:** Usuário atinge uma meta pessoal
**Método:** `NotificationService.goalAchieved(user_id, goalDescription)`
**Navegação:** `/dashboard/profile`

### **11. Subiu no Ranking** 📊
**Quando:** Posição no ranking melhora
**Método:** `NotificationService.rankingUp(user_id, newPosition, category)`
**Navegação:** `/dashboard/ranking`

### **12. Lembrete Personalizado** 🔔
**Quando:** Qualquer situação customizada
**Método:** `NotificationService.customReminder(user_id, title, message, url)`
**Navegação:** Customizável

---

## 🕐 Cronograma de Notificações Diárias

| Horário | Tipo | Descrição |
|---------|------|-----------|
| 07:00 | 🌟 Motivação | Mensagem inspiradora para começar o dia |
| 09:00 | 💧 Hidratação | Lembrete para beber água |
| 11:30 | 💪 Treino | Lembrete para fazer treino |
| 14:00 | 💧 Hidratação | Lembrete para beber água |
| 17:00 | 💪 Treino | Lembrete para fazer treino |
| 19:00 | 💧 Hidratação | Lembrete para beber água |
| 21:00 | 🌙 Boa Noite | Mensagem motivacional noturna |

---

## 🔧 Hooks Utilizados

### **1. useSimpleNotifications** (`src/hooks/useSimpleNotifications.ts`)
- Registra Service Worker
- Solicita permissão de notificações
- Configura Supabase no SW
- **Executa:** Uma vez ao fazer login

### **2. useDailyNotifications** (`src/hooks/useDailyNotifications.ts`)
- Monitora cronograma de notificações diárias
- Envia lembretes automáticos
- **Executa:** Continuamente, verifica a cada minuto

### **3. useEventNotifications** (`src/hooks/useEventNotifications.ts`)
- Monitora eventos do calendário
- Envia lembretes 30 min, 10 min e ao começar
- **Executa:** Continuamente, verifica a cada 5 minutos

### **4. useProgress** (`src/hooks/useProgress.ts`)
- Monitora progresso do usuário
- Envia notificações de level up e conquistas
- **Executa:** Quando pontos/achievements mudam

---

## 💻 Como Usar no Código

### **Exemplo 1: Enviar notificação ao concluir treino**

```typescript
import NotificationService from '@/services/notificationService';

const handleWorkoutCompletion = async () => {
  const user_id = user.id;
  const workoutName = "Treino de Resistência";
  const pointsEarned = 50;

  // Salvar conclusão no banco...
  await saveWorkoutCompletion();

  // Enviar notificação
  await NotificationService.workoutCompleted(user_id, workoutName, pointsEarned);
};
```

### **Exemplo 2: Enviar notificação ao atingir meta**

```typescript
import NotificationService from '@/services/notificationService';

const checkGoals = async () => {
  if (totalWorkouts >= 100) {
    await NotificationService.goalAchieved(
      user.id, 
      "Você completou 100 treinos! 🎉"
    );
  }
};
```

### **Exemplo 3: Notificação customizada**

```typescript
import NotificationService from '@/services/notificationService';

// Aniversário do usuário
await NotificationService.customReminder(
  user.id,
  "🎂 Feliz Aniversário!",
  "Parabéns! Que você conquiste todos os seus objetivos este ano!",
  "/dashboard/profile"
);

// Novo plano de nutrição disponível
await NotificationService.customReminder(
  user.id,
  "🥗 Novo Plano de Nutrição",
  "Seu plano personalizado está pronto!",
  "/dashboard/nutrition"
);
```

---

## 🧪 Como Testar

### **Teste 1: Level Up**
```typescript
// useProgress.ts já implementado
// Ao adicionar pontos suficientes, a notificação é enviada automaticamente
await addPoints(500, 'workout_completed', {...});
```

### **Teste 2: Conquista**
```typescript
// useProgress.ts já implementado
// Ao desbloquear conquista, a notificação é enviada automaticamente
await checkAchievements();
```

### **Teste 3: Evento**
1. Crie um evento no calendário para daqui 15 minutos
2. Aguarde 5 minutos
3. Notificação "Faltam 10 minutos" deve aparecer

### **Teste 4: Notificação Diária**
1. Ajuste o horário em `useDailyNotifications.ts` para o minuto atual + 1
2. Aguarde 1 minuto
3. Notificação deve aparecer

### **Teste 5: Manual (curl)**
```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID",
    "title": "🧪 Teste Manual",
    "body": "Notificação de teste via curl!",
    "url": "/dashboard"
  }'
```

---

## 📊 Fluxo Completo

```
1. Evento Acontece (ex: user sobe de nível)
   ↓
2. Código chama NotificationService.levelUp(user_id, newLevel)
   ↓
3. NotificationService faz POST para /api/notify
   ↓
4. API busca subscriptions do user no Supabase
   ↓
5. API envia via web-push para FCM (Firebase Cloud Messaging)
   ↓
6. FCM entrega para Service Worker do browser
   ↓
7. Service Worker mostra notificação (mesmo com app fechado!)
   ↓
8. Usuário clica → App abre na URL especificada
```

---

## 🔐 Segurança e Privacidade

- ✅ Apenas o próprio usuário recebe suas notificações
- ✅ Service Role Key do Supabase nunca exposta no frontend
- ✅ VAPID keys configuradas no Vercel (environment variables)
- ✅ Push subscriptions armazenadas com RLS (Row Level Security)
- ✅ Subscriptions inválidas são automaticamente removidas

---

## 📈 Estatísticas e Logs

### **Console Logs (DevTools)**

```
📤 Enviando notificação: 📈 Level Up!
✅ Notificação enviada: 1/1
```

### **Logs do Vercel (API)**

```
📨 Enviando notificação para user: 45610e6d...
📱 Encontradas 1 subscriptions
📤 Tentando enviar para: https://fcm.googleapis.com...
✅ Enviado com sucesso!
📊 Resultado: 1 enviadas, 0 falharam
```

---

## 🛠️ Troubleshooting

### **Notificações não chegam?**

1. **Verificar permissão:**
   - DevTools → Console
   - `Notification.permission` deve ser `"granted"`

2. **Verificar subscription:**
   - Settings → Ver se "Push Subscription: ✅ Ativa"

3. **Verificar Service Worker:**
   - DevTools → Application → Service Workers
   - Deve ter um SW ativo

4. **Verificar banco:**
   ```sql
   SELECT * FROM push_subscriptions WHERE user_id = 'SEU_ID';
   ```
   Deve ter pelo menos 1 linha

5. **Ver logs da API:**
   - Vercel → Functions → api/notify.js → Logs

---

## 📝 Adicionar Nova Notificação

### **Passo 1: Adicionar método no NotificationService**

```typescript
// src/services/notificationService.ts

static async newFeature(user_id: string, data: any): Promise<boolean> {
  return this.send({
    user_id,
    title: '🆕 Nova Funcionalidade!',
    body: `Descrição: ${data.description}`,
    url: '/dashboard/new-feature'
  });
}
```

### **Passo 2: Usar no código**

```typescript
import NotificationService from '@/services/notificationService';

// Quando a condição for atendida
if (conditionMet) {
  await NotificationService.newFeature(user.id, { description: "..." });
}
```

### **Passo 3: Testar**

```bash
# Via curl
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_ID",
    "title": "🆕 Nova Funcionalidade!",
    "body": "Teste da nova notificação",
    "url": "/dashboard/new-feature"
  }'
```

---

## 🎯 Boas Práticas

1. **Use sempre o NotificationService** - Nunca faça `fetch('/api/notify')` diretamente
2. **Emojis são bem-vindos** - Tornam as notificações mais atrativas
3. **Seja breve** - Título curto, mensagem objetiva
4. **URL correta** - Direcione para a página relevante
5. **Não spam** - Máximo 3-4 notificações por dia (exceto eventos)
6. **Teste antes de lançar** - Use curl ou a Central de Testes

---

## 📦 Arquivos do Sistema

```
src/
├── services/
│   └── notificationService.ts       ← Serviço centralizado ⭐
├── hooks/
│   ├── useSimpleNotifications.ts    ← Registra SW
│   ├── useDailyNotifications.ts     ← Notificações agendadas ⭐
│   ├── useEventNotifications.ts     ← Eventos do calendário ⭐
│   └── useProgress.ts               ← Level up e conquistas
└── App.tsx                          ← Inicializa hooks

api/
├── notify.js                        ← API principal de envio ⭐
├── subscribe.js                     ← Salvar subscriptions
└── clear-subscriptions.js           ← Limpar subscriptions

public/
└── sw.js                            ← Service Worker ⭐

supabase/migrations/
└── push_subscriptions_simples.sql   ← Tabela do banco ⭐
```

---

## 🚀 Próximos Passos

- [ ] Adicionar notificações para novos vídeos motivacionais
- [ ] Notificação de lembrete de portfólio incompleto
- [ ] Notificação de amigo começou a treinar
- [ ] Notificação de desafio semanal
- [ ] Analytics de notificações (taxa de abertura)

---

**Sistema completo, testado e funcionando! 🎉**

**Última atualização:** 18/12/2025

