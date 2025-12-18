# 🧪 Como Testar Notificações

## ✅ Sistema Implementado

### 1. **Notificações Push (App Fechado)**
- ✅ Funciona mesmo com o app fechado
- ✅ Usa Service Worker em background
- ✅ Cadastra dispositivos via VAPID keys
- ✅ Pode ser enviada via API `/api/notify`

### 2. **Notificações de Eventos do Calendário**
- ✅ Verifica eventos a cada minuto no background
- ✅ Avisa 30 minutos antes
- ✅ Avisa 10 minutos antes
- ✅ Avisa quando o evento começa
- ✅ Funciona com app fechado

### 3. **Notificações de Achievements**
- ✅ Level Up
- ✅ Conquistas desbloqueadas
- ✅ Enviadas automaticamente pelo sistema

---

## 📍 Onde Encontrar as Funcionalidades

### 1. **Página de Configurações** (`/dashboard/settings`)
- **"Ativar Push"**: Ativa notificações push
- **"Teste Rápido"**: Envia notificação de teste imediata
- **"Central de Testes"**: Vai para a página completa de testes

### 2. **Central de Notificações** (`/dashboard/notification-test`)
- **Status do Sistema**: Ver permissões e subscription
- **Formulário de Teste**: Enviar notificações personalizadas
- **Exemplos Rápidos**: Templates prontos
- **Comando curl**: Para enviar via terminal

---

## 🚀 Como Testar (Passo a Passo)

### Teste 1: Ativar Push Notifications

1. **Abra o app** em `https://ym-sports.vercel.app`
2. **Faça login** com suas credenciais
3. **Vá em Configurações** (`/dashboard/settings`)
4. **Procure a seção** "Notificações Push (App Fechado)"
5. **Clique em** "🔔 Ativar Push"
6. **Permita** notificações quando o navegador pedir
7. **Aguarde** a confirmação "✅ Notificações push ativas!"

✅ **Status esperado:**
- Permissão: "✅ Concedida"
- Push Subscription: "✅ Ativa"

---

### Teste 2: Notificação Rápida

**Pré-requisito:** Push ativado (Teste 1)

1. **Na página de Configurações**, clique em **"Teste Rápido"**
2. **Aguarde** 2-3 segundos
3. **Veja** a notificação aparecer:
   - 🎉 YM Sports - Teste
   - Notificações funcionando perfeitamente!

✅ **Se chegou:** Sistema funcionando!
❌ **Se não chegou:**
   - Verifique se o navegador permite notificações
   - Abra DevTools → Console e veja os logs
   - Verifique em DevTools → Application → Service Workers se há um SW ativo

---

### Teste 3: Notificação Personalizada

1. **Vá para** `/dashboard/notification-test`
2. **Preencha o formulário:**
   - Título: `🏆 Nova Conquista!`
   - Mensagem: `Você desbloqueou a conquista Dedicação!`
   - URL: `/dashboard/profile`
3. **Clique em** "🚀 Enviar Notificação"
4. **Aguarde** 2-3 segundos
5. **Veja** a notificação personalizada

✅ **Resultado esperado:**
- Notificação aparece no sistema
- Clicando nela, vai para `/dashboard/profile`
- Console mostra: "✅ Notificação enviada! (1/1)"

---

### Teste 4: Notificação com App Fechado

**Este é o teste mais importante!**

1. **Ative Push** nas Configurações (Teste 1)
2. **Copie seu User ID** da Central de Notificações
3. **Feche o app** (fechar aba, fechar navegador)
4. **Abra o Terminal** e execute:

```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID_AQUI",
    "title": "🧪 Teste com App Fechado",
    "body": "Se você está vendo isso, funciona!",
    "url": "/dashboard"
  }'
```

5. **Aguarde** 2-3 segundos
6. **Veja** a notificação aparecer **mesmo com o app fechado**!

✅ **Resultado esperado:**
- Notificação aparece no sistema operacional
- Clicando nela, abre o app em `/dashboard`
- Resposta do curl: `{"success":true,"sent":1,"failed":0,"total":1}`

---

### Teste 5: Notificação de Evento do Calendário

**Este teste simula notificações automáticas de eventos.**

1. **Ative Push** nas Configurações
2. **Vá para** `/dashboard/calendar`
3. **Crie um evento** que comece em **20 minutos**:
   - Título: "Treino de Resistência"
   - Data/Hora: Hoje, daqui 20 minutos
   - Local: "Academia XYZ"
4. **Salve o evento**
5. **Feche o app** (ou deixe aberto)
6. **Aguarde** até que faltem 10 minutos para o evento
7. **Veja** a notificação automática:
   - "⚠️ Treino de Resistência"
   - "Faltam apenas 10 minutos! - Academia XYZ"

✅ **Resultado esperado:**
- Notificação em 10 minutos antes: "Faltam apenas X minutos!"
- Notificação ao começar: "Está começando agora!"

---

## 🐛 Troubleshooting (Solução de Problemas)

### Problema 1: Botão "Ativar Push" não aparece

**Causa:** Navegador não suporta push notifications

