# 📱 Comando para Enviar Notificação via CMD

## 🚀 Comando Básico (Teste Rápido)

```bash
curl -X POST http://localhost:5173/test-notification \
  -H "Content-Type: application/json" \
  -d '{"title":"🏆 Teste CMD","body":"Notificação enviada via terminal!"}'
```

**⚠️ IMPORTANTE:** Este endpoint precisa ser criado no backend para funcionar via CMD.

---

## 🔔 SOLUÇÃO ATUAL: Via Service Worker

Como nosso sistema usa Service Worker, **NÃO É POSSÍVEL** enviar notificações diretamente via curl para dispositivos PWA sem um backend específico.

### Por que não funciona diretamente?

1. **Service Workers rodam no navegador** do usuário
2. **Não há servidor recebendo requests** na porta 5173
3. **Push API precisa de VAPID keys** e backend dedicado

---

## ✅ COMO ENVIAR NOTIFICAÇÕES AGORA

### Opção 1: Via Navegador (Console)

Abra o console do navegador (F12) e execute:

```javascript
// Enviar notificação via Service Worker
navigator.serviceWorker.controller.postMessage({
  type: 'SHOW_NOTIFICATION',
  title: '🏆 Teste Manual',
  body: 'Notificação enviada via console!',
  options: {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    requireInteraction: true
  }
});
```

### Opção 2: Via Teste Agendado (1 minuto)

No app:
1. Vá em **Configurações**
2. Clique em **"Agendar Teste (1 min)"**
3. Aguarde 1 minuto
4. ✅ Notificação chega automaticamente!

### Opção 3: Cronograma Automático

Notificações automáticas nos horários:
- **07:00** - Bom dia, atleta!
- **08:30** - Treino te espera
- **12:00** - Hora do almoço
- **15:30** - Foco no objetivo
- **18:30** - Fim de dia
- **20:00** - Ranking

---

## 🔥 PARA ENVIAR VIA CMD (Backend Necessário)

Se você realmente precisa enviar via curl, precisa:

### 1️⃣ Criar Endpoint no Backend

Crie o arquivo `api/send-notification.ts`:

```typescript
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body, userId } = req.body;

  // Buscar subscription do usuário
  const { data: subscription } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  // Enviar push via Web Push API
  // (código completo no arquivo existente api/send-push.ts)

  return res.status(200).json({ success: true });
}
```

### 2️⃣ Usar o Comando

```bash
curl -X POST https://ym-sports.vercel.app/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "SEU_USER_ID",
    "title": "🏆 Teste CMD",
    "body": "Notificação via terminal funcionando!"
  }'
```

### 3️⃣ Configurar VAPID Keys

Configure no Vercel:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

(Veja `PUSH_NOTIFICATIONS_SETUP.md` para detalhes)

---

## 💡 RECOMENDAÇÃO

**Use o sistema atual (Service Worker) que já está funcionando:**

✅ **Vantagens:**
- Zero custo
- Funciona imediatamente
- Notificações automáticas nos horários
- Teste de 1 minuto disponível

❌ **Desvantagens:**
- Não envia via curl diretamente
- Precisa do app aberto/background

---

## 🧪 TESTE RÁPIDO (Agora mesmo)

Execute no console do navegador (F12):

```javascript
// Teste imediato
self.registration.showNotification('🧪 Teste Agora', {
  body: 'Notificação de teste!',
  icon: '/icons/icon-192.png',
  requireInteraction: true
});
```

Ou use o botão **"Agendar Teste (1 min)"** na página de Configurações!

---

## 📚 ARQUIVOS RELACIONADOS

- `public/sw.js` - Service Worker principal
- `src/hooks/useSimpleNotifications.ts` - Hook de notificações
- `api/send-push.ts` - Backend para push (não implementado)
- `NOTIFICACOES_APP_FECHADO.md` - Guia completo

---

## ✅ CONCLUSÃO

**Não existe comando curl direto** porque o sistema usa Service Workers client-side.

**Para testar:**
1. Use o botão de teste (1 minuto)
2. Aguarde o cronograma automático
3. Ou execute JavaScript no console

**Se precisar de curl, seria necessário:**
- Implementar backend completo
- Configurar VAPID keys
- Usar Web Push API

**O sistema atual já funciona bem sem isso! 🎉**

