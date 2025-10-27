# 🚀 Guia Rápido de Testes - Notificações Push

## ⚡ Teste Rápido (5 minutos)

### 1. 🌐 Abrir o App
```
https://ym-sports.vercel.app
```

### 2. 🔐 Fazer Login
- Email e senha

### 3. 👤 Ir no Perfil
- Menu → **Perfil**

### 4. 🔔 Ativar Notificações
- Rolar até **"Notificações Push"**
- Ativar o **switch**
- Clicar em **"Permitir"** no navegador

### 5. 🧪 Testar
- Clicar no botão **"🧪 Testar Notificação"**
- Deve aparecer uma notificação!

✅ **SE APARECEU** = Funcionando perfeitamente!
❌ **SE NÃO APARECEU** = Ver troubleshooting abaixo

---

## 🔍 Pegar seu User ID

### Método 1: Console do Navegador
1. Pressione `F12`
2. Aba **Console**
3. Digite e pressione Enter:
```javascript
JSON.parse(localStorage.getItem('supabase.auth.token')).user.id
```
4. Copie o UUID que aparecer

### Método 2: Supabase
1. Abra: https://supabase.com/dashboard/project/qfnjgksvpjbuhzwuitzg/editor
2. Tabela: `profiles`
3. Encontre seu email
4. Copie o `id`

---

## 📱 Teste com Ferramenta HTML

### 1. Abrir a Ferramenta
```
http://localhost:8080/test-push.html
```
ou
```
https://ym-sports.vercel.app/test-push.html
```

### 2. Configurar
- **Ambiente**: Escolha Local ou Produção
- **User ID**: Cole seu UUID

### 3. Testar
- Clique em qualquer botão de teste
- Verifique o log
- Deve aparecer: `✅ Sucesso! Enviadas: 1`

### 4. Verificar Notificação
- Deve aparecer no sistema operacional!

---

## 🐛 Problemas Comuns

### ❌ "Notificações não suportadas"
**Solução**: Use Chrome, Edge ou Firefox

### ❌ "Permissão negada"
**Solução**: 
1. Clicar no **cadeado** na barra de endereço
2. **Notificações** → **Permitir**
3. Recarregar (F5)

### ❌ "Erro 404 na API"
**Solução**: Verificar se fez deploy:
```bash
cd /Users/luccalacerda/Desktop/YMSPORTS/ym-sports
vercel --prod
```

### ❌ "User ID inválido"
**Solução**: Verificar se:
- É um UUID válido (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- Corresponde a um usuário real no Supabase

---

## 🧪 Teste via Terminal (Avançado)

### 1. Pegar User ID
Seguir método acima ↑

### 2. Executar curl
```bash
curl -X POST https://ym-sports.vercel.app/api/send-notification-to-user \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID_AQUI",
    "title": "🚀 Teste via Terminal",
    "body": "Notificação enviada pelo terminal!",
    "url": "/dashboard"
  }'
```

### 3. Verificar Resposta
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

### 4. Ver Notificação
Deve aparecer no sistema!

---

## 📊 Verificar no Supabase

### Ver Inscrições Ativas
```sql
SELECT 
  user_id,
  endpoint,
  created_at
FROM push_subscriptions
ORDER BY created_at DESC;
```

👉 https://supabase.com/dashboard/project/qfnjgksvpjbuhzwuitzg/editor

Deve ter pelo menos 1 registro com seu `user_id`.

---

## 🎯 Checklist Mínimo

- [ ] Conseguiu ativar notificações
- [ ] Botão "Testar" funciona
- [ ] API funciona (via curl ou ferramenta)
- [ ] Notificação aparece no sistema

✅ **4/4** = Sistema funcionando perfeitamente!

---

## 💡 Dicas

### Teste com App Fechado
1. Feche/minimize a aba do YM Sports
2. Envie notificação via curl ou ferramenta HTML
3. Deve aparecer mesmo com app fechado!
4. Clicar deve abrir o app

### Teste em Múltiplos Dispositivos
1. Fazer login no celular (Chrome Android)
2. Ativar notificações
3. Enviar via API
4. Deve chegar em Desktop E Mobile!

---

## 📞 Precisa de Ajuda?

1. **F12** → Console → Ver erros
2. **Supabase** → Table Editor → Ver inscrições
3. **Vercel** → Logs → Ver erros de API

---

## 🎉 Pronto!

Se passou no checklist mínimo, o sistema está funcionando! 🚀

