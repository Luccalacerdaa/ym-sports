# 📚 Sistema de Notificações com Vercel Cron - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Componentes](#componentes)
4. [Setup Passo a Passo](#setup-passo-a-passo)
5. [Configurações e Variáveis](#configurações-e-variáveis)
6. [Como Replicar para Outro Projeto](#como-replicar)

---

## 🎯 Visão Geral

Sistema de notificações push automático usando:
- **Vercel Cron Jobs** (agendamento automático)
- **Web Push API** (notificações nativas do navegador)
- **Supabase** (banco de dados e autenticação)
- **Serverless Functions** (API routes da Vercel)

### Tipos de Notificações:
1. **Notificações de Eventos**: 30 min antes + na hora do evento
2. **Notificações Diárias**: Lembretes ao longo do dia (hidratação, treino, etc)

---

## 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    A[Vercel Cron] -->|A cada minuto| B[check-events-cron.js]
    A -->|Horários específicos| C[daily-notifications-cron.js]
    
    B -->|1. Busca eventos próximos| D[Supabase RPC]
    D -->|2. Retorna eventos| B
    B -->|3. Verifica cache| E[event_notifications_sent]
    B -->|4. Envia notificação| F[/api/notify]
    
    C -->|1. Busca subscriptions| G[push_subscriptions]
    C -->|2. Envia direto| H[Web Push API]
    
    F -->|Busca subscriptions do usuário| G
    F -->|Envia push| H
    
    H -->|Entrega| I[Navegador do Usuário]
```

### Fluxo Detalhado:

#### **Notificações de Eventos (check-events-cron)**
1. **Vercel Cron** executa `/api/check-events-cron` a cada minuto
2. **Função RPC** `get_upcoming_events(30)` busca eventos nos próximos 30 minutos
3. **Lógica de Timing**:
   - 30 min antes: `minutesUntil >= 25 && minutesUntil <= 35`
   - Na hora: `minutesUntil >= -1 && minutesUntil <= 2`
4. **Cache de Deduplicação**: Verifica `event_notifications_sent`
5. **Envio**: Chama `/api/notify` para cada usuário
6. **Registro**: Salva no cache para evitar duplicatas

#### **Notificações Diárias (daily-notifications-cron)**
1. **Vercel Cron** executa em horários específicos (10h, 12h, 14:30h, etc)
2. **Conversão de Fuso**: UTC → BRT (UTC-3)
3. **Lookup**: Busca mensagem no `DAILY_SCHEDULE`
4. **Broadcast**: Envia para TODOS os usuários com push ativo

---

## 🔧 Componentes

### 1. **vercel.json** (Configuração dos Cron Jobs)

```json
{
  "crons": [
    {
      "path": "/api/check-events-cron",
      "schedule": "* * * * *"  // A cada minuto
    },
    {
      "path": "/api/daily-notifications-cron",
      "schedule": "0 10 * * *"  // 10h UTC (7h BRT)
    },
    {
      "path": "/api/daily-notifications-cron",
      "schedule": "0 12 * * *"  // 12h UTC (9h BRT)
    }
    // ... mais horários
  ]
}
```

**Sintaxe Cron:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Dia da semana (0-6, 0 = domingo)
│ │ │ └───── Mês (1-12)
│ │ └─────── Dia do mês (1-31)
│ └───────── Hora (0-23)
└─────────── Minuto (0-59)
```

Exemplos:
- `* * * * *` = A cada minuto
- `0 10 * * *` = Todo dia às 10:00 UTC
- `*/5 * * * *` = A cada 5 minutos
- `0 */2 * * *` = A cada 2 horas

---

### 2. **api/check-events-cron.js** (Notificações de Eventos)

```javascript
import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 60, // Timeout de 60 segundos
};

export default async function handler(req, res) {
  // 1. VALIDAR SEGURANÇA (opcional mas recomendado)
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. INICIALIZAR SUPABASE
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 3. BUSCAR EVENTOS PRÓXIMOS via RPC
  const { data: events } = await supabase
    .rpc('get_upcoming_events', { minutes_ahead: 30 });

  // 4. PROCESSAR CADA EVENTO
  for (const event of events) {
    const now = new Date();
    const eventDate = new Date(event.start_date);
    const minutesUntil = Math.round(
      (eventDate.getTime() - now.getTime()) / 60000
    );

    // Determinar tipo de notificação
    let notificationTag = null;
    if (minutesUntil >= -1 && minutesUntil <= 2) {
      notificationTag = 'now';
    } else if (minutesUntil >= 25 && minutesUntil <= 35) {
      notificationTag = '30min';
    } else {
      continue; // Fora do intervalo
    }

    // 5. VERIFICAR SE JÁ ENVIOU (CACHE)
    const { data: alreadySent } = await supabase
      .from('event_notifications_sent')
      .select('id')
      .eq('event_id', event.id)
      .eq('notification_type', notificationTag)
      .single();

    if (alreadySent) continue;

    // 6. ENVIAR NOTIFICAÇÃO
    await fetch('https://seu-site.vercel.app/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: event.user_id,
        title: `🚀 ${event.title}`,
        body: 'Está começando AGORA!',
        url: '/dashboard/calendar'
      })
    });

    // 7. REGISTRAR NO CACHE
    await supabase
      .from('event_notifications_sent')
      .insert({
        event_id: event.id,
        user_id: event.user_id,
        notification_type: notificationTag
      });
  }

  return res.status(200).json({ success: true });
}
```

**Pontos-chave:**
- ✅ `SECURITY DEFINER` na função RPC para bypass de RLS
- ✅ Cache de deduplicação com `event_notifications_sent`
- ✅ Tolerância de tempo (30min = 25-35min)
- ✅ Aguardar 500ms entre notificações (evitar rate limiting)

---

### 3. **api/daily-notifications-cron.js** (Notificações Diárias)

```javascript
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const DAILY_SCHEDULE = {
  '07:00': { title: "💪 Bom dia!", body: "Hora de treinar!", url: "/dashboard" },
  '09:00': { title: "💧 Hidratação!", body: "Beba água!", url: "/dashboard/nutrition" },
  // ... mais horários
};

export default async function handler(req, res) {
  // 1. INICIALIZAR
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  webpush.setVapidDetails(
    'mailto:seu-email@exemplo.com',
    process.env.VITE_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // 2. PEGAR HORÁRIO BRT (UTC-3)
  const now = new Date();
  const brTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const currentTimeBRT = `${brTime.getHours()}:${brTime.getMinutes()}`;

  // 3. BUSCAR NOTIFICAÇÃO PARA ESTE HORÁRIO
  const notificationData = DAILY_SCHEDULE[currentTimeBRT];
  
  if (!notificationData) {
    return res.status(200).json({ message: 'No notification for this time' });
  }

  // 4. BUSCAR TODAS AS SUBSCRIPTIONS
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*');

  // 5. ENVIAR PARA CADA SUBSCRIPTION
  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify({
          title: notificationData.title,
          body: notificationData.body,
          url: notificationData.url,
          icon: '/icons/icon-192.png'
        })
      );
      sent++;
    } catch (error) {
      // Se subscription inválida, remover
      if (error.statusCode === 410) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id);
      }
    }
  }

  return res.status(200).json({ success: true, sent });
}
```

**Pontos-chave:**
- ✅ Converte UTC para fuso local (BRT = UTC-3)
- ✅ Envia direto para todos os usuários
- ✅ Remove subscriptions inválidas automaticamente (410 Gone)
- ✅ Tolerância de ±1 minuto para compensar atrasos

---

### 4. **api/notify.js** (API Genérica de Notificação)

```javascript
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. INICIALIZAR
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  webpush.setVapidDetails(
    'mailto:seu-email@exemplo.com',
    process.env.VITE_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // 2. PEGAR DADOS DA REQUISIÇÃO
  const { user_id, title, body, url } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ error: 'user_id and title required' });
  }

  // 3. BUSCAR SUBSCRIPTIONS DO USUÁRIO
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user_id);

  if (!subs || subs.length === 0) {
    return res.status(404).json({ error: 'No subscriptions found' });
  }

  // 4. ENVIAR PARA CADA SUBSCRIPTION
  const payload = JSON.stringify({
    title,
    body: body || '',
    url: url || '/dashboard',
    icon: '/icons/icon-192.png'
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        payload
      );
      sent++;
    } catch (error) {
      failed++;
      
      // Remover subscription inválida
      if (error.statusCode === 410 || error.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id);
      }
    }
  }

  return res.status(200).json({ success: sent > 0, sent, failed });
}
```

---

### 5. **Função RPC do Supabase** (get_upcoming_events)

```sql
-- Função que busca eventos próximos (BYPASS RLS)
CREATE OR REPLACE FUNCTION get_upcoming_events(minutes_ahead INTEGER DEFAULT 30)
RETURNS JSONB
SECURITY DEFINER  -- 🔑 Permite bypass de RLS
SET search_path = public, pg_temp
LANGUAGE sql
AS $$
  WITH ordered_events AS (
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
      -- Incluir eventos que começaram há até 2 minutos
      start_date >= (NOW() - INTERVAL '2 minutes')
      AND start_date <= (NOW() + (minutes_ahead || ' minutes')::INTERVAL)
    ORDER BY start_date ASC
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', e.id,
        'user_id', e.user_id,
        'title', e.title,
        'description', COALESCE(e.description, ''),
        'event_type', e.event_type,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'location', COALESCE(e.location, ''),
        'opponent', COALESCE(e.opponent, '')
      )
    ),
    '[]'::jsonb
  )
  FROM ordered_events e;
$$;

-- Dar permissões
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO service_role;
```

**Por que RPC?**
- ✅ Bypass de RLS (busca eventos de TODOS os usuários)
- ✅ Performance (query otimizada no servidor)
- ✅ Segurança (lógica no banco, não expõe dados)

---

### 6. **Tabela de Cache** (event_notifications_sent)

```sql
-- Evita enviar a mesma notificação duas vezes
CREATE TABLE event_notifications_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- '30min' ou 'now'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Garante que cada tipo de notificação só é enviada uma vez por evento
  CONSTRAINT unique_event_notification UNIQUE (event_id, notification_type)
);

-- Índices para performance
CREATE INDEX idx_event_notifications_event_id ON event_notifications_sent(event_id);
CREATE INDEX idx_event_notifications_user_id ON event_notifications_sent(user_id);

-- RLS
ALTER TABLE event_notifications_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification history"
  ON event_notifications_sent
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
  ON event_notifications_sent
  FOR INSERT
  WITH CHECK (true);
```

---

## ⚙️ Configurações e Variáveis

### **Variáveis de Ambiente (Vercel)**

Vá em **Vercel → Settings → Environment Variables** e adicione:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Service Role Key (bypass RLS) |
| `VITE_VAPID_PUBLIC_KEY` | `BN7z...` | Chave pública VAPID |
| `VAPID_PRIVATE_KEY` | `X9e2...` | Chave privada VAPID |
| `WEB_PUSH_CONTACT` | `mailto:seu-email@exemplo.com` | Email de contato |
| `CRON_SECRET` | `sua-senha-secreta` | (Opcional) Senha para validar crons |

### **Gerar Chaves VAPID**

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Output:
```
Public Key:
BN7zKq4...

Private Key:
X9e2Wp...
```

---

## 🚀 Setup Passo a Passo

### **1. Estrutura de Pastas**

```
meu-projeto/
├── api/
│   ├── check-events-cron.js
│   ├── daily-notifications-cron.js
│   └── notify.js
├── supabase/
│   └── migrations/
│       ├── create_events_table.sql
│       ├── create_push_subscriptions_table.sql
│       ├── create_event_notifications_sent_table.sql
│       └── create_get_upcoming_events_rpc.sql
├── vercel.json
└── package.json
```

### **2. Instalar Dependências**

```bash
npm install @supabase/supabase-js web-push
```

### **3. Criar Tabelas no Supabase**

#### **3.1. Tabela de Eventos**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  opponent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_user_id ON events(user_id);
```

#### **3.2. Tabela de Push Subscriptions**
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

#### **3.3. Tabela de Cache**
```sql
-- (Ver seção 6 acima)
```

#### **3.4. Função RPC**
```sql
-- (Ver seção 5 acima)
```

### **4. Criar APIs na pasta `/api`**

Crie os 3 arquivos:
- `check-events-cron.js` (ver seção 2)
- `daily-notifications-cron.js` (ver seção 3)
- `notify.js` (ver seção 4)

### **5. Configurar vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/check-events-cron",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/daily-notifications-cron",
      "schedule": "0 10 * * *"
    }
  ]
}
```

### **6. Adicionar Variáveis de Ambiente na Vercel**

1. Acesse seu projeto na Vercel
2. Vá em **Settings → Environment Variables**
3. Adicione todas as variáveis listadas acima
4. Clique em **Save**

### **7. Deploy**

```bash
git add .
git commit -m "feat: add cron notifications system"
git push
```

A Vercel fará o deploy automático e ativará os cron jobs.

### **8. Verificar Logs**

Acesse **Vercel Dashboard → Functions** para ver os logs dos cron jobs em tempo real.

---

## 🔄 Como Replicar para Outro Projeto

### **Checklist Completo:**

- [ ] **1. Instalar dependências**
  ```bash
  npm install @supabase/supabase-js web-push
  ```

- [ ] **2. Gerar chaves VAPID**
  ```bash
  web-push generate-vapid-keys
  ```

- [ ] **3. Criar estrutura de pastas**
  - `/api` para serverless functions
  - `/supabase/migrations` para SQL

- [ ] **4. Criar tabelas no Supabase**
  - `events`
  - `push_subscriptions`
  - `event_notifications_sent`

- [ ] **5. Criar função RPC**
  - `get_upcoming_events()`

- [ ] **6. Criar APIs**
  - `api/check-events-cron.js`
  - `api/daily-notifications-cron.js`
  - `api/notify.js`

- [ ] **7. Configurar vercel.json**
  - Adicionar cron jobs

- [ ] **8. Adicionar variáveis de ambiente na Vercel**
  - `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VITE_VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `WEB_PUSH_CONTACT`

- [ ] **9. Fazer deploy**
  ```bash
  git push
  ```

- [ ] **10. Testar**
  - Verificar logs na Vercel
  - Criar um evento de teste
  - Aguardar notificação

---

## 🐛 Troubleshooting

### **Cron não está executando**
- ✅ Verifique se está no plano **Pro** da Vercel (cron jobs não funcionam no plano Hobby)
- ✅ Confirme que `vercel.json` está na raiz do projeto
- ✅ Veja os logs em **Vercel → Functions**

### **Notificações não estão chegando**
- ✅ Verifique se as variáveis VAPID estão corretas
- ✅ Confirme que o usuário tem subscription ativa em `push_subscriptions`
- ✅ Teste a API `/api/notify` manualmente via Postman

### **Erro 401 Unauthorized**
- ✅ Adicione `CRON_SECRET` nas variáveis de ambiente
- ✅ Configure o header `Authorization: Bearer <CRON_SECRET>`

### **Notificações duplicadas**
- ✅ Verifique se o cache `event_notifications_sent` está funcionando
- ✅ Confira a constraint `UNIQUE (event_id, notification_type)`

---

## 📊 Monitoramento

### **Logs Importantes:**
```javascript
console.log('🔍 Verificando eventos próximos...');
console.log(`✅ Eventos encontrados: ${events.length}`);
console.log(`📤 Notificações enviadas: ${sent}`);
console.log(`❌ Falhas: ${failed}`);
```

### **Métricas para Acompanhar:**
- Número de cron jobs executados
- Taxa de sucesso de notificações
- Subscriptions ativas vs expiradas
- Latência de envio

---

## 🎯 Próximos Passos (Melhorias)

1. **Dashboard de Monitoramento**: Interface para ver status dos crons
2. **Retry Logic**: Tentar reenviar notificações que falharam
3. **Rate Limiting**: Limitar número de notificações por usuário/dia
4. **A/B Testing**: Testar diferentes mensagens
5. **Analytics**: Rastrear taxa de cliques nas notificações
6. **Priorização**: Notificações urgentes vs não urgentes
7. **Quiet Hours**: Não enviar notificações à noite

---

## 📞 Suporte

Se tiver dúvidas, consulte:
- [Documentação Vercel Cron](https://vercel.com/docs/cron-jobs)
- [Web Push Protocol](https://web.dev/push-notifications/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Criado para YM Sports** | Última atualização: Fevereiro 2026
