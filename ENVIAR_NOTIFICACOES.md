# 📢 Como Enviar Notificações Push

## 🌐 Via Interface Web

Acesse a **Central de Notificações** em:
```
https://ym-sports.vercel.app/dashboard/notification-test
```

Ou clique em **"Central de Testes"** na página de Configurações.

---

## 💻 Via Terminal (curl)

### Comando Básico

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID_AQUI",
    "title": "🎉 YM Sports",
    "body": "Sua mensagem aqui!",
    "url": "/dashboard"
  }'
```

### Como Obter o User ID

1. Faça login no app
2. Vá em **Configurações** ou **Central de Notificações**
3. Copie o User ID exibido na seção "Status do Sistema"

---

## 📋 Exemplos Práticos

### 1. Lembrete de Treino

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "45610e6d-f5f5-4540-912d-a5c9a361e20f",
    "title": "⚽ Lembrete de Treino",
    "body": "Seu treino começa em 30 minutos!",
    "url": "/dashboard/calendar"
  }'
```

### 2. Conquista Desbloqueada

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "45610e6d-f5f5-4540-912d-a5c9a361e20f",
    "title": "🏆 Nova Conquista!",
    "body": "Você desbloqueou: Dedicação - 7 dias consecutivos",
    "url": "/dashboard/profile"
  }'
```

### 3. Level Up

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "45610e6d-f5f5-4540-912d-a5c9a361e20f",
    "title": "📈 Você subiu de nível!",
    "body": "Parabéns! Agora você é nível 25",
    "url": "/dashboard/profile"
  }'
```

### 4. Lembrete de Hidratação

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "45610e6d-f5f5-4540-912d-a5c9a361e20f",
    "title": "💧 Hora de se hidratar!",
    "body": "Beba água para manter o desempenho",
    "url": "/dashboard/nutrition"
  }'
```

### 5. Evento Próximo (30 min antes)

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "45610e6d-f5f5-4540-912d-a5c9a361e20f",
    "title": "📅 Evento em 30 minutos",
    "body": "Preparação Física - Treino de Resistência",
    "url": "/dashboard/calendar"
  }'
```

---

## 🔍 Resposta da API

### Sucesso

```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "total": 2
}
```

- **sent**: Número de notificações enviadas com sucesso
- **failed**: Número de falhas
- **total**: Total de dispositivos cadastrados

### Erro

```json
{
  "error": "No subscriptions found"
}
```

Possíveis erros:
- `user_id and title required`: Faltam parâmetros obrigatórios
- `No subscriptions found`: Usuário não tem dispositivos cadastrados
- `Method not allowed`: Use apenas POST

---

## 🛠️ Script Automatizado (Bash)

Crie um arquivo `send-notification.sh`:

```bash
#!/bin/bash

USER_ID="45610e6d-f5f5-4540-912d-a5c9a361e20f"
TITLE="$1"
BODY="$2"
URL="${3:-/dashboard}"

if [ -z "$TITLE" ]; then
  echo "❌ Uso: ./send-notification.sh \"Título\" \"Mensagem\" [url]"
  exit 1
fi

curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"title\": \"$TITLE\",
    \"body\": \"$BODY\",
    \"url\": \"$URL\"
  }"

echo ""
```

**Uso:**

```bash
chmod +x send-notification.sh
./send-notification.sh "🎉 Teste" "Mensagem de teste!" "/dashboard/profile"
```

---

## 🐍 Script Python

Crie `send_notification.py`:

```python
#!/usr/bin/env python3
import requests
import sys
import json

def send_notification(user_id, title, body, url="/dashboard"):
    response = requests.post(
        "https://ym-sports.vercel.app/api/notify",
        headers={"Content-Type": "application/json"},
        json={
            "user_id": user_id,
            "title": title,
            "body": body,
            "url": url
        }
    )
    
    result = response.json()
    
    if response.ok and result.get("success"):
        print(f"✅ Enviado para {result['sent']}/{result['total']} dispositivo(s)")
    else:
        print(f"❌ Erro: {result.get('error', 'Desconhecido')}")
    
    return response.ok

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("❌ Uso: python3 send_notification.py USER_ID \"Título\" \"Mensagem\" [url]")
        sys.exit(1)
    
    user_id = sys.argv[1]
    title = sys.argv[2]
    body = sys.argv[3]
    url = sys.argv[4] if len(sys.argv) > 4 else "/dashboard"
    
    send_notification(user_id, title, body, url)
```

