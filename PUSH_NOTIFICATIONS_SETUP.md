# 🔔 Setup de Push Notifications - YM Sports

## Sistema Completo de Notificações que Funciona com App Fechado

Este guia explica como configurar o sistema de Push Notifications para que as notificações cheguem mesmo quando o app está completamente fechado.

---

## 📋 Pré-requisitos

- Node.js instalado
- Supabase CLI instalado (`npm install -g supabase`)
- Projeto YM Sports configurado no Supabase

---

## 🔑 Passo 1: Gerar VAPID Keys

As VAPID keys são necessárias para autenticar as Push Notifications.

```bash
# Instalar web-push globalmente
npm install -g web-push

# Gerar as keys
npx web-push generate-vapid-keys
```

Você receberá algo assim:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvRuwNdsxmJsS9eX0x0lJOzMfSLI5MGVS7Ij0EBSQ8SnQGrGTgkJ4c
Private Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:**
- Guarde a Private Key em segredo!
- Não commite a Private Key no git!

---

## 🔧 Passo 2: Configurar as Keys

### No Frontend (`src/lib/webPush.ts`):
```typescript
export const VAPID_PUBLIC_KEY = 'SUA_PUBLIC_KEY_AQUI';
```

### No Supabase Edge Functions:

1. Vá no Supabase Dashboard → Settings → Edge Functions → Secrets
2. Adicione:
   - `VAPID_PRIVATE_KEY`: Sua private key
   - `CRON_SECRET`: Um secret aleatório para proteger o cron job (ex: `ym-sports-cron-2024`)

Ou via CLI:
```bash
supabase secrets set VAPID_PRIVATE_KEY="sua_private_key_aqui"
supabase secrets set CRON_SECRET="ym-sports-cron-2024"
```

### No arquivo Edge Function (`supabase/functions/send-push-notification/index.ts`):
```typescript
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
```

---

## 🗄️ Passo 3: Criar Tabela no Supabase

Execute a migration SQL no Supabase SQL Editor:

```bash
# Via Supabase CLI
supabase migration up

# Ou copie e cole o conteúdo de:
# supabase/migrations/create_push_subscriptions.sql
# no SQL Editor do Supabase Dashboard
```

Isso criará a tabela `push_subscriptions` com RLS policies.

---

## 🚀 Passo 4: Deploy das Edge Functions

```bash
# Login no Supabase
supabase login

# Link do projeto
supabase link --project-ref SEU_PROJECT_REF

# Deploy das functions
supabase functions deploy send-push-notification
supabase functions deploy scheduled-notifications
```

---

## ⏰ Passo 5: Configurar Cron Jobs

Para enviar notificações nos horários programados, você precisa de um cron job externo.

### Opção A: GitHub Actions (Recomendado - Grátis)

Crie `.github/workflows/scheduled-notifications.yml`:

```yaml
name: Scheduled Notifications

on:
  schedule:
    - cron: '0 7 * * *'   # 07:00 UTC
    - cron: '30 8 * * *'  # 08:30 UTC
    - cron: '0 12 * * *'  # 12:00 UTC
    - cron: '30 15 * * *' # 15:30 UTC
    - cron: '30 18 * * *' # 18:30 UTC
    - cron: '0 20 * * *'  # 20:00 UTC

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Call Scheduled Notifications
        run: |
          curl -X POST \
            ${{ secrets.SUPABASE_URL }}/functions/v1/scheduled-notifications \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Adicione os secrets no GitHub:**
- `SUPABASE_URL`: URL do seu projeto Supabase
- `CRON_SECRET`: O mesmo secret configurado no Supabase

### Opção B: Cron-Job.org (Grátis)

1. Vá em https://cron-job.org
2. Crie conta gratuita
3. Adicione um cron job para cada horário:
   - URL: `https://SEU_PROJECT.supabase.co/functions/v1/scheduled-notifications`
   - Method: POST
   - Headers: `Authorization: Bearer SEU_CRON_SECRET`
   - Schedule: Cada horário (7:00, 8:30, 12:00, 15:30, 18:30, 20:00)

### Opção C: Supabase Cron (Se disponível no seu plano)

```sql
select cron.schedule(
  'send-morning-notification',
  '0 7 * * *',
  $$
  select http_post(
    'https://SEU_PROJECT.supabase.co/functions/v1/scheduled-notifications',
    '{}',
    'application/json',
    ARRAY[http_header('Authorization', 'Bearer SEU_CRON_SECRET')]
  );
  $$
);
```

---

## 🧪 Passo 6: Testar o Sistema

### 1. Testar Subscription:
```javascript
// No console do navegador
const sub = await navigator.serviceWorker.ready
  .then(reg => reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'SUA_PUBLIC_KEY'
  }));
console.log(JSON.stringify(sub));
```

### 2. Testar Envio Manual (via Postman ou curl):
```bash
curl -X POST \
  https://SEU_PROJECT.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer SEU_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "all": true,
    "payload": {
      "title": "🧪 Teste",
      "body": "Notificação de teste!"
    }
  }'
```

### 3. Testar Notificação Agendada:
```bash
curl -X POST \
  https://SEU_PROJECT.supabase.co/functions/v1/scheduled-notifications \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

---

## 📱 Passo 7: Testar no App

1. Abra o app no celular
2. Vá em **Configurações** → **Notificações**
3. Clique em **"Solicitar Permissão"** (se necessário)
4. Clique em **"🔔 Ativar Push Notifications"**
5. Veja o status mudar para **"✅ Inscrito"**
6. **FECHE o app completamente**
7. Aguarde um horário programado ou envie um teste manual
8. **A notificação deve chegar mesmo com app fechado!** 🎉

---

## 🔍 Debug e Logs

### Ver logs das Edge Functions:
```bash
supabase functions logs send-push-notification
supabase functions logs scheduled-notifications
```

### Ver logs do Service Worker:
1. Abra Chrome DevTools
2. Application → Service Workers
3. Clique em "inspect"
4. Veja os logs no console

### Verificar subscriptions no banco:
```sql
SELECT * FROM push_subscriptions;
```

---

## 📊 Horários Programados

- 07:00 - 💪 Motivação Matinal
- 08:30 - 🏃‍♂️ Treino Disponível
- 12:00 - 🥗 Hora da Nutrição
- 15:30 - 🎯 Foco no Objetivo
- 18:30 - 🌟 Motivação Noturna
- 20:00 - 🏆 Ranking Atualizado

---

## 🆘 Troubleshooting

### Notificações não chegam com app fechado:
1. Verifique se o Service Worker está registrado
2. Verifique se a subscription foi salva no banco
3. Verifique os logs da Edge Function
4. Verifique se o cron job está rodando

### Erro 410 (Gone):
- A subscription expirou, será removida automaticamente
- O usuário precisa se inscrever novamente

### Erro de VAPID:
- Verifique se as keys estão corretas
- Verifique se a private key está no Supabase Secrets

---

## 🎯 Resultado Esperado

✅ Notificações chegam com app fechado  
✅ Sistema escalável (funciona para 1000+ usuários)  
✅ Seguro (VAPID authentication)  
✅ Confiável (retry automático, limpeza de subscriptions inválidas)  
✅ Custo zero (GitHub Actions ou cron-job.org grátis)  

---

## 📝 Próximos Passos

- [ ] Personalizar mensagens baseado no perfil do usuário
- [ ] Adicionar notificações para eventos específicos
- [ ] Dashboard de analytics de notificações
- [ ] A/B testing de mensagens
- [ ] Segmentação de usuários

---

**🎉 Sistema de Push Notifications Completo!**

Agora as notificações funcionam com o app completamente fechado! 🚀
