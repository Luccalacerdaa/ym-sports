# 🚨 CONFIGURAR VARIÁVEIS NO VERCEL (URGENTE)

## ❌ Erro Atual:

```
A server error...
500 Internal Server Error
```

**Causa:** As variáveis de ambiente não estão configuradas no Vercel.

---

## ✅ SOLUÇÃO (5 minutos):

### **Passo 1: Acessar Vercel Dashboard**

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto: **ym-sports**
3. Vá em: **Settings** (topo da página)
4. No menu lateral, clique: **Environment Variables**

---

### **Passo 2: Adicionar as Variáveis**

Cole **EXATAMENTE** estas 4 variáveis (uma por vez):

#### **Variável 1: VITE_SUPABASE_URL**
```
Name: VITE_SUPABASE_URL
Value: https://qfnjgksvpjbuhzwuitzg.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variável 2: SUPABASE_SERVICE_ROLE_KEY**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [COPIE DA SEÇÃO ABAIXO]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Para pegar a Service Role Key:**
1. Vá em: https://supabase.com/dashboard
2. Abra seu projeto YM Sports
3. **Settings** → **API**
4. Role até "Project API keys"
5. Copie a chave **"service_role"** (ícone de olho para revelar)
6. Cole no Value do Vercel

#### **Variável 3: VITE_VAPID_PUBLIC_KEY**
```
Name: VITE_VAPID_PUBLIC_KEY
Value: BAxvvbndAkaHknNyBNnasTr8vaZVEc4L7sAsKJfgs3WLwrexg-2ZnU2p0GDCTq1StREN_GJfxRsbtDEs_PuY5xs
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variável 4: VAPID_PRIVATE_KEY**
```
Name: VAPID_PRIVATE_KEY
Value: 25fmmiJru1mrLBrpWMvcAq0F5PUssDxMi_m0ZfTC2z0
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### **Passo 3: Adicionar Variável no Vercel (Visual)**

Para cada variável:

1. Clique em **"Add New"** ou **"Add Variable"**
2. **Name:** Cole o nome (ex: `VITE_SUPABASE_URL`)
3. **Value:** Cole o valor
4. **Environments:** Marque TODAS as 3 opções:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Clique **"Save"**
6. Repita para as outras 3 variáveis

---

### **Passo 4: Redeploy (IMPORTANTE!)**

Após adicionar TODAS as 4 variáveis:

1. Vá em: **Deployments** (topo da página)
2. Clique no deployment mais recente (primeiro da lista)
3. Clique nos 3 pontinhos **"..."** no canto superior direito
4. Clique **"Redeploy"**
5. Confirme: **"Redeploy"**
6. **Aguarde 2-3 minutos** até aparecer **"Ready ✓"**

---

## 🔍 Como Obter a Service Role Key do Supabase:

### **Método Rápido:**

1. **Acesse:** https://supabase.com/dashboard/project/qfnjgksvpjbuhzwuitzg/settings/api
   - (Já abre direto na página de API)

2. **Procure:** "Project API keys"

3. **Encontre:** A seção "service_role"
   - Aparece: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (muito longa)

4. **Clique no ícone de olho** 👁️ para revelar

5. **Clique em "Copy"** para copiar

6. **Cole no Vercel** na variável `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Checklist de Configuração:

- [ ] Abri o Vercel Dashboard
- [ ] Entrei em Settings → Environment Variables
- [ ] Adicionei `VITE_SUPABASE_URL`
- [ ] Adicionei `SUPABASE_SERVICE_ROLE_KEY` (do Supabase)
- [ ] Adicionei `VITE_VAPID_PUBLIC_KEY`
- [ ] Adicionei `VAPID_PRIVATE_KEY`
- [ ] Marquei todas as 3 environments para cada variável
- [ ] Fiz Redeploy
- [ ] Aguardei 2-3 minutos
- [ ] Deploy apareceu como "Ready ✓"

---

## 🧪 Testar Após Configurar:

### **Teste 1: Via curl**

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "45610e6d-f5f5-4540-912d-a5c9a361e20f",
    "title": "🎉 Teste",
    "body": "Funcionou!",
    "url": "/dashboard"
  }'
