# ⚡ Guia Rápido: Configurar Secrets (2 minutos)

## 🎯 **Objetivo:**
Configurar os 2 secrets necessários para o GitHub Actions funcionar.

---

## 📝 **Passo a Passo:**

### **1. Acessar GitHub**
```
https://github.com/Luccalacerdaa/ym-sports
```

### **2. Clicar em Settings**
- Ícone de engrenagem no topo da página
- Ou URL direto: `https://github.com/Luccalacerdaa/ym-sports/settings`

### **3. Navegar para Secrets**
- Menu lateral esquerdo
- Clique em: **Secrets and variables**
- Depois clique em: **Actions**

### **4. Adicionar SECRET 1**

Clique em: **New repository secret** (botão verde)

**Preencher:**
```
Name: SUPABASE_URL
```
(Copie EXATAMENTE, sem espaços)

**Value:**
```
https://qfnjgksvpjbuhzwuitzg.supabase.co
```
(Copie EXATAMENTE, a linha inteira)

Clique em: **Add secret** (botão verde)

✅ Você verá: `SUPABASE_URL` na lista

---

### **5. Adicionar SECRET 2**

Clique em: **New repository secret** novamente

**Preencher:**
```
Name: SUPABASE_ANON_KEY
```
(Copie EXATAMENTE, sem espaços)

**Value:** (COPIE A LINHA INTEIRA ABAIXO)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmpna3N2cGpidWh6d3VpdHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNzE0NzAsImV4cCI6MjA0NTY0NzQ3MH0.ZW-a1HlOCgzM1QwNW3o55Ik83Cve_ClfT7hJbKEus_0
```

**⚠️ IMPORTANTE:**
- Copie do `e` até o `0` (a linha COMPLETA)
- NÃO adicione espaços no início ou fim
- NÃO adicione aspas `"`
- NÃO quebre em múltiplas linhas

Clique em: **Add secret** (botão verde)

✅ Você verá: `SUPABASE_ANON_KEY` na lista

---

### **6. Verificar**

Na página de Secrets, você deve ver **exatamente isto**:

```
Repository secrets

SUPABASE_ANON_KEY         Updated now
SUPABASE_URL             Updated now
```

Se sim, **está pronto!** ✅

---

## 🧪 **Testar Agora:**

### **1. Ir para Actions**
```
https://github.com/Luccalacerdaa/ym-sports/actions
```

### **2. Selecionar workflow**
- Clique em: **Notificações Diárias Automáticas**

### **3. Rodar manualmente**
- Botão no canto direito: **Run workflow** ▼
- Branch: `main`
- Tipo: `test`
- Clique em: **Run workflow** (botão verde)

### **4. Aguardar**
- Recarregue a página (F5) após 10 segundos
- Você verá uma nova linha aparecendo
- Clique nela para ver os logs

### **5. Ver resultado**
- Clique em: **send-notification**
- Expanda os steps
- Procure por:

```
✅ HTTP 200 - Enviadas: 3, Falharam: 0
🎉 Workflow concluído!
```

### **6. Verificar notificação**
- A notificação deve chegar no seu dispositivo! 📱
- Se não chegou:
  - Verificar em `/dashboard/settings` → Reativar Push
  - Conceder permissões de notificação
  - Ter pelo menos 1 dispositivo com push ativo

---

## ❌ **Se der erro:**

### **"Invalid API key"**

**Causa:** Secret foi copiado errado

**Solução:**
1. GitHub → Settings → Secrets → Actions
2. Clique no `SUPABASE_ANON_KEY`
3. Clique em: **Remove**
4. Clique em: **New repository secret**
5. Name: `SUPABASE_ANON_KEY`
6. Value: Copie a chave COMPLETA novamente (do arquivo)
7. **Dica:** Copie direto do código abaixo com Ctrl+C

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmpna3N2cGpidWh6d3VpdHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNzE0NzAsImV4cCI6MjA0NTY0NzQ3MH0.ZW-a1HlOCgzM1QwNW3o55Ik83Cve_ClfT7hJbKEus_0
```

8. Add secret
9. Testar novamente

---

### **"Usuários: 0"**

**Causa:** Nenhum usuário tem push ativo

**Solução:**
1. Abrir o app: https://ym-sports.vercel.app
2. Login
3. Ir em: `/dashboard/settings`
4. Seção: **Notificações Push**
5. Clicar em: **Reativar Push** (ou ativar pela primeira vez)
6. Conceder permissões no navegador
7. Aguardar: "✅ Push ativado com sucesso!"
8. Testar workflow novamente

---

## 📅 **Eventos:**

O workflow de eventos **já está ativo**!

Quando você criar um evento no calendário:
- GitHub vai verificar a cada 5 minutos
- Se evento está próximo (30 min), envia notificação
- **Funciona com app fechado!** 🎉

**Não precisa configurar nada extra** - os mesmos secrets já ativam!

---

## ✅ **Checklist Final:**

Antes de finalizar, verifique:

- [ ] 2 secrets configurados (SUPABASE_URL e SUPABASE_ANON_KEY)
- [ ] Teste manual executado com sucesso
- [ ] Notificação recebida no dispositivo
- [ ] Push ativo em `/dashboard/settings`
- [ ] Workflow "test" rodou sem erros

Se tudo está ✅, o sistema está **100% funcional**!

---

## 🎯 **Resultado Esperado:**

A partir de agora:

✅ **Notificações diárias automáticas:**
- 07:00 - Bom dia
- 09:00 - Hidratação
- 11:30 - Treino
- 14:00 - Hidratação
- **17:00 - Treino** ← Problema resolvido! 🎉
- 19:00 - Hidratação
- 21:00 - Boa noite

✅ **Notificações de eventos:**
- Automáticas quando você criar eventos
- 30min, 15min e 5min antes

✅ **Funciona sempre:**
- Mesmo com app fechado
- 24/7 no GitHub Actions
- 100% confiável

---

## 🎉 **Pronto!**

Agora você tem um sistema profissional de notificações funcionando!

Se tudo funcionou, você verá:
- ✅ Workflow passa (verde)
- ✅ Notificações chegam
- ✅ Logs mostram "Enviadas: X"

**Problema das 17h = RESOLVIDO!** 🚀

