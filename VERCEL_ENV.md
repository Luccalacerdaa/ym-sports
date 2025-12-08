# ⚙️ Configurar Variáveis de Ambiente na Vercel

## 🎯 Você precisa adicionar estas variáveis na Vercel:

### **Como Configurar:**

1. Ir em: https://vercel.com/luccalacerdaa/ym-sports/settings/environment-variables
2. Adicionar cada variável abaixo:

---

## 📋 **Variáveis Necessárias:**

### **1. Supabase:**

```bash
NEXT_PUBLIC_SUPABASE_URL
Valor: https://qfnjgksvpjbuhzwuitzg.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmpna3N2cGpidWh6d3VpdHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxODQ5NjYsImV4cCI6MjA3NDc2MDk2Nn0.ZW-a1HlOCgzM1QwNW3o55Ik83Cve_ClfT7hJbKEus_0

SUPABASE_SERVICE_ROLE_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmpna3N2cGpidWh6d3VpdHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE4NDk2NiwiZXhwIjoyMDc0NzYwOTY2fQ.nHoQhumIrKzP2nhVFUP0jhqunyRJfUUhpjDBR_htpU4
```

### **2. Push Notifications:**

```bash
VAPID_PRIVATE_KEY
Valor: V6oYbeMc7mPO4f7nGc_KnK9DhxoIU0Seeoj7g1qeDy0

CRON_SECRET
Valor: ym-sports-cron-2024
```

---

## ✅ **Depois de Configurar:**

1. Fazer redeploy na Vercel
2. Testar o endpoint novamente
3. Push notifications vão funcionar!

---

## 🧪 **Testar:**

```bash
curl -X POST https://ym-sports.vercel.app/api/send-push \
  -H "Content-Type: application/json" \
  -d '{"all":true,"payload":{"title":"🧪 Teste","body":"Funcionou!"},"secret":"ym-sports-cron-2024"}'
```
