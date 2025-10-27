# 🧪 Guia Completo de Testes - Notificações Push

## 🎯 Objetivo
Garantir que as notificações estão funcionando corretamente tanto em local quanto em produção.

---

## 📋 Checklist de Testes

### Fase 1: Testes Locais
- [ ] Service Worker registrado
- [ ] Permissão concedida
- [ ] Inscrição salva no Supabase
- [ ] Notificação de teste funciona
- [ ] Notificação de nível funciona
- [ ] Notificação de conquista funciona

### Fase 2: Testes em Produção (Vercel)
- [ ] Service Worker funciona em produção
- [ ] API routes funcionam
- [ ] Notificações chegam em dispositivos reais

---

## 🧪 FASE 1: Testes Locais

### Teste 1: Verificar Service Worker

#### Passo 1: Iniciar o servidor local
```bash
cd /Users/luccalacerda/Desktop/YMSPORTS/ym-sports
npm run dev
```

#### Passo 2: Abrir o app no navegador
```
http://localhost:8080
```

#### Passo 3: Abrir DevTools
- Pressione `F12` ou `Cmd + Option + I` (Mac)
- Ir na aba **Console**

#### Passo 4: Verificar registro do SW
Procure no console:
```
✅ Service Worker registrado: ...
[SW] Service Worker YM Sports carregado ✅
```

✅ **PASSOU** se ver essas mensagens
❌ **FALHOU** se não ver ou aparecer erro

---

### Teste 2: Ativar Notificações

#### Passo 1: Fazer login
- Email: `seu_email@gmail.com`
- Senha: sua senha

#### Passo 2: Ir no Perfil
- Menu → **Perfil**

#### Passo 3: Rolar até "Notificações Push"
- Deve aparecer o card de notificações

#### Passo 4: Ativar o switch
- Clicar no switch para ativar
- Navegador vai pedir permissão
- Clicar em **"Permitir"**

#### Passo 5: Verificar no console
Deve aparecer:
```
✅ Service Worker registrado: /
✅ Inscrição push criada: https://...
✅ Inscrição salva no servidor
🔔 Notificações ativadas com sucesso!
```

#### Passo 6: Verificar no Supabase
1. Abrir: https://supabase.com/dashboard/project/qfnjgksvpjbuhzwuitzg/editor
2. Tabela: `push_subscriptions`
3. Deve ter um registro com seu `user_id`

✅ **PASSOU** se ver o registro
❌ **FALHOU** se não aparecer ou der erro

---

### Teste 3: Notificação de Teste (Manual)

#### Passo 1: Clicar no botão "🧪 Testar Notificação"
- No card de Notificações Push
- Clicar no botão cinza

#### Passo 2: Verificar notificação
- Deve aparecer uma notificação no sistema
- Título: "🧪 Teste - YM Sports"
- Corpo: "Esta é uma notificação de teste!"

✅ **PASSOU** se a notificação aparecer
❌ **FALHOU** se não aparecer

---

### Teste 4: Notificação de Nível (Automática)

#### Passo 1: Ir para Treinos
- Menu → **Treinos**

#### Passo 2: Completar um treino
- Escolher qualquer treino
- Clicar em **"Completar Treino"**

#### Passo 3: Verificar toast
- Deve aparecer toast com pontos ganhos
- Se subiu de nível, vai mostrar

#### Passo 4: Verificar notificação
Se subiu de nível, deve aparecer:
- Título: "🎉 Parabéns! Subiu de Nível!"
- Corpo: "Você alcançou o nível X!"

✅ **PASSOU** se a notificação aparecer ao subir de nível
⚠️ **NOTA**: Só aparece se realmente subir de nível

---

### Teste 5: Notificação via API (Teste Avançado)

#### Passo 1: Pegar seu User ID
No console do navegador (F12), digite:
```javascript
// Copie o resultado
localStorage.getItem('supabase.auth.token')
```

Ou vá no Supabase:
- Table Editor → `profiles`
- Copie o `id` do seu perfil

#### Passo 2: Testar com curl (terminal)
```bash
curl -X POST http://localhost:8080/api/send-notification-to-user \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID_AQUI",
    "title": "🎯 Teste Via API",
    "body": "Esta notificação foi enviada via API!",
    "url": "/dashboard"
  }'
```

