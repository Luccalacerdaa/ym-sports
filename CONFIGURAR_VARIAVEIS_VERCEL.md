# 🔧 Configurar Variáveis de Ambiente na Vercel

## ❌ Problema Identificado

O cron de notificações diárias não estava enviando notificações porque havia **inconsistência nas variáveis de ambiente**.

- O endpoint `/api/subscribe` usava `VITE_SUPABASE_URL`
- O endpoint `/api/daily-notifications-cron` usava `SUPABASE_URL` (sem o prefixo `VITE_`)
- Resultado: O cron não conseguia acessar o mesmo banco de dados onde as subscriptions estavam salvas

## ✅ Correção Aplicada

Atualizei o `daily-notifications-cron.js` para usar as mesmas variáveis que os outros endpoints, com fallback para as variáveis antigas.

## 📋 Variáveis que DEVEM estar configuradas na Vercel

Acesse: **Vercel Dashboard → Seu Projeto → Settings → Environment Variables**

Configure as seguintes variáveis para **Production, Preview e Development**:

### 1. Supabase

| Nome da Variável | Valor | Onde Encontrar |
|------------------|-------|----------------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` | Supabase Dashboard → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` (chave secreta) | Supabase Dashboard → Project Settings → API → service_role key (⚠️ **secret**) |

### 2. Web Push (VAPID)

| Nome da Variável | Valor | Onde Encontrar |
|------------------|-------|----------------|
| `VITE_VAPID_PUBLIC_KEY` | `BH7x...` (chave pública) | A chave pública gerada para web push notifications |
| `VAPID_PRIVATE_KEY` | `abc123...` (chave privada) | A chave privada gerada para web push notifications (⚠️ **secret**) |
| `WEB_PUSH_CONTACT` | `mailto:suporte@ymsports.com` | Email de contato (opcional, tem valor padrão) |

### 3. (Opcional) Variáveis Antigas para Compatibilidade

Se você quiser manter compatibilidade com código antigo, pode também adicionar:

| Nome da Variável | Valor |
|------------------|-------|
| `SUPABASE_URL` | Mesmo valor de `VITE_SUPABASE_URL` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Mesmo valor de `VITE_VAPID_PUBLIC_KEY` |

---

## 🔍 Como Verificar se as Variáveis Estão Configuradas

Após o próximo deploy, o cron vai mostrar um log detalhado:

```
🔍 Verificando variáveis de ambiente:
   VITE_SUPABASE_URL: ✓ Configurada
   SUPABASE_URL: ✗ Faltando
   → Usando: ✓
   SUPABASE_SERVICE_ROLE_KEY: ✓ Configurada
   VITE_VAPID_PUBLIC_KEY: ✓ Configurada
   NEXT_PUBLIC_VAPID_PUBLIC_KEY: ✗ Faltando
   → Usando: ✓
   VAPID_PRIVATE_KEY: ✓ Configurada
   WEB_PUSH_CONTACT: ✓ Configurada
```

Se aparecer `✗ Faltando` nas linhas "→ Usando:", significa que está faltando configurar a variável.

---

## 🚀 Próximos Passos

1. ✅ **Configure as variáveis na Vercel** (listadas acima)
2. ✅ **Faça o commit e push** do código atualizado (já corrigido)
3. ✅ **Aguarde o deploy** na Vercel
4. ✅ **Verifique os logs do próximo cron** para confirmar que está funcionando
5. ✅ **Teste recebendo uma notificação** no próximo horário agendado

---

## ⏰ Horários das Notificações (BRT/GMT-3)

- **07:00** - 💪 Bom dia, atleta!
- **09:00** - 💧 Hora da Hidratação!
- **11:30** - 🏋️ Hora do Treino!
- **14:00** - 💧 Hidratação!
- **17:00** - 🏃‍♂️ Treino da Tarde!
- **19:00** - 💧 Última Hidratação!
- **21:00** - 🌙 Boa Noite!

---

## 📊 Como Verificar Subscriptions no Banco

Para verificar se há usuários cadastrados para receber notificações, você pode:

1. **Usar a API que criamos**: 
   ```bash
   curl https://seu-dominio.vercel.app/api/list-devices
   ```

2. **Consultar direto no Supabase**:
   - Vá para: Supabase Dashboard → Table Editor → `push_subscriptions`
   - Verifique quantas linhas existem

---

## 🐛 Troubleshooting

### "📱 Encontradas 0 subscriptions"

**Causa**: O cron não conseguiu se conectar ao Supabase ou a tabela está vazia.

**Solução**:
1. Verifique se `VITE_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configuradas
2. Acesse o banco e verifique se a tabela `push_subscriptions` tem registros
3. Se não tiver, peça para os usuários reativarem as notificações no app

### "❌ Erro ao buscar subscriptions"

**Causa**: Credenciais inválidas ou problemas de conexão com o Supabase.

**Solução**:
1. Verifique se as chaves do Supabase estão corretas
2. Confirme que a `SUPABASE_SERVICE_ROLE_KEY` tem permissões de leitura/escrita
3. Verifique se a tabela `push_subscriptions` existe no banco

---

Com essas configurações, o sistema de notificações deve voltar a funcionar! 🎉

