# 📜 Scripts de Notificações

Scripts utilitários para enviar notificações push do YM Sports.

---

## 📁 **Arquivos**

- `send-notification.sh` - Script Bash (Linux/Mac)
- `send-notification.py` - Script Python (multiplataforma)

---

## 🚀 **Uso Rápido**

### **Bash (Linux/Mac):**

```bash
# Dar permissão de execução (primeira vez)
chmod +x send-notification.sh

# Enviar notificação de treino
./send-notification.sh SEU_USER_ID workout

# Enviar teste
./send-notification.sh SEU_USER_ID test
```

### **Python (qualquer sistema):**

```bash
# Instalar dependências
pip install requests

# Enviar notificação de treino
python send-notification.py SEU_USER_ID workout

# Enviar teste
python send-notification.py SEU_USER_ID test
```

---

## 📋 **Tipos de Notificação**

| Tipo | Título | URL |
|------|--------|-----|
| `morning` | 💪 Bom dia, atleta! | /dashboard |
| `workout` | 🏋️ Hora do Treino! | /dashboard/training |
| `hydration` | 💧 Hidratação | /dashboard/nutrition |
| `evening` | 🌙 Boa Noite! | /dashboard/motivational |
| `test` | 🧪 Teste | /dashboard |
| `custom` | Personalizado | Personalizado |

---

## 🎨 **Exemplos Avançados**

### **Bash - Notificação personalizada:**

```bash
TITLE="🎉 Parabéns" \
BODY="Você completou 100 treinos!" \
URL="/dashboard/achievements" \
./send-notification.sh SEU_USER_ID custom
```

### **Python - Notificação personalizada:**

```bash
python send-notification.py SEU_USER_ID custom \
  --title "🎉 Parabéns" \
  --body "Você completou 100 treinos!" \
  --url "/dashboard/achievements"
```

---

## 🔧 **Encontrar seu User ID**

### **Opção 1: Console do navegador (F12)**

```javascript
// No app, execute:
localStorage.getItem('supabase.auth.token')
// Procure por "user" → "id"
```

### **Opção 2: Página de Configurações**

1. Acesse `/dashboard/settings`
2. Role até "Informações da Conta"
3. Copie o User ID

### **Opção 3: URL do navegador**

Após fazer login, o User ID aparece nos logs do console.

---

## ⏰ **Agendamento (Cron)**

### **Linux/Mac - crontab:**

```bash
# Editar crontab
crontab -e

# Adicionar notificações
0 7 * * * /caminho/send-notification.sh USER_ID morning
0 17 * * * /caminho/send-notification.sh USER_ID workout
0 21 * * * /caminho/send-notification.sh USER_ID evening
```

### **Windows - Task Scheduler:**

1. Abrir "Task Scheduler"
2. Create Task
3. Triggers: Daily at 17:00
4. Actions: Start a program
   - Program: `python`
   - Arguments: `C:\path\to\send-notification.py USER_ID workout`

---

## 🐛 **Troubleshooting**

### **Erro: Permission denied (Bash)**

```bash
chmod +x send-notification.sh
```

### **Erro: command not found (Python)**

```bash
# Instalar Python
brew install python3  # Mac
apt install python3   # Linux

# Ou usar python3 explicitamente
python3 send-notification.py USER_ID test
```

### **Erro: requests module not found**

```bash
pip install requests
# ou
pip3 install requests
```

### **Erro: 404 Not Found**

- Verifique se a API está no ar: https://ym-sports.vercel.app/api/notify
- Pode ser que o Vercel esteja fazendo deploy

### **Enviadas: 0**

- Usuário não tem push subscription ativa
- Precisa ativar notificações no app (Configurações)

---

## 📚 **Documentação Completa**

Veja: `NOTIFICACOES_AUTOMATICAS_API.md` na raiz do projeto.

---

## 🎯 **Teste Rápido**

```bash
# Bash
./send-notification.sh SEU_USER_ID test

# Python
python send-notification.py SEU_USER_ID test
```

Se funcionar, você verá:
```
✅ Notificação enviada com sucesso!
✅ Enviadas: 3
📱 Total de dispositivos: 3
```

E a notificação deve chegar no seu dispositivo! 🎉