**Substitua** `SEU_USER_ID_AQUI` pelo seu UUID!

#### Passo 3: Verificar resposta
Deve retornar:
```json
{
  "success": true,
  "sent": 1,
  "failed": 0,
  "total": 1,
  "message": "1 notificação(ões) enviada(s) com sucesso"
}
```

#### Passo 4: Ver notificação
Deve aparecer a notificação no sistema!

✅ **PASSOU** se recebeu a notificação
❌ **FALHOU** se não recebeu ou deu erro

---

### Teste 6: Notificação com App Fechado

#### Passo 1: Minimizar ou fechar a aba
- Não feche o navegador, apenas minimize

#### Passo 2: Enviar notificação via API
```bash
curl -X POST http://localhost:8080/api/send-notification-to-user \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID_AQUI",
    "title": "🔔 App Fechado",
    "body": "Você recebeu esta notificação com o app fechado!",
    "url": "/dashboard"
  }'
```

#### Passo 3: Verificar notificação
- Deve aparecer mesmo com o app minimizado!
- Isso prova que o Service Worker está funcionando

#### Passo 4: Clicar na notificação
- Deve abrir o app automaticamente

✅ **PASSOU** se recebeu com app fechado e abriu ao clicar
❌ **FALHOU** se não recebeu

---

## 🚀 FASE 2: Testes em Produção (Vercel)

### Teste 1: Service Worker em Produção

#### Passo 1: Acessar produção
```
https://ym-sports.vercel.app
```

#### Passo 2: Fazer login

#### Passo 3: Abrir DevTools (F12)

#### Passo 4: Verificar SW
Console deve mostrar:
```
[SW] Service Worker YM Sports carregado ✅
```

#### Passo 5: Verificar Application tab
- DevTools → **Application**
- **Service Workers** (esquerda)
- Deve mostrar `sw.js` ativo

✅ **PASSOU** se SW está registrado
❌ **FALHOU** se não aparece

---

### Teste 2: Ativar em Produção

#### Passo 1: Ir no Perfil

#### Passo 2: Ativar notificações
- Switch ON
- Permitir no navegador

#### Passo 3: Testar
- Clicar em "🧪 Testar Notificação"

✅ **PASSOU** se funciona
❌ **FALHOU** se não funciona

---

### Teste 3: API em Produção

#### Passo 1: Pegar seu User ID
Console:
```javascript
JSON.parse(localStorage.getItem('supabase.auth.token')).user.id
```

#### Passo 2: Testar API de produção
```bash
curl -X POST https://ym-sports.vercel.app/api/send-notification-to-user \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID_AQUI",
    "title": "🚀 Teste Produção",
    "body": "Notificação da API em produção!",
    "url": "/dashboard"
  }'
```

#### Passo 3: Verificar
- Deve receber a notificação!

✅ **PASSOU** se funciona
❌ **FALHOU** se não funciona

---

### Teste 4: Múltiplos Dispositivos

#### Cenário: Testar receber em vários dispositivos

#### Passo 1: Fazer login no celular
- Abrir Chrome no Android
- Acessar: https://ym-sports.vercel.app
- Fazer login

#### Passo 2: Ativar notificações no celular
- Perfil → Notificações Push → ON

#### Passo 3: Enviar via API
```bash
curl -X POST https://ym-sports.vercel.app/api/send-notification-to-user \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID",
    "title": "📱 Multi-device",
    "body": "Esta notificação deve chegar em TODOS os seus dispositivos!",
    "url": "/dashboard"
  }'
```

#### Passo 4: Verificar
- Desktop: deve chegar ✅
- Mobile: deve chegar ✅

✅ **PASSOU** se chegou em ambos
❌ **FALHOU** se só chegou em um

---

## 🐛 Troubleshooting

### Problema: "Service Worker falhou ao registrar"

**Solução 1**: Verificar HTTPS
- Service Workers só funcionam em HTTPS (ou localhost)
- Vercel já tem HTTPS ✅

**Solução 2**: Limpar cache
```javascript
// Console do navegador
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
location.reload();
```

---

### Problema: "Permissão negada"

**Solução**: Resetar permissão
1. Chrome: Clicar no **cadeado** na barra de endereço
2. **Configurações do site**
3. **Notificações** → **Permitir**
4. Recarregar página

---