```

**✅ Resposta esperada (se tiver subscription):**
```json
{"success":true,"sent":1,"failed":0,"total":1}
```

**⚠️ Resposta esperada (se não tiver subscription):**
```json
{"error":"Nenhuma subscription encontrada...","sent":0,"failed":0,"total":0}
```

**❌ Se ainda der erro:**
- Aguarde mais 1-2 minutos
- Faça outro Redeploy
- Verifique se copiou as variáveis corretamente

---

### **Teste 2: Via Interface**

1. **Recarregue o app:** `Ctrl+Shift+R`
2. **Vá para:** `/dashboard/settings`
3. **Clique:** "🔄 Reativar Push"
4. **Deve aparecer:** "✅ Push reativado com sucesso!"
5. **Clique:** "Teste Rápido"
6. **Notificação deve aparecer!**

---

## ⚠️ IMPORTANTE:

### **NÃO PULE O REDEPLOY!**

Adicionar variáveis **NÃO** atualiza automaticamente o app em produção.

Você **PRECISA** fazer Redeploy para que as variáveis sejam aplicadas!

---

## 🔍 Verificar se Variáveis Foram Aplicadas:

Após o Redeploy, teste se as variáveis estão funcionando:

```bash
curl https://ym-sports.vercel.app/api/subscribe \
  -X OPTIONS \
  -H "Origin: https://ym-sports.vercel.app"
```

**✅ Deve retornar:** `200 OK` (mesmo sem dados)

**❌ Se retornar 500:** Variáveis ainda não foram aplicadas, aguarde mais ou faça outro Redeploy

---

## 📞 Ainda com Erro 500?

### **Verificar:**

1. **Variáveis estão salvas?**
   - Vá em Settings → Environment Variables
   - Todas as 4 devem estar listadas

2. **Marcou todas as environments?**
   - Cada variável deve ter: Production, Preview, Development

3. **Fez Redeploy?**
   - Deployments → último deploy → ... → Redeploy

4. **Aguardou 2-3 minutos?**
   - Deploy pode demorar

5. **Service Role Key está correta?**
   - Deve começar com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
   - Deve ter +500 caracteres

---

## 🎯 Resumo do Fluxo:

```
1. Adicionar 4 variáveis no Vercel
   ↓
2. Fazer Redeploy
   ↓
3. Aguardar "Ready ✓"
   ↓
4. Recarregar app (Ctrl+Shift+R)
   ↓
5. Reativar Push
   ↓
6. Testar notificação
   ↓
7. ✅ Funciona!
```

---

## 📸 Screenshots Úteis:

### **Onde adicionar variáveis:**
1. Vercel Dashboard → Seu Projeto
2. Settings (topo)
3. Environment Variables (menu lateral)
4. Botão "Add New" ou "Add Variable"

### **Como fica após adicionar:**
```
Name                          | Value                    | Environments
-----------------------------|--------------------------|-------------
VITE_SUPABASE_URL           | https://qfnjg...         | Prod, Prev, Dev
SUPABASE_SERVICE_ROLE_KEY   | eyJhbGciOiJI...         | Prod, Prev, Dev
VITE_VAPID_PUBLIC_KEY       | BAxvvbndAka...          | Prod, Prev, Dev
VAPID_PRIVATE_KEY           | 25fmmiJru1m...          | Prod, Prev, Dev
```

---

## ⏱️ Tempo Estimado:

- ⏱️ Adicionar variáveis: **2 minutos**
- ⏱️ Redeploy: **2-3 minutos**
- ⏱️ Testar: **1 minuto**
- **Total: ~6 minutos** ✅

---

## 🚀 Após Configurar:

As notificações funcionarão:
- ✅ Via curl (terminal)
- ✅ Via interface (Teste Rápido)
- ✅ Via Central de Notificações
- ✅ Automaticamente (eventos, achievements)
- ✅ Com app fechado (push notifications)

---

**Configure agora e em 6 minutos estará tudo funcionando! 🎯**

