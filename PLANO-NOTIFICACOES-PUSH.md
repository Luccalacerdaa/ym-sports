# 🔔 Plano Completo: Notificações Push - YM Sports

## 📋 Visão Geral

Sistema de notificações push que funciona **mesmo com o app fechado**, usando **Service Worker + Push API + VAPID**.

### Casos de Uso
- ⚽ Lembrete de treino/jogo (1h antes)
- 🏆 Nova conquista desbloqueada
- 📈 Subida de nível
- 🎯 Novo plano de treino gerado
- 👥 Novo competidor próximo

---

## 🏗️ Arquitetura

```
Cliente (React)  →  Service Worker  →  Navegador mostra notificação
     ↓
API (/api/save-subscription)  →  Supabase (push_subscriptions)
     ↑
API (/api/send-notification)  ←  Eventos do sistema
```

---

## 📁 Estrutura de Arquivos

```
ym-sports/
├── public/
│   └── sw.js                          # Service Worker
├── src/
│   ├── hooks/
│   │   └── usePushNotifications.ts    # Hook principal
│   └── components/
│       └── NotificationSettings.tsx   # UI de configuração
├── api/
│   ├── save-subscription.ts           # Salvar token
│   ├── send-notification.ts           # Enviar para todos
│   └── send-notification-to-user.ts   # Enviar para um usuário
└── supabase/migrations/
    └── push_notifications.sql         # Schema do BD
```

---

## ⚙️ 1. Gerar Chaves VAPID

```bash
cd ym-sports
npm install web-push --save-dev
npx web-push generate-vapid-keys
```

Copiar as chaves geradas e adicionar no `.env.local`:

```env
VITE_VAPID_PUBLIC_KEY=BJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ 2. Migration SQL (Supabase)

Criar arquivo `supabase/migrations/20250127_push_notifications.sql`:

```sql
-- Tabela de inscrições push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  subscription_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_created_at ON push_subscriptions(created_at);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas inscrições"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);
```

Executar a migration:
```bash
# Via Supabase Dashboard → SQL Editor → colar o código acima
```

---

## 🔧 3. Service Worker (`public/sw.js`)

Criar arquivo `public/sw.js`:

```javascript
const APP_URL = 'https://ym-sports.vercel.app';

self.addEventListener('install', (event) => {
  console.log('[SW] Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Ativado');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: data.icon || `${APP_URL}/icons/logo.png`,
    badge: `${APP_URL}/icons/logo.png`,
    data: { url: data.url || `${APP_URL}/dashboard` },
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'YM Sports', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.startsWith(APP_URL) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
```

---

## 💻 4. Hook React (`src/hooks/usePushNotifications.ts`)

Criar arquivo `src/hooks/usePushNotifications.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supported = 
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    
    setIsSupported(supported);
    if (supported) setPermission(Notification.permission);
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!user) throw new Error('Usuário não autenticado');
    setLoading(true);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm !== 'granted') {
        toast.error('Permissão negada');
        return null;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      let sub = await registration.pushManager.getSubscription();

      if (!sub) {
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      const response = await fetch('/api/save-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, subscription: sub.toJSON() })
      });

      if (!response.ok) throw new Error('Falha ao salvar inscrição');

      setSubscription(sub);
      toast.success('Notificações ativadas!');
      return sub;
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao ativar notificações');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return false;
    setLoading(true);

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      toast.success('Notificações desativadas');
      return true;
    } catch (error) {
      toast.error('Erro ao desativar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported || !user) return;
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    };
    checkSubscription();
  }, [isSupported, user]);

  return { isSupported, permission, subscription, loading, subscribe, unsubscribe };
};
```

---

## 🔌 5. API Routes

### `api/save-subscription.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, subscription } = req.body;
  if (!user_id || !subscription) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', user_id)
    .eq('endpoint', subscription.endpoint)
    .single();

  if (existing) {
    await supabase
      .from('push_subscriptions')
      .update({ subscription_data: subscription, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('push_subscriptions')
      .insert({ user_id, endpoint: subscription.endpoint, subscription_data: subscription });
  }

  return res.status(200).json({ success: true });
}
```

### `api/send-notification-to-user.ts`

```typescript
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

webpush.setVapidDetails(
  'mailto:suporte@ymsports.com',
  process.env.VITE_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, title, body, url } = req.body;
  if (!user_id || !title) return res.status(400).json({ error: 'Missing fields' });

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user_id);

  if (!subs || subs.length === 0) {
    return res.status(404).json({ message: 'No subscriptions' });
  }

  const payload = JSON.stringify({
    title,
    body: body || '',
    url: url || 'https://ym-sports.vercel.app/dashboard',
    icon: 'https://ym-sports.vercel.app/icons/logo.png'
  });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub.subscription_data, payload);
      sent++;
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id);
      }
    }
  }

  return res.status(200).json({ success: sent > 0, sent });
}
```

---

## 🎨 6. Componente UI (`src/components/NotificationSettings.tsx`)

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, AlertCircle } from 'lucide-react';

export function NotificationSettings() {
  const { isSupported, permission, subscription, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <p>Notificações não suportadas neste navegador.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isSubscribed = !!subscription && permission === 'granted';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Notificações Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Receber notificações</Label>
            <p className="text-sm text-muted-foreground">
              Treinos, eventos e conquistas
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={(checked) => checked ? subscribe() : unsubscribe()}
            disabled={loading}
          />
        </div>

        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              ⚠️ Notificações bloqueadas. Ative nas configurações do navegador.
            </p>
          </div>
        )}

        {isSubscribed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✅ Notificações ativadas!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🚀 7. Integração com o Sistema

### Exemplo: Notificar ao completar treino

No arquivo `src/hooks/useProgress.ts`, adicionar:

```typescript
const recordWorkoutCompletion = async (training: Training) => {
  // ... lógica existente ...

  // Notificar se subiu de nível
  if (levelUp) {
    await fetch('/api/send-notification-to-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        title: '🎉 Subiu de Nível!',
        body: `Parabéns! Você alcançou o nível ${newLevel}!`,
        url: '/dashboard'
      })
    });
  }
};
```

---

## 📱 8. Adicionar às Configurações do Usuário

Em `src/pages/Profile.tsx` ou `src/pages/Settings.tsx`:

```typescript
import { NotificationSettings } from '@/components/NotificationSettings';