### Problema: "Erro 404 no API"

**Solução**: Verificar se as API routes estão na pasta certa
```
ym-sports/
├── api/
│   ├── save-subscription.ts
│   ├── remove-subscription.ts
│   └── send-notification-to-user.ts
```

**Testar se existe**:
```bash
curl https://ym-sports.vercel.app/api/send-notification-to-user
# Deve retornar: "Method not allowed" (é bom, significa que existe)
```

---

### Problema: "Notificação não chega"

**Debug passo a passo**:

1. **Verificar se está inscrito**
```sql
-- Supabase SQL Editor
SELECT * FROM push_subscriptions WHERE user_id = 'SEU_USER_ID';
```

2. **Verificar logs da Vercel**
- Dashboard Vercel → Projeto → **Logs**
- Procurar por erros nas API routes

3. **Testar localmente primeiro**
- Se funciona local mas não em prod = problema de deploy
- Se não funciona nem local = problema de código

---

## 📊 Verificar no Supabase

### Ver todas as inscrições
```sql
SELECT 
  id,
  user_id,
  endpoint,
  created_at,
  updated_at
FROM push_subscriptions
ORDER BY created_at DESC;
```

### Ver fila de notificações
```sql
SELECT * FROM notification_queue
WHERE status = 'pending'
ORDER BY scheduled_for;
```

### Limpar inscrições antigas (opcional)
```sql
SELECT cleanup_old_subscriptions();
```

---

## 📝 Script de Teste Automatizado

Crie arquivo `test-notifications.sh`:

```bash
#!/bin/bash

# Configurar
USER_ID="SEU_USER_ID_AQUI"
API_URL="http://localhost:8080"  # ou https://ym-sports.vercel.app

echo "🧪 Testando Notificações Push - YM Sports"
echo "=========================================="
echo ""

# Teste 1
echo "📨 Teste 1: Notificação Simples"
curl -X POST $API_URL/api/send-notification-to-user \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"title\": \"🧪 Teste 1\",
    \"body\": \"Notificação simples\",
    \"url\": \"/dashboard\"
  }"
echo ""
echo ""

sleep 3

# Teste 2
echo "📨 Teste 2: Notificação com Emoji"
curl -X POST $API_URL/api/send-notification-to-user \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"title\": \"🏆 Teste 2\",
    \"body\": \"Conquista Desbloqueada! 🎉\",
    \"url\": \"/dashboard/achievements\"
  }"
echo ""
echo ""

sleep 3

# Teste 3
echo "📨 Teste 3: Notificação de Nível"
curl -X POST $API_URL/api/send-notification-to-user \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"title\": \"🎉 Teste 3\",
    \"body\": \"Você alcançou o nível 10!\",
    \"url\": \"/dashboard\"
  }"
echo ""
echo ""

echo "✅ Testes enviados! Verifique as notificações."
```

**Usar**:
```bash
chmod +x test-notifications.sh
./test-notifications.sh
```

---

## ✅ Checklist Final

### Testes Essenciais (mínimo para produção)
- [ ] Service Worker registra em produção
- [ ] Consegue ativar notificações
- [ ] Botão "Testar" funciona
- [ ] API funciona em produção
- [ ] Notificação chega com app fechado
- [ ] Clicar na notificação abre o app

### Testes Completos (recomendado)
- [ ] Todos os testes essenciais ✅
- [ ] Notificação de nível funciona
- [ ] Notificação de conquista funciona
- [ ] Funciona em múltiplos dispositivos
- [ ] Funciona em diferentes navegadores
- [ ] Logs no Supabase corretos

---

## 🎯 Resultado Esperado

### ✅ Sucesso Total
Todos os testes passaram! Sistema 100% funcional.

### ⚠️ Sucesso Parcial
Maioria dos testes passou, alguns ajustes necessários.

### ❌ Falha
Revisar configuração e executar troubleshooting.

---

## 📞 Precisa de Ajuda?

1. **Verificar console**: Sempre olhar F12 primeiro
2. **Verificar Supabase**: Tabela `push_subscriptions`
3. **Verificar Vercel Logs**: Dashboard → Logs
4. **Testar local**: Se funciona local, problema é deploy

---

## 🚀 Pronto para Testar!

Execute os testes na ordem e marque os checkboxes. Boa sorte! 🍀

