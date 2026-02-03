# 🧪 COMO TESTAR O MODO OFFLINE

## 🎯 Guia Rápido de Teste

Agora o Service Worker está **COMPLETO** com cache offline! Vamos testar:

---

## 📱 TESTE 1: No Navegador Desktop

### Passo a Passo:

1. **Abrir o site**
   ```
   https://seu-site.vercel.app
   ```

2. **Abrir DevTools** (F12)
   - Ir na aba **Application** (Chrome) ou **Storage** (Firefox)

3. **Verificar Service Worker**
   ```
   Application → Service Workers
   
   ✅ Deve aparecer: "ym-sports-v18.0.0" - Status: Activated
   ```

4. **Ver Cache**
   ```
   Application → Cache Storage
   
   ✅ Deve ter 2 caches:
      - ym-sports-v18.0.0 (arquivos essenciais)
      - runtime-18.0.0 (arquivos dinâmicos)
   ```

5. **Simular Offline**
   ```
   DevTools → Network → Throttling → Offline
   ```

6. **Recarregar a página** (F5)
   ```
   ✅ App deve carregar normalmente!
   ✅ Você verá no console: "[SW] 💾 Servindo do cache (offline)"
   ```

7. **Navegar pelo app**
   ```
   ✅ Todas as rotas funcionam
   ✅ Imagens cacheadas aparecem
   ✅ Estilos mantidos
   ```

---

## 📱 TESTE 2: No Celular (Modo Avião)

### Android/iPhone:

1. **Abrir o site no navegador**
   ```
   Chrome (Android) ou Safari (iOS)
   ```

2. **Navegar um pouco**
   - Ver dashboard
   - Abrir treinos
   - Ver eventos
   - Ver perfil
   
   *(Isso vai cachear as páginas)*

3. **Ativar Modo Avião** ✈️
   ```
   Configurações → Modo Avião: ON
   ```

4. **Voltar ao navegador**

5. **Recarregar a página**
   ```
   ✅ App funciona!
   ✅ Páginas já visitadas carregam
   ✅ Imagens cacheadas aparecem
   ```

6. **Tentar ações que precisam internet**
   ```
   ❌ Gerar treino IA → Erro (esperado)
   ❌ Atualizar perfil → Erro (esperado)
   ✅ Ver dados já carregados → Funciona!
   ```

---

## 🔍 TESTE 3: Verificar no Console

### Comandos JavaScript:

Abra o console (F12) e execute:

```javascript
// 1. Verificar se Service Worker está ativo
navigator.serviceWorker.ready.then(reg => {
  console.log('✅ Service Worker ativo:', reg.active.scriptURL);
  console.log('Scope:', reg.scope);
  console.log('Estado:', reg.active.state);
});

// 2. Ver todos os caches
caches.keys().then(keys => {
  console.log('📦 Caches disponíveis:', keys);
  
  // Ver conteúdo de cada cache
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`\n📦 Cache "${key}" tem ${requests.length} items:`);
        requests.forEach(req => console.log('  -', req.url));
      });
    });
  });
});

// 3. Ver tamanho do armazenamento
navigator.storage.estimate().then(estimate => {
  const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
  const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
  const percentage = ((estimate.usage / estimate.quota) * 100).toFixed(2);
  
  console.log(`💾 Armazenamento:`);
  console.log(`   Usado: ${usedMB}MB`);
  console.log(`   Total: ${quotaMB}MB`);
  console.log(`   Uso: ${percentage}%`);
});

// 4. Testar status online/offline
console.log('🌐 Status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

// 5. Forçar atualização do Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('🔄 Forçando atualização...');
    reg.update();
  }
});
```

---

## 🎬 CENÁRIOS DE TESTE

### ✅ Cenário 1: Primeira Visita Offline
```
❌ NÃO FUNCIONA (esperado)
Motivo: Precisa visitar online primeiro para cachear
```

### ✅ Cenário 2: Segunda Visita Offline
```
✅ FUNCIONA!
- HTML carregado do cache
- CSS/JS carregados do cache
- Imagens cacheadas aparecem
- Navegação funciona
```

### ✅ Cenário 3: Offline → Online
```
1. Está offline
2. Volta online
3. ✅ Service Worker detecta automaticamente
4. ✅ Busca dados atualizados
5. ✅ Atualiza cache
```

