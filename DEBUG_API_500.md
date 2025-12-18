# 🔍 Debug: Erro 500 nas APIs

## ✅ O que acabei de fazer:

Adicionei `api/package.json` para que o Vercel instale as dependências necessárias:
- `@supabase/supabase-js`
- `web-push`

---

## ⏱️ AGUARDE 2-3 MINUTOS

O Vercel está fazendo o deploy agora. **Aguarde até aparecer "Ready ✓"**.

---

## 🧪 Como Testar Após Deploy:

### **Teste 1: Verificar se API respondeu**

```bash
curl -v https://ym-sports.vercel.app/api/subscribe \
  -X OPTIONS \
  -H "Origin: https://ym-sports.vercel.app"
```

**✅ Deve retornar:**
```
< HTTP/2 200
< access-control-allow-origin: *
< access-control-allow-methods: POST, OPTIONS
```

**❌ Se retornar 500:** Continue para os próximos passos

---

### **Teste 2: Testar API de notificação**

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "45610e6d-f5f5-4540-912d-a5c9a361e20f",
    "title": "🧪 Teste",
    "body": "Testando API",
    "url": "/dashboard"
  }'
```

**✅ Deve retornar:**
```json
{
  "error": "Nenhuma subscription encontrada...",
  "sent": 0,
  "failed": 0,
  "total": 0
}
```
(Isso é normal se você ainda não ativou o push)

**❌ Se retornar erro sobre variáveis:**
```json
{
  "error": "Variáveis de ambiente não configuradas...",
  "configured": {
    "supabaseUrl": false,
    "supabaseKey": false,
    "vapidPublic": false,
    "vapidPrivate": false
  }
}
```

Significa que as variáveis não foram aplicadas. Continue para verificar no Vercel.

---

## 🔍 Verificar Logs do Vercel:

### **Passo 1: Acessar Logs**

1. Vá em: https://vercel.com/dashboard
2. Clique no projeto: **ym-sports**
3. Vá em: **Deployments** (topo)
4. Clique no deployment mais recente (primeiro da lista)
5. Aguarde até aparecer **"Ready ✓"**
6. Vá em: **Functions** (menu lateral)
7. Clique em uma das funções: `api/notify.js`
8. Vá em: **Logs** (aba)

### **Passo 2: Analisar Logs**

**✅ Logs corretos:**
```
📨 Enviando notificação para user: 45610e6d...
📱 Encontradas 0 subscriptions
```

**❌ Logs de erro:**
```
❌ VITE_SUPABASE_URL não configurado
❌ SUPABASE_SERVICE_ROLE_KEY não configurado
```

Ou:

```
Error: Cannot find module '@supabase/supabase-js'
Error: Cannot find module 'web-push'
```

---

## ✅ Solução 1: Variáveis Não Aplicadas

Se os logs mostram "não configurado":

1. **Vá em:** Settings → Environment Variables
2. **Verifique:** Se as 4 variáveis estão lá
3. **Importante:** Cada variável deve ter marcado:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Se alguma não está marcada:**
   - Clique na variável
   - Clique em "Edit"
   - Marque todas as 3 environments
   - Save
5. **Faça Redeploy:**
   - Deployments → último → ... → Redeploy

---

## ✅ Solução 2: Módulos Não Encontrados

Se os logs mostram "Cannot find module":

1. **Aguarde mais 2-3 minutos** (às vezes demora para instalar)
2. **Se continuar:**
   - Vá em: Deployments
   - Clique no último deploy
   - Vá em: **Build Logs** (aba)
   - Procure por erros de instalação

---

## ✅ Solução 3: Forçar Reinstalação

Se nada funcionar:

1. **Vá no seu terminal local:**

```bash
cd /Users/luccalacerda/Desktop/YMSPORTS/ym-sports/api
npm install
cd ..
git add api/package-lock.json
git commit -m "fix: adiciona package-lock.json da api"
git push origin main
```

2. **Aguarde o deploy**

---

## 🔑 Verificar Variáveis Novamente:

### **No Vercel:**

1. Settings → Environment Variables
2. **Devem estar assim:**

```
✅ VITE_SUPABASE_URL
   Value: https://qfnjgksvpjbuhzwuitzg.supabase.co
   Environments: Production, Preview, Development

✅ SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJI... (muito longa)
   Environments: Production, Preview, Development

✅ VITE_VAPID_PUBLIC_KEY
   Value: BAxvvbndAka...
   Environments: Production, Preview, Development

✅ VAPID_PRIVATE_KEY
   Value: 25fmmiJru1m...
   Environments: Production, Preview, Development
```

### **Se NÃO estiver assim:**

1. **Delete todas** (botão X em cada uma)
2. **Adicione novamente** do zero
3. **Certifique-se** de marcar os 3 environments
4. **Faça Redeploy**

---

## 🧪 Teste Final (Após Deploy Ready):

### **1. Limpar cache do navegador:**
```
Ctrl+Shift+Del
→ Limpar dados de navegação
→ Marcar: Cookies e Cache
→ Limpar
```

### **2. Recarregar app:**
```
Ctrl+Shift+R
```

### **3. Fazer login novamente**

### **4. Ir em Configurações:**
```
/dashboard/settings
```

### **5. Clicar em "Reativar Push"**

**✅ Deve aparecer:**
```
✅ Push reativado com sucesso!
```

**❌ Se ainda der erro:**
- Abra DevTools (F12)
- Vá em Console
- Copie TODOS os logs
- Me envie

### **6. Clicar em "Teste Rápido"**

**✅ Deve aparecer:**
```
✅ Teste enviado! (1 dispositivo(s))
```

E a notificação deve aparecer no sistema!

---

## 📊 Status das Correções:

✅ APIs convertidas para JavaScript  
✅ Validação de variáveis adicionada  
✅ `api/package.json` criado  
⏳ **Aguardando:** Deploy completar (2-3 min)  
⏳ **Depois:** Testar APIs  

---

## ⚠️ IMPORTANTE:

**Não** faça refresh antes de 2-3 minutos!

O Vercel precisa:
1. Fazer build (30s)
2. Instalar dependências do `api/package.json` (1min)
3. Fazer deploy das functions (30s)
4. Propagar para CDN (30s)

**Total: ~2-3 minutos**

---

## 📞 Se Ainda Não Funcionar:

Me envie:

1. **Screenshot** de: Vercel → Settings → Environment Variables
2. **Screenshot** de: Vercel → Último Deployment (mostrando "Ready ✓")
3. **Logs** de: Vercel → Functions → api/notify.js → Logs
4. **Logs** do navegador: DevTools → Console (após tentar ativar push)
5. **Resultado** do curl:
```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{"user_id":"45610e6d-f5f5-4540-912d-a5c9a361e20f","title":"teste","body":"teste","url":"/"}'
```

---

## ⏱️ Timeline:

```
00:00 - Deploy iniciado
00:30 - Build completado
01:30 - Dependências instaladas
02:00 - Functions deployed
02:30 - CDN atualizada
03:00 - ✅ Pronto para testar!
```

**Aguarde 3 minutos completos antes de testar!** ⏱️

---

**Última atualização:** Deploy em andamento...