**Solução:**
- Use Chrome, Edge ou Firefox (não Safari iOS)
- Certifique-se de estar em HTTPS
- Verifique se Service Workers estão habilitados

---

### Problema 2: "Permissão negada"

**Causa:** Você bloqueou notificações no navegador

**Solução:**
1. **Chrome:**
   - Clique no cadeado na barra de endereços
   - Permita notificações
   - Recarregue a página

2. **Firefox:**
   - Clique no ícone de informações na barra
   - Permita notificações
   - Recarregue a página

---

### Problema 3: Notificação não chega via curl

**Possíveis causas:**

1. **User ID errado:**
   - Copie o ID correto da Central de Notificações
   - O ID deve ter formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

2. **Push não ativado:**
   - Vá em Configurações e clique em "Ativar Push"
   - Aguarde aparecer "✅ Notificações push ativas!"

3. **Subscription expirada:**
   - Desative e reative o push
   - Tente novamente

4. **Erro na API:**
   - Verifique a resposta do curl
   - Se erro 404: "No subscriptions found" → Ative o push
   - Se erro 500: Problema no servidor → Verifique logs do Vercel

---

### Problema 4: Eventos não geram notificações

**Diagnóstico:**

1. **Abra DevTools** → Console
2. **Procure por:**
   - `[SW] 📅 Verificando eventos próximos...`
   - `[SW] 📅 Encontrados X eventos próximos`

3. **Se não aparece:**
   - O SW não está recebendo configurações do Supabase
   - Abra DevTools → Application → Service Workers
   - Clique em "Unregister" e recarregue a página

4. **Verifique o evento:**
   - O evento precisa começar em **menos de 30 minutos**
   - O evento precisa estar **no futuro**
   - O evento precisa ser do **seu usuário**

---

### Problema 5: Service Worker não ativa

**Solução:**

1. **Abra DevTools** → Application → Service Workers
2. **Se houver erro**, clique em "Unregister"
3. **Recarregue** a página (Ctrl+Shift+R / Cmd+Shift+R)
4. **Aguarde** o SW registrar novamente
5. **Verifique** se aparece "✅ Service Worker ativo!"

---

## 📊 Verificar Status do Sistema

### Console do Navegador (F12 → Console)

**Logs esperados após login:**

```
🔧 Configurando sistema de notificações...
🔔 Permissão de notificação: granted
✅ Service Worker registrado: ServiceWorkerRegistration {...}
🚀 Service Worker ativo!
📤 Configurações do Supabase enviadas ao SW
✅ Sistema de notificações configurado com sucesso!
```

**Logs do Service Worker a cada 5 minutos:**

```
[SW] 💚 Service Worker v16.0.0 rodando - 14:30:00
```

**Logs ao verificar eventos (a cada 1 minuto):**

```
[SW] ⏰ Verificando 14:30 - Thu Dec 18 2025
[SW] 📅 Verificando eventos próximos...
[SW] 📅 Encontrados 1 eventos próximos
```

---

### DevTools → Application → Service Workers

**Status esperado:**

```
✅ Status: activated and is running
✅ Source: sw.js
✅ Updated: (data recente)
✅ Clients: 1
```

---

### Central de Notificações → Status do Sistema

**Valores esperados:**

```
✅ Permissão de Notificações: ✅ Concedida
✅ Push Subscription: ✅ Ativa
✅ User ID: 45610e6d-...
```

---

## 📱 Testando em Diferentes Dispositivos

### Desktop (Chrome/Edge)

✅ **Funciona perfeitamente**
- Push com app fechado: ✅
- Notificações de eventos: ✅
- Service Worker em background: ✅

### Mobile (Chrome Android)

✅ **Funciona perfeitamente**
- Instale como PWA (Add to Home Screen)
- Ative notificações
- Teste com app fechado

### iOS (Safari)

⚠️ **Limitações do iOS:**
- Safari não suporta Push API completo
- Use via navegador, mas **com app aberto**
- Ou use Chrome/Edge no iOS 16.4+

---

## 🎯 Checklist de Testes

Antes de considerar o sistema pronto, teste:

- [ ] Ativar Push nas Configurações
- [ ] Teste Rápido funciona
- [ ] Teste via Central de Notificações funciona
- [ ] Teste via curl funciona
- [ ] Teste com app fechado funciona
- [ ] Criar evento e receber notificação
- [ ] Notificação 10 min antes do evento
- [ ] Notificação ao começar o evento
- [ ] Clicar na notificação abre o app
- [ ] Service Worker roda em background
- [ ] Logs aparecem corretamente no Console

---

## 📞 Ainda com Problemas?

Se após todos os testes ainda houver problemas:

1. **Exporte os logs:**
   - DevTools → Console → Botão direito → "Save as..."
   - Envie o arquivo

2. **Tire screenshots:**
   - Página de Configurações
   - Central de Notificações (Status)
   - DevTools → Application → Service Workers

3. **Informe:**
   - Sistema operacional
   - Navegador e versão
   - Mensagem de erro completa

---

**Desenvolvido com ❤️ por YM Sports** 🚀

**Última atualização:** 18/12/2025

