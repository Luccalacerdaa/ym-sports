# 🔧 Como Corrigir Erro "supabaseUrl is required"

## 🐛 Problema

O erro acontecia porque as variáveis de ambiente estavam sendo lidas **fora** da função `handler` no arquivo `daily-notifications-cron.js`.

Em Vercel Serverless Functions, as variáveis de ambiente só ficam disponíveis **dentro** da função handler.

## ✅ Solução Aplicada

**Antes** (❌ ERRADO):
```javascript
// Fora do handler - variáveis podem estar undefined
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // ... código aqui
}
```

**Depois** (✅ CORRETO):
```javascript
export default async function handler(req, res) {
  // Dentro do handler - variáveis sempre disponíveis
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // ... código aqui
}
```

---

## 🔍 Como Verificar suas Variáveis no Vercel

### 1️⃣ Abrir Settings

1. Acesse: https://vercel.com/seu-usuario/ym-sports
2. Clique em **Settings** (⚙️)
3. Clique em **Environment Variables**

### 2️⃣ Verificar se Todas Existem

Você DEVE ter estas 5 variáveis configuradas:

| Nome da Variável | Onde Encontrar | Exemplo |
|------------------|----------------|---------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role (secret) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Gerado via web-push CLI | `BHt7sBT...` |
| `VAPID_PRIVATE_KEY` | Gerado via web-push CLI | `abc123def...` |
| `WEB_PUSH_CONTACT` | Seu email | `mailto:seu-email@gmail.com` |

### 3️⃣ Garantir que Estão em Todos os Ambientes

**IMPORTANTE**: Cada variável deve estar marcada para:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

Se faltar algum, o Vercel Cron não conseguirá acessar!

---

## 🧪 Testar se Funcionou

### Opção 1: Via Vercel Dashboard (Logs)

1. Acesse: https://vercel.com/seu-usuario/ym-sports
2. Clique em **Deployments**
3. Clique no deployment mais recente
4. Clique em **Functions**
5. Procure por `/api/daily-notifications-cron`
6. Veja os logs:
   - ✅ **Sucesso**: `✅ PROCESSAMENTO CONCLUÍDO`
   - ❌ **Erro**: `❌ Variáveis de ambiente não configuradas`

### Opção 2: Via Curl (Manual)

```bash
curl https://ym-sports.vercel.app/api/daily-notifications-cron
```

**Resposta esperada** (se não houver notificação agendada):
```json
{
  "success": true,
  "message": "No notification scheduled for this time",
  "current_time_brt": "14:30",
  "schedule": ["07:00", "09:00", "11:30", "14:00", "17:00", "19:00", "21:00"]
}
```

**Resposta esperada** (se houver notificação agendada):
```json
{
  "success": true,
  "scheduled_time_brt": "14:00",
  "notification": {
    "title": "💧 Hidratação!",
    "body": "Não se esqueça de beber água!"
  },
  "stats": {
    "total_subscriptions": 1,
    "sent": 1,
    "failed": 0
  }
}
```

---

## 🚨 Se Ainda Não Funcionar

### 1. Verificar Logs Detalhados

No Vercel Dashboard, você verá algo como:

**✅ Sucesso**:
```
🔍 Verificando variáveis de ambiente:
   SUPABASE_URL: ✓ Configurada
   SUPABASE_SERVICE_ROLE_KEY: ✓ Configurada
   NEXT_PUBLIC_VAPID_PUBLIC_KEY: ✓ Configurada
   VAPID_PRIVATE_KEY: ✓ Configurada
   WEB_PUSH_CONTACT: ✓ Configurada
```

**❌ Erro**:
```
🔍 Verificando variáveis de ambiente:
   SUPABASE_URL: ✗ Faltando
   SUPABASE_SERVICE_ROLE_KEY: ✗ Faltando
```

### 2. Re-Deploy

Às vezes, após adicionar variáveis, é necessário fazer um novo deploy:

```bash
# Fazer um commit vazio para forçar re-deploy
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

### 3. Verificar Nome das Variáveis

**CUIDADO**: Os nomes devem ser EXATAMENTE iguais:

| ✅ Correto | ❌ Errado |
|-----------|----------|
| `SUPABASE_URL` | `SUPABASE_URL_` |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_KEY` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `VAPID_PUBLIC_KEY` |

### 4. Copiar Valores Sem Espaços

Ao copiar as chaves, certifique-se de não incluir:
- ❌ Espaços no início ou fim
- ❌ Quebras de linha
- ❌ Aspas extras

---

## 📊 Status do Sistema

Após a correção, o sistema agora:

### ✅ Notificações Diárias (Vercel Cron)
- **Endpoint**: `/api/daily-notifications-cron`
- **Frequência**: 7x por dia (07:00, 09:00, 11:30, 14:00, 17:00, 19:00, 21:00 BRT)
- **Configurado em**: `vercel.json` (crons)

### ✅ Notificações de Eventos (Vercel Cron)
- **Endpoint**: `/api/check-events-cron`
- **Frequência**: A cada 1 minuto
- **Configurado em**: `vercel.json` (crons)

### ✅ Debug Melhorado
- Agora mostra quais variáveis estão faltando
- Logs mais detalhados para facilitar diagnóstico
- Response JSON com informações sobre o erro

---

## 🎯 Próximos Passos

1. **Verifique as variáveis** no Vercel (Settings → Environment Variables)
2. **Aguarde o próximo horário** de notificação (ex: 17:00 BRT)
3. **Verifique os logs** no Vercel Dashboard
4. **Teste manual** via curl se necessário

---

## 📞 Suporte

Se continuar com problemas:

1. **Copie os logs** do Vercel Dashboard
2. **Verifique o horário** (logs mostram UTC e BRT)
3. **Confirme as variáveis** (nome exato e valor correto)

**Lembre-se**: O Vercel Cron roda automaticamente, você não precisa fazer nada manualmente!

---

## 🔗 Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Documentação Vercel Cron**: https://vercel.com/docs/cron-jobs
- **Documentação Web-Push**: https://www.npmjs.com/package/web-push

