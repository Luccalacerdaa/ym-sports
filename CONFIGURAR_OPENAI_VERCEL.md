# 🤖 Configurar API Key do OpenAI no Vercel

## 📝 Por que preciso fazer isso?

O GitHub bloqueia commits com API keys por segurança. Por isso, você precisa configurar a chave diretamente no Vercel.

---

## 🔑 Sua API Key

**IMPORTANTE:** Use a API key que você forneceu na conversa anterior (começa com `sk-proj-...`).

Se não tiver mais, gere uma nova em: https://platform.openai.com/api-keys

---

## 🚀 Passo a Passo

### 1️⃣ Acesse o Vercel
- Vá para: https://vercel.com/dashboard
- Entre no projeto **ym-sports**

### 2️⃣ Acesse Settings
- Clique em **Settings** (no topo)
- No menu lateral, clique em **Environment Variables**

### 3️⃣ Adicione a Variável
- **Key (Nome):** `VITE_OPENAI_API_KEY`
- **Value (Valor):** Cole sua API key acima
- **Environments:** Selecione **todas** (Production, Preview, Development)
- Clique em **Save**

### 4️⃣ Redesploy
- Volte para a aba **Deployments**
- No último deployment (que falhou), clique no menu **⋯**
- Clique em **Redeploy**
- ✅ Pronto! O build vai funcionar agora!

---

## ✅ Verificar se funcionou

Depois do deploy:
1. Abra o app
2. Abra o chat (botão amarelo com logo)
3. Digite qualquer mensagem
4. Se responder, está funcionando! 🎉

---

## 🐛 Se não funcionar

Abra o console do navegador (F12) e procure por:
- ✅ `Chatbot inicializado com API Key` = Funcionando
- ⚠️ `API Key do OpenAI não configurada` = Não configurada no Vercel

---

## 📚 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Seu Projeto:** https://vercel.com/luccalacerdaa/ym-sports
- **Docs Vercel:** https://vercel.com/docs/environment-variables

---

## 💡 Dica

Se você quiser renovar a API key no futuro, basta:
1. Gerar uma nova em: https://platform.openai.com/api-keys
2. Substituir no Vercel (mesmos passos acima)
3. Redesploy

**Nunca commite API keys no GitHub!** Sempre use variáveis de ambiente. 🔒