// Adicionar na página
<NotificationSettings />
```

---

## 🧪 9. Testes

### Testar Permissão (Console do navegador)
```javascript
Notification.requestPermission().then(p => console.log(p));
```

### Testar Notificação Local
```javascript
new Notification('Teste', { body: 'Funciona!' });
```

### Testar Service Worker
```javascript
navigator.serviceWorker.ready.then(reg => console.log(reg));
```

### Testar API (Terminal)
```bash
curl -X POST https://ym-sports.vercel.app/api/send-notification-to-user \
  -H "Content-Type: application/json" \
  -d '{"user_id":"UUID_DO_USER","title":"Teste","body":"Mensagem de teste"}'
```

---

## 📦 10. Dependências Necessárias

```bash
npm install web-push @types/web-push
```

---

## ✅ Checklist de Implementação

### Fase 1: Setup
- [ ] Gerar chaves VAPID
- [ ] Configurar `.env.local`
- [ ] Criar migration no Supabase
- [ ] Executar migration

### Fase 2: Service Worker
- [ ] Criar `public/sw.js`
- [ ] Testar registro do SW

### Fase 3: Frontend
- [ ] Criar `usePushNotifications.ts`
- [ ] Criar `NotificationSettings.tsx`
- [ ] Adicionar componente em Configurações
- [ ] Testar inscrição

### Fase 4: Backend
- [ ] Criar `api/save-subscription.ts`
- [ ] Criar `api/send-notification-to-user.ts`
- [ ] Instalar `web-push`
- [ ] Testar envio

### Fase 5: Integrações
- [ ] Notificação de subida de nível
- [ ] Notificação de conquista
- [ ] Lembrete de eventos (futuro)

### Fase 6: Deploy
- [ ] Configurar vars na Vercel
- [ ] Deploy
- [ ] Testar em produção

---

## 🎯 Próximos Passos

1. **Implementar sistema de fila**: Para notificações agendadas (lembretes)
2. **Edge Functions**: Para processar notificações em background
3. **Cron Jobs**: Para verificar eventos próximos
4. **Analytics**: Rastrear taxa de abertura das notificações

---

## 📚 Recursos

- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push Library](https://github.com/web-push-libs/web-push)
- [Push Notifications Guide](https://web.dev/push-notifications-overview/)

---

## ✅ Status: PRONTO PARA IMPLEMENTAÇÃO 🚀

Este plano está completo e pode ser implementado seguindo os passos acima!
