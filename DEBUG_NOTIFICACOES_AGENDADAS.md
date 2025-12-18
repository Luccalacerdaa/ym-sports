# 🐛 Debug: Notificações Agendadas

## ❓ Por que a notificação das 17h não chegou?

### **Possíveis Causas:**

#### 1. **App precisa estar aberto (PWA ou Web)**
- ✅ **Service Worker funciona mesmo com app FECHADO**
- ⚠️ **Mas o SW precisa estar REGISTRADO primeiro**
- Se nunca abriu o app depois do último deploy, o SW não está ativo

#### 2. **Notificação já foi enviada hoje**
- O sistema usa localStorage para evitar duplicatas
- Cada notificação só é enviada **1 vez por dia**
- Key: `daily_notification_workout_Wed Dec 18 2025`

#### 3. **Service Worker desatualizado**
- Versão atual: **v17.0.0**
- Se o SW está em versão antiga, não tem o cronograma atualizado

#### 4. **Permissão de notificação negada**
- Se o usuário negou a permissão, notificações não aparecem
- Precisa permitir manualmente nas configurações do navegador

---

## 🔍 Como Verificar

### **1. Verificar se o Service Worker está ativo**

Abra o Console do navegador (F12) e rode:

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW ativo:', reg?.active);
  console.log('SW versão:', reg?.active?.scriptURL);
});
```

### **2. Verificar notificações enviadas hoje**

```javascript
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key?.startsWith('daily_notification_')) {
    console.log('✅ Enviada:', key);
  }
}
```

### **3. Verificar horário do sistema**

```javascript
const now = new Date();
const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
console.log('Horário atual:', time);
```

### **4. Forçar verificação manual**

```javascript
navigator.serviceWorker.controller?.postMessage({ type: 'FORCE_CHECK' });
console.log('✅ Verificação forçada enviada ao SW');
```

---

## ✅ Como Testar Novamente

### **Opção 1: Limpar Cache (Recomendado)**

1. Acesse `/dashboard/notification-test`
2. Clique em **"🧹 Limpar Cache de Notificações Diárias"**
3. Aguarde o horário (ou simule mudando o horário do sistema)

### **Opção 2: Console**

```javascript
// Limpar manualmente
localStorage.removeItem('daily_notification_workout_Wed Dec 18 2025');

// Forçar verificação
navigator.serviceWorker.controller?.postMessage({ type: 'FORCE_CHECK' });
```

### **Opção 3: DevTools**

1. F12 → Application → Storage → Local Storage
2. Busque por chaves `daily_notification_*`
3. Delete as chaves
4. Aguarde o horário

---

## 📅 Cronograma Atual

```javascript
07:00 - 💪 Bom dia, atleta!
09:00 - 💧 Hidratação
11:30 - 🏋️ Hora do Treino!
14:00 - 💧 Hidratação
17:00 - 🏃‍♂️ Treino da Tarde!  ← ESTA
19:00 - 💧 Última Hidratação
21:00 - 🌙 Boa Noite!
```

---

## 🔧 Solução Rápida

Se a notificação das 17h não chegou hoje:

```javascript
// 1. Limpar cache da notificação de hoje
const today = new Date().toDateString();
localStorage.removeItem(`daily_notification_workout_${today}`);

// 2. Forçar verificação
navigator.serviceWorker.controller?.postMessage({ type: 'FORCE_CHECK' });

// 3. Aguardar 1 minuto (o SW verifica a cada minuto)
console.log('⏰ Aguarde até:', new Date(Date.now() + 60000).toLocaleTimeString());
```

---

## 📊 Logs do Service Worker

Para ver os logs em tempo real:

1. F12 → Application → Service Workers
2. Clique em "sw.js" para abrir o console do SW
3. Você verá logs como:

```
[SW] ⏰ Verificando 17:00 - Wed Dec 18 2025
[SW] 📤 Enviando notificação agendada: 🏃‍♂️ Treino da Tarde! (workout)
[SW] ✅ Notificação enviada: 🏃‍♂️ Treino da Tarde! às 17:00
```

---

## 🚨 Problemas Conhecidos

### **1. PWA fechado há muito tempo**
- **Sintoma:** Nenhuma notificação chega
- **Causa:** Service Worker foi desativado pelo sistema
- **Solução:** Abrir o app 1x por dia

### **2. Modo economia de bateria**
- **Sintoma:** Notificações atrasadas ou não chegam
- **Causa:** Sistema operacional suspendeu o SW
- **Solução:** Desabilitar economia de bateria para o navegador

### **3. Navegador em segundo plano**
- **Sintoma:** Notificações só aparecem ao abrir o app
- **Causa:** Navegador limitando background tasks
- **Solução:** Manter o app como PWA instalado

---

## 💡 Dicas

1. **Instalar como PWA** → Melhor performance de notificações
2. **Permitir notificações** → Obrigatório para receber
3. **Abrir o app 1x por dia** → Mantém o SW ativo
4. **Não limpar dados do site** → Perde as configurações
5. **Testar em horário próximo** → Ex: 16:59 para testar 17:00

---

## 🎯 Teste Agora

Para testar **AGORA** sem esperar:

1. Vá em `/dashboard/notification-test`
2. Clique em **"🧹 Limpar Cache"**
3. No console, rode:

```javascript
// Simular que é 17:00
const fakeTime = '17:00';
const today = new Date().toDateString();
localStorage.removeItem(`daily_notification_workout_${today}`);

// Forçar verificação
navigator.serviceWorker.controller?.postMessage({ type: 'FORCE_CHECK' });
```

4. A notificação deve aparecer em até 1 minuto!

---

## 📞 Ainda não funciona?

Verifique:
- [ ] Service Worker v17.0.0 ou superior
- [ ] Permissão de notificação = "granted"
- [ ] Push subscription ativa
- [ ] localStorage sem a chave de hoje
- [ ] App aberto pelo menos 1x hoje

Se tudo isso estiver OK e ainda não funcionar, pode ser um bug do navegador ou sistema operacional bloqueando notificações em background.

