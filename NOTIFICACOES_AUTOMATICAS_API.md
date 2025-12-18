# 🚀 Sistema de Notificações Automáticas via API

## 📋 **Visão Geral**

Sistema completo de notificações que **funciona com o app fechado**, usando:
- ✅ **GitHub Actions** (agendamento automático)
- ✅ **API `/api/notify`** (envio via curl)
- ✅ **Push Notifications** (notificações reais)
- ✅ **Scripts** (testes e uso manual)

---

## 🎯 **Por que usar API em vez de Service Worker?**

| Aspecto | Service Worker | API (curl) |
|---------|---------------|------------|
| **App fechado** | ⚠️ Pode parar após horas | ✅ Sempre funciona |
| **Confiabilidade** | ⚠️ Depende do navegador | ✅ 100% confiável |
| **Agendamento** | ⚠️ Só com app aberto | ✅ Automático (GitHub Actions) |
| **Controle** | ⚠️ Limitado | ✅ Total |
| **Debugging** | ⚠️ Difícil | ✅ Fácil (logs) |

**Conclusão:** API é muito mais confiável! 🎉

---

## 📅 **1. Notificações Diárias Automáticas**

### **Cronograma:**

```
07:00 - 💪 Bom dia, atleta!
09:00 - 💧 Hidratação
11:30 - 🏋️ Hora do Treino!
14:00 - 💧 Hidratação
17:00 - 🏃‍♂️ Treino da Tarde!  ⭐
19:00 - 💧 Última Hidratação
21:00 - 🌙 Boa Noite!
```

### **Como funciona:**

1. **GitHub Actions** roda automaticamente nos horários
2. Busca **todos os usuários** do Supabase
3. Envia notificação para cada usuário via `/api/notify`
4. Notificações chegam **mesmo com app fechado**! 🎉

### **Arquivo:** `.github/workflows/daily-notifications.yml`

---

## 📆 **2. Notificações de Eventos (Calendário)**

### **Como funciona:**

1. **GitHub Actions** verifica **a cada 5 minutos**
2. Busca eventos que começam nos próximos 30 minutos
3. Envia notificação automática:
   - 🚨 **5-15 min**: "Faltam apenas X minutos!"
   - ⚠️ **15-30 min**: "Começa em X minutos"
4. Inclui localização se disponível

### **Arquivo:** `.github/workflows/calendar-notifications.yml`

---

## 🛠️ **3. Script Manual (Linux/Mac)**

### **Uso:**

```bash
# Notificação de treino
./scripts/send-notification.sh 45610e6d-f5f5-4540-912d-a5c9a361e20f workout

# Notificação de teste
./scripts/send-notification.sh SEU_USER_ID test

# Notificação personalizada
TITLE="🎉 Parabéns" BODY="Você é incrível!" URL="/dashboard" \
./scripts/send-notification.sh SEU_USER_ID custom
```

### **Tipos disponíveis:**
- `morning` - Bom dia
- `workout` - Treino
- `hydration` - Hidratação
- `evening` - Boa noite
- `test` - Teste
- `custom` - Personalizado

---

## 🌐 **4. Curl Direto (qualquer sistema)**

### **Exemplo básico:**

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID",
    "title": "🏃‍♂️ Treino da Tarde!",
    "body": "Que tal um treino agora? Você consegue!",
    "url": "/dashboard/training"
  }'
```

### **Resposta de sucesso:**

```json
{
  "success": true,
  "sent": 3,
  "failed": 0,
  "total": 3,
  "details": [
    { "endpoint": "https://fcm...", "success": true },
    { "endpoint": "https://fcm...", "success": true },
    { "endpoint": "https://fcm...", "success": true }
  ]
}
```

---

## ⚙️ **5. Configuração do GitHub Actions**

### **Secrets necessários no GitHub:**

1. Vá em: **Settings** → **Secrets and variables** → **Actions**
2. Adicione:

```
SUPABASE_URL=https://qfnjgksvpjbuhzwuitzg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### **Como testar:**

1. GitHub → **Actions**
2. Selecione workflow: "Notificações Diárias Automáticas"
3. Clique em **Run workflow**
4. Escolha o tipo: `test`
5. Run! 🚀

---

## 🐍 **6. Script Python (alternativa)**

```python
#!/usr/bin/env python3
import requests
import json

def send_notification(user_id, title, body, url="/dashboard"):
    """Envia notificação via API"""
    
    api_url = "https://ym-sports.vercel.app/api/notify"
    
    payload = {
        "user_id": user_id,
        "title": title,
        "body": body,
        "url": url
    }
    
    response = requests.post(api_url, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Enviadas: {result['sent']}/{result['total']}")
        return True
    else:
        print(f"❌ Erro: {response.text}")
        return False

# Exemplo de uso
if __name__ == "__main__":
    send_notification(
        user_id="45610e6d-f5f5-4540-912d-a5c9a361e20f",
        title="🏃‍♂️ Treino da Tarde!",
        body="Que tal um treino agora?",
        url="/dashboard/training"
    )
```

