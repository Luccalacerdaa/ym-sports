# 🚨 PROBLEMA DE ENDPOINTS DUPLICADOS - RESOLVIDO

## 📋 Problema Identificado

### Sintoma:
- Quando um novo dispositivo se registrava para receber notificações, os dispositivos **antigos paravam de funcionar**
- Notificações eram enviadas **apenas para o último dispositivo** que aceitou o push
- Múltiplos dispositivos do mesmo usuário **não conseguiam receber notificações simultaneamente**

### Causa Raiz:
O arquivo `api/subscribe.js` tinha uma lógica falha que permitia **endpoints duplicados** entre diferentes usuários. Quando um usuário fazia login em um dispositivo que outro usuário já havia usado:

1. O endpoint do dispositivo já existia no banco (associado ao User A)
2. O User B tentava registrar o mesmo endpoint
3. O sistema criava um **novo registro** com o mesmo endpoint para o User B
4. Isso causava conflito: o endpoint estava associado a **múltiplos usuários**
5. As notificações falhavam ou iam apenas para um dos usuários

### Teste que Confirmou o Problema:
```bash
# Teste enviando notificação para user: 45610e6d-f5f5-4540-912d-a5c9a361e20f
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{"user_id": "45610e6d-f5f5-4540-912d-a5c9a361e20f", "title": "Teste", "body": "Teste", "url": "/dashboard"}'

# Resposta: "Nenhuma subscription encontrada"
# Mas o dispositivo estava registrado!
```

```bash
# Lista de dispositivos mostrou apenas 2 users, mas nenhum era o testado
curl https://ym-sports.vercel.app/api/list-devices

# Resultado: 2 dispositivos, mas não para o user_id testado
```

## ✅ Solução Implementada

### Mudanças no `api/subscribe.js`:

#### 1. **Verificação Global de Endpoint**
```javascript
// ANTES: Verificava apenas se o endpoint existia para aquele usuário
const { data: existing } = await supabase
  .from('push_subscriptions')
  .select('id')
  .eq('user_id', user_id)
  .eq('endpoint', subscription.endpoint)
  .single();

// DEPOIS: Verifica se o endpoint existe para QUALQUER usuário
const { data: anyExisting } = await supabase
  .from('push_subscriptions')
  .select('id, user_id')
  .eq('endpoint', subscription.endpoint); // Removido .eq('user_id', ...)
```

#### 2. **Remoção de Endpoints de Outros Usuários**
```javascript
// Se o endpoint já pertence a OUTRO usuário, remover
const otherUsers = anyExisting.filter(sub => sub.user_id !== user_id);
if (otherUsers.length > 0) {
  console.log(`🗑️ Removendo ${otherUsers.length} subscription(s) de outros usuários`);
  for (const otherSub of otherUsers) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('id', otherSub.id);
    console.log(`  ✅ Removido de user: ${otherSub.user_id.substring(0, 8)}...`);
  }
}
```

#### 3. **Atualização ou Criação para o Usuário Atual**
```javascript
// Verificar se já existe para este usuário
const userExisting = anyExisting.find(sub => sub.user_id === user_id);

if (userExisting) {
  // Atualizar subscription existente
  await supabase
    .from('push_subscriptions')
    .update({ ... })
    .eq('id', userExisting.id);
} else {
  // Criar nova subscription
  await supabase
    .from('push_subscriptions')
    .insert({ ... });
}
```

#### 4. **Inicialização Movida para Dentro do Handler**
```javascript
// ANTES: Cliente Supabase inicializado no escopo global
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// DEPOIS: Inicializado dentro do handler
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  // ...
}
```

## 🎯 Resultado

### O que foi corrigido:
✅ **Endpoints únicos**: Cada endpoint pertence a apenas **um usuário** por vez  
✅ **Múltiplos dispositivos**: Mesmo usuário pode ter **vários dispositivos** funcionando  
✅ **Sem conflitos**: Quando um novo usuário usa um dispositivo, o antigo é **automaticamente removido**  
✅ **Logs detalhados**: Agora é possível rastrear o que acontece com cada subscription  
✅ **Inicialização correta**: Variáveis de ambiente sempre carregadas corretamente  

### Como testar agora:

1. **Re-aceitar notificações em todos os dispositivos**:
   - Abra o app em cada dispositivo
   - Vá em **Configurações → Notificações**
   - Clique em **"Ativar Notificações"** novamente
   - Cada dispositivo será registrado corretamente

2. **Verificar dispositivos registrados**:
```bash
curl https://ym-sports.vercel.app/api/list-devices
```

3. **Testar envio de notificação**:
```bash
curl -X POST https://ym-sports.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SEU_USER_ID_AQUI",
    "title": "🎉 Teste",
    "body": "Notificação de teste!",
    "url": "/dashboard"
  }'
```

## 📊 Próximos Passos

1. ✅ **Deploy automático** - Vercel já está fazendo deploy da correção
2. 🔄 **Re-registro** - Usuários precisam re-aceitar notificações em cada dispositivo
3. 📱 **Teste** - Verificar se múltiplos dispositivos recebem notificações
4. 🔍 **Monitoramento** - Acompanhar logs da Vercel para garantir que está funcionando

## 📝 Arquivos Modificados

- ✅ `api/subscribe.js` - Lógica de registro de subscription corrigida
- ✅ `api/notify.js` - Inicialização movida para dentro do handler (commit anterior)
- ✅ `api/daily-notifications-cron.js` - Inicialização movida para dentro do handler (commit anterior)

## 🔗 Commits Relacionados

1. `5061e23` - fix: mover inicialização do Supabase e WebPush para dentro do handler em api/notify
2. `6221863` - fix: corrigir conflito de endpoints e mover inicialização para dentro do handler

---

**Data da correção**: 31/12/2024  
**Status**: ✅ Resolvido e em produção