### ✅ Cenário 4: PWA Instalado
```
1. Instalar app na tela inicial
2. Abrir o app instalado
3. Modo avião
4. ✅ App funciona 100% offline!
```

---

## 🐛 TROUBLESHOOTING

### Problema 1: "Service Worker não está registrando"

**Solução**:
```javascript
// No console:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  console.log('🗑️ Service Workers removidos. Recarregue a página.');
});
```

### Problema 2: "Cache não está sendo criado"

**Verificar**:
```javascript
// 1. Service Worker está ativo?
navigator.serviceWorker.controller
// Se for null, recarregue a página

// 2. HTTPS?
console.log('Protocol:', window.location.protocol);
// Deve ser https:// (ou localhost)
```

### Problema 3: "App não funciona offline"

**Checklist**:
- [ ] Visitou o site online primeiro?
- [ ] Service Worker está ativo? (verificar em DevTools)
- [ ] Cache foi criado? (verificar em Application → Cache Storage)
- [ ] Está tentando acessar uma página que já visitou?
- [ ] Esperou alguns segundos após primeira visita?

**Debug**:
```bash
# Ver logs do Service Worker
DevTools → Application → Service Workers → Ver console
```

### Problema 4: "Mudanças não aparecem"

**Cache está desatualizado!**

**Solução**:
```javascript
// Limpar cache e forçar atualização
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
  console.log('🗑️ Cache limpo!');
});

// Ou em DevTools:
// Application → Clear Storage → Clear site data
```

---

## 📊 MÉTRICAS ESPERADAS

### Performance:

```
PRIMEIRA VISITA (online):
├─ Carregamento: 2-3 segundos
├─ Download: ~2-3MB
└─ Cache criado: ~10-20MB

VISITAS SEGUINTES (offline):
├─ Carregamento: <500ms ⚡
├─ Download: 0 bytes
└─ Serve do cache
```

### Cache:

```
CACHE ESSENCIAL (ym-sports-v18.0.0):
├─ index.html
├─ manifest.json
├─ logo.svg
└─ icons/*.png
Total: ~500KB

CACHE RUNTIME (runtime-18.0.0):
├─ CSS bundles
├─ JS bundles
├─ Imagens visitadas
├─ Fontes
└─ Assets diversos
Total: ~10-50MB (cresce conforme uso)
```

---

## 🎓 ENTENDER OS LOGS

### No Console do Service Worker:

```
[SW] 🚀 YM Sports Service Worker v18.0.0 iniciado!
     ↳ SW começou

[SW] 📦 Instalando Service Worker...
     ↳ Primeira instalação

[SW] 💾 Cacheando arquivos essenciais
     ↳ Salvando arquivos offline

[SW] ✅ Instalação completa
     ↳ Pronto para usar

[SW] 🔄 Ativando Service Worker...
     ↳ Tornando ativo

[SW] 🗑️ Removendo cache antigo: ym-sports-v17.0.0
     ↳ Limpeza de versões antigas

[SW] ✅ Ativação completa
     ↳ Totalmente operacional

[SW] 💾 Cache HIT: /assets/index-abc123.js
     ↳ Arquivo servido do cache (rápido!)

[SW] 💾 Servindo do cache (offline): /dashboard
     ↳ Você está offline, mas temos cache!

[SW] ❌ Offline e sem cache para: /new-page
     ↳ Página não foi visitada ainda
```

---

## ✅ CHECKLIST FINAL

Antes de considerar que está funcionando, verificar:

- [ ] Service Worker registrado e ativo
- [ ] Cache criado (ver em DevTools)
- [ ] Testado com DevTools offline
- [ ] Testado com modo avião no celular
- [ ] Navegação funciona offline
- [ ] Imagens aparecem offline
- [ ] Console mostra logs do SW
- [ ] PWA installable (aparece prompt)

---

## 🚀 PRÓXIMOS PASSOS

Depois de testar e confirmar que funciona:

1. **Deploy para produção**
   ```bash
   git add .
   git commit -m "feat: Adicionar cache offline ao Service Worker"
   git push
   ```

2. **Testar na URL de produção**
   ```
   https://seu-app.vercel.app
   ```

3. **Instalar como PWA**
   - No celular: "Adicionar à tela inicial"
   - No desktop: Ícone de instalação no navegador

4. **Usar offline!** ✈️

---

**Última atualização**: 03/02/2026  
**Service Worker**: v18.0.0  
**Status**: ✅ Cache offline implementado
