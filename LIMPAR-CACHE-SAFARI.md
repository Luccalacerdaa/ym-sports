# 🧹 Limpar Cache do Safari - Forçar Atualização

## 🔍 PROBLEMA

Safari está carregando versão antiga do Service Worker e não está pegando as atualizações do Vercel.

---

## ✅ SOLUÇÃO RÁPIDA (Recomendada)

### **Opção 1: Hard Refresh no Safari**

1. Abrir: https://ym-sports.vercel.app
2. Pressionar: **Cmd + Option + R** (recarregar ignorando cache)
3. Ou: **Cmd + Shift + R**

---

### **Opção 2: Limpar Service Workers (DevTools)**

1. Abrir Safari
2. **Cmd + Option + I** (DevTools)
3. Aba **Console**
4. Colar este código:

```javascript
// Desregistrar todos os Service Workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    reg.unregister();
    console.log('✅ SW removido:', reg.scope);
  });
  console.log('✅ Todos os Service Workers removidos!');
  
  // Recarregar após 2 segundos
  setTimeout(() => {
    console.log('🔄 Recarregando...');
    location.reload();
  }, 2000);
});
```

5. Aguardar recarregar automaticamente

---

### **Opção 3: Limpar Todo o Cache do Safari**

1. Safari → **Histórico** (menu)
2. **Limpar Histórico...**
3. Selecionar: **Todo o histórico**
4. Clicar em **Limpar Histórico**
5. Ou usar atalho: **Cmd + Option + E**

**⚠️ ATENÇÃO:** Isso vai deslogar de todos os sites!

---

### **Opção 4: Modo Anônimo (Teste Rápido)**

1. Safari → **Arquivo** → **Nova Janela Privativa**
2. Ou: **Cmd + Shift + N**
3. Acessar: https://ym-sports.vercel.app
4. Fazer login
5. Ativar notificações

**Vantagem:** Não afeta cache principal

---

## 🔧 VERIFICAR SE FUNCIONOU

Após limpar o cache, verificar no Console:

```javascript
// Verificar versão do Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('🔍 SW Scope:', reg.scope);
    console.log('🔍 SW Active:', reg.active);
    console.log('🔍 SW Installing:', reg.installing);
    console.log('🔍 SW Waiting:', reg.waiting);
    
    // Verificar script URL
    if (reg.active) {
      console.log('📄 SW Script:', reg.active.scriptURL);
    }
  } else {
    console.log('❌ Nenhum SW registrado');
  }
});

// Verificar cache name no sw.js
fetch('/sw.js').then(r => r.text()).then(code => {
  const match = code.match(/CACHE_NAME = '(.+?)'/);
  if (match) {
    console.log('🔍 Cache Name:', match[1]);
  }
});
```

**Deve mostrar:**
```
🔍 Cache Name: ym-sports-v2
```

Se mostrar `ym-sports-v1` = versão antiga

---

## 🚀 FORÇAR ATUALIZAÇÃO AUTOMÁTICA

Se o problema persistir, vamos forçar update no Service Worker.

No Console do Safari:

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('🔄 Forçando atualização do SW...');
    reg.update().then(() => {
      console.log('✅ SW atualizado!');
      location.reload();
    });
  }
});
```

---

## 📱 ALTERNATIVA: USAR CHROME

Se Safari continuar com problema de cache:

```bash
# Abrir no Chrome
open -a "Google Chrome" https://ym-sports.vercel.app
```

Chrome tem melhor suporte a Service Workers e atualiza mais rápido.

---

## 🐛 DEBUG: Ver Versão Carregada

Abrir DevTools → **Sources** → **Page** → `sw.js`

Procurar por esta linha:
```javascript
const CACHE_NAME = 'ym-sports-v2';
```

Se estiver `v1` = versão antiga carregada

---

## ✅ CHECKLIST

- [ ] Hard refresh (Cmd+Option+R)
- [ ] Service Workers desregistrados
- [ ] Cache do Safari limpo
- [ ] Página recarregada
- [ ] Console mostra `CACHE_NAME = 'ym-sports-v2'`
- [ ] Logs do SW aparecem: `[SW] 🚀 Service Worker YM Sports carregado!`

---

## 🆘 SE NADA FUNCIONAR

Use **Modo Anônimo** do Safari ou **Chrome** para testar com cache limpo garantido.