**Uso:**

```bash
python3 send_notification.py "USER_ID" "🎉 Teste" "Mensagem!" "/dashboard"
```

---

## ⚙️ Integração com Cron (Notificações Agendadas)

### Lembrete de Treino Diário (7h da manhã)

```bash
crontab -e
```

Adicione:

```cron
0 7 * * * curl -X POST https://ym-sports.vercel.app/api/notify -H "Content-Type: application/json" -d '{"user_id":"SEU_USER_ID","title":"⚽ Bom dia!","body":"Hora de treinar e conquistar seus objetivos!","url":"/dashboard/training"}'
```

### Lembrete de Hidratação (a cada 2 horas, 8h às 20h)

```cron
0 8,10,12,14,16,18,20 * * * curl -X POST https://ym-sports.vercel.app/api/notify -H "Content-Type: application/json" -d '{"user_id":"SEU_USER_ID","title":"💧 Hidratação","body":"Beba água!","url":"/dashboard/nutrition"}'
```

---

## 📱 Requisitos

Para receber notificações, o usuário deve:

1. ✅ Ter **permitido notificações** no navegador
2. ✅ Ter **ativado Push Notifications** nas Configurações do app
3. ✅ Ter o **Service Worker** registrado (automático após login)

---

## 🔧 Troubleshooting

### Notificação não chega?

1. **Verifique o status nas Configurações:**
   - Permissão: deve estar "✅ Concedida"
   - Push Subscription: deve estar "✅ Ativa"

2. **Teste na Central de Notificações:**
   - Use o "Teste Rápido" para verificar se funciona

3. **Verifique o User ID:**
   - Copie o ID correto da interface

4. **Logs no Terminal:**
   - Adicione `-v` ao curl para ver detalhes:
   ```bash
   curl -v -X POST https://ym-sports.vercel.app/api/notify ...
   ```

5. **Service Worker:**
   - Abra DevTools → Application → Service Workers
   - Verifique se há um SW ativo

---

## 🎯 Quando Usar Cada Tipo

| Tipo | Quando Usar | URL Recomendada |
|------|-------------|-----------------|
| 🏋️ Treino | 30 min antes do treino | `/dashboard/calendar` |
| 🏆 Conquista | Ao desbloquear achievement | `/dashboard/profile` |
| 📈 Level Up | Ao subir de nível | `/dashboard/profile` |
| 💧 Hidratação | A cada 2-3 horas | `/dashboard/nutrition` |
| 📅 Evento | 30 min e 10 min antes | `/dashboard/calendar` |
| 🎯 Motivação | Manhã (7h) ou noite (20h) | `/dashboard/motivational` |

---

## 📊 Boas Práticas

1. **Use Emojis**: Tornam as notificações mais atrativas 🎉
2. **Seja Breve**: Título curto, mensagem objetiva
3. **URL Relevante**: Direcione para a página correta
4. **Timing**: Envie no momento certo (não no meio da madrugada!)
5. **Frequência**: Não spam! Máximo 3-4 notificações por dia

---

## 🔒 Segurança

- A API valida o `user_id` no banco de dados
- Subscriptions inválidas são automaticamente removidas
- Use HTTPS sempre
- Não compartilhe User IDs publicamente

---

## 📞 Suporte

Problemas? Entre em contato:
- 📧 Email: suporte@ymsports.com
- 💬 WhatsApp: (11) 99999-9999
- 🌐 Site: https://ym-sports.vercel.app

---

**Desenvolvido com ❤️ por YM Sports** 🚀