---

## 🕐 **7. Cron Job Local (Linux/Mac)**

Para rodar no seu próprio servidor:

```bash
# Editar crontab
crontab -e

# Adicionar (exemplo: 17h = treino)
0 17 * * * /caminho/para/send-notification.sh SEU_USER_ID workout

# Verificar cron
crontab -l
```

### **Exemplos de cron:**

```bash
# 07:00 - Bom dia
0 7 * * * /caminho/send-notification.sh USER_ID morning

# 17:00 - Treino
0 17 * * * /caminho/send-notification.sh USER_ID workout

# 21:00 - Boa noite
0 21 * * * /caminho/send-notification.sh USER_ID evening
```

---

## 📊 **8. Logs e Monitoramento**

### **Ver logs do GitHub Actions:**

1. GitHub → **Actions**
2. Clique na execução
3. Ver logs completos

### **Exemplo de log:**

```
🚀 Enviando notificações...
📋 Tipo: workout
📝 Título: 🏃‍♂️ Treino da Tarde!
📤 Enviando para usuário: 45610e6d-f5f5-4540...
✅ Resposta: {"success":true,"sent":3,"total":3}
🎉 Notificações enviadas com sucesso!
```

---

## 🔧 **9. Troubleshooting**

### **❌ Erro: 404**
- Problema: API não existe ou deploy falhou
- Solução: Verificar Vercel, fazer redeploy

### **❌ Erro: 500**
- Problema: Variáveis de ambiente faltando
- Solução: Verificar VAPID keys no Vercel

### **❌ Enviadas: 0**
- Problema: Usuário não tem push subscription
- Solução: Usuário precisa ativar push no app

### **❌ GitHub Actions não roda**
- Problema: Secrets não configurados
- Solução: Adicionar SUPABASE_URL e SUPABASE_ANON_KEY

---

## 🎯 **10. Testes Rápidos**

### **Teste 1: Envio manual via curl**

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID",
    "title": "🧪 Teste",
    "body": "Teste manual funcionando!",
    "url": "/dashboard"
  }'
```

### **Teste 2: GitHub Actions manual**

1. GitHub → Actions → "Notificações Diárias Automáticas"
2. Run workflow → Tipo: `test`
3. Aguardar resultado

### **Teste 3: Script local**

```bash
./scripts/send-notification.sh SEU_USER_ID test
```

---

## 📱 **11. Integração com Eventos**

### **Criar evento que notifica automaticamente:**

1. Usuário cria evento no calendário
2. GitHub Actions verifica a cada 5 minutos
3. Se evento está próximo (30 min), envia notificação
4. Notificação chega mesmo com app fechado!

### **Tipos de notificação de eventos:**

- **30 min antes**: "📅 Evento começa em 25 minutos"
- **15 min antes**: "⚠️ Evento começa em 12 minutos"
- **5 min antes**: "🚨 Faltam apenas 3 minutos!"

---

## 🌟 **12. Vantagens do Sistema**

✅ **100% confiável** - Não depende do navegador
✅ **Funciona com app fechado** - GitHub Actions sempre roda
✅ **Fácil de testar** - Curl, script, manual
✅ **Fácil de debugar** - Logs completos
✅ **Escalável** - Envia para todos os usuários
✅ **Flexível** - Adicione novos horários facilmente
✅ **Gratuito** - GitHub Actions tem limite generoso

---

## 📚 **13. Próximos Passos**

1. ✅ Configurar secrets no GitHub
2. ✅ Testar workflows manualmente
3. ✅ Aguardar horários programados
4. ✅ Monitorar logs
5. ✅ Adicionar mais notificações conforme necessário

---

## 💡 **14. Dicas**

1. **Testar primeiro com `test`** antes de ativar tudo
2. **Usar execução manual** para validar
3. **Verificar logs** regularmente
4. **Ajustar horários** conforme necessário (UTC!)
5. **Criar novos workflows** para eventos específicos

---

## 🎉 **Conclusão**

Agora você tem um sistema **profissional e confiável** de notificações que:

- ✅ Funciona 24/7 automaticamente
- ✅ Não depende do app estar aberto
- ✅ É fácil de manter e expandir
- ✅ Tem logs completos para debug
- ✅ Pode ser testado a qualquer momento

**Notificações chegam sempre, mesmo com app fechado!** 🚀

