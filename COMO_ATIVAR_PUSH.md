# 🔔 Como Ativar Push Notifications (App Fechado)

## ⚡ Guia Rápido - 5 Passos

### 📋 **Passo 1: Gerar VAPID Keys**

```bash
# Executar no terminal
npx web-push generate-vapid-keys
```

Você vai receber:
```
Public Key: BEl62iU...
Private Key: xxxxxxx... (GUARDAR EM SEGREDO!)
```

---

### 🔑 **Passo 2: Configurar as Keys**

**No código (`src/lib/webPush.ts`):**
```typescript
export const VAPID_PUBLIC_KEY = 'COLAR_SUA_PUBLIC_KEY_AQUI';
```

**No Supabase Dashboard:**
1. Ir em: Settings → Edge Functions → Secrets
2. Adicionar:
   - Nome: `VAPID_PRIVATE_KEY`
   - Valor: Sua Private Key
   
3. Adicionar:
   - Nome: `CRON_SECRET`  
   - Valor: `ym-sports-cron-2024` (ou qualquer secret)

---

### 🗄️ **Passo 3: Criar Tabela no Supabase**

1. Abrir Supabase Dashboard
2. Ir em: SQL Editor
3. Colar e executar o conteúdo de: `supabase/migrations/create_push_subscriptions.sql`

---

### 🚀 **Passo 4: Deploy das Edge Functions**

```bash
# Login no Supabase
supabase login

# Linkar projeto (pegar ref no dashboard)
supabase link --project-ref SEU_PROJECT_REF

# Deploy
supabase functions deploy send-push-notification
supabase functions deploy scheduled-notifications
```

---

### ⏰ **Passo 5: Configurar Cron Jobs**

#### **Opção A: GitHub Actions (Recomendado - Grátis)**

1. Criar arquivo: `.github/workflows/push-notifications.yml`

```yaml
name: Push Notifications

on:
  schedule:
    - cron: '0 10 * * *'   # 07:00 BRT (UTC-3)
    - cron: '30 11 * * *'  # 08:30 BRT
    - cron: '0 15 * * *'   # 12:00 BRT
    - cron: '30 18 * * *'  # 15:30 BRT
    - cron: '30 21 * * *'  # 18:30 BRT
    - cron: '0 23 * * *'   # 20:00 BRT

jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - name: Send Notification
        run: |
          curl -X POST \
            ${{ secrets.SUPABASE_URL }}/functions/v1/scheduled-notifications \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

2. Adicionar Secrets no GitHub:
   - Ir em: Repositório → Settings → Secrets → Actions
   - Adicionar:
     - `SUPABASE_URL`: `https://SEU_PROJECT.supabase.co`
     - `CRON_SECRET`: `ym-sports-cron-2024`

#### **Opção B: Cron-Job.org (Alternativa Grátis)**

1. Criar conta em: https://cron-job.org
2. Criar 6 cron jobs (um para cada horário):
   - URL: `https://SEU_PROJECT.supabase.co/functions/v1/scheduled-notifications`
   - Method: POST
   - Header: `Authorization: Bearer ym-sports-cron-2024`
   - Schedule: Configurar horário (7:00, 8:30, 12:00, 15:30, 18:30, 20:00)

---

## 🧪 **Testar o Sistema**

### **Teste 1: Via Interface do App**
1. Abrir app no celular
2. Ir em: **Configurações** → Notificações
3. Clicar: **"Solicitar Permissão"** (se necessário)
4. Clicar: **"🔔 Ativar Push Notifications"**
5. Ver status: **"✅ Inscrito"**

### **Teste 2: Enviar Notificação Manual**

```bash
# Substituir SEU_PROJECT e SUA_ANON_KEY
curl -X POST \
  https://SEU_PROJECT.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "all": true,
    "payload": {
      "title": "🧪 Teste Manual",
      "body": "Notificação de teste funcionando!"
    }
  }'
```

### **Teste 3: Com App Fechado**
1. Ativar Push Notifications no app
2. **FECHAR o app completamente**
3. Enviar teste manual (comando acima)
4. **Notificação deve chegar!** 🎉

---

## 📊 **Horários Programados**

- 🌅 **07:00** - Motivação Matinal
- 🏃 **08:30** - Treino Disponível  
- 🍽️ **12:00** - Hora do Almoço
- 🎯 **15:30** - Foco no Objetivo
- 🌙 **18:30** - Motivação Noturna
- 🏆 **20:00** - Ranking Atualizado

---

## 🔍 **Verificar se Está Funcionando**

### **Ver Logs das Functions:**
```bash
supabase functions logs send-push-notification
supabase functions logs scheduled-notifications
```

### **Ver Subscriptions no Banco:**
1. Supabase Dashboard → Table Editor
2. Tabela: `push_subscriptions`
3. Verificar se há registros

### **Ver Logs do Service Worker:**
1. Chrome → DevTools (F12)
2. Application → Service Workers
3. Clicar em "inspect"
4. Ver console

---

## ❓ **Problemas Comuns**

### **"Notificação não chega com app fechado"**
- ✅ Verificar se a subscription está salva no banco
- ✅ Verificar se o cron job está rodando
- ✅ Ver logs das Edge Functions
- ✅ Testar envio manual primeiro

### **"Erro 410 Gone"**
- A subscription expirou
- Usuário precisa ativar novamente no app

### **"Unauthorized"**
- Verificar se o `CRON_SECRET` está correto
- Verificar se está usando Bearer token

---

## 🎯 **Fluxo Completo**

```
1. Usuário ativa Push no app
   ↓
2. Subscription salva no banco
   ↓
3. Cron job roda no horário programado
   ↓
4. Edge Function scheduled-notifications é chamada
   ↓
5. Chama send-push-notification
   ↓
6. Busca subscriptions no banco
   ↓
7. Envia push para cada subscription
   ↓
8. Service Worker recebe o push
   ↓
9. Notificação aparece (mesmo com app fechado!)
```

---

## 🎉 **Resultado Esperado**

✅ Push notifications funcionam com app **COMPLETAMENTE FECHADO**  
✅ Sistema escalável para milhares de usuários  
✅ Custo **ZERO** (GitHub Actions ou cron-job.org grátis)  
✅ Seguro (VAPID authentication)  
✅ Confiável (retry e limpeza automática)  

---

## 📞 **Suporte**

Se tiver dúvidas, veja a documentação completa em:
`PUSH_NOTIFICATIONS_SETUP.md`

---

**🚀 Pronto! Agora as notificações vão funcionar com app fechado!**
