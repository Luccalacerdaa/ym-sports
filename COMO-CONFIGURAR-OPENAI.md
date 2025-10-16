# 🚀 Configuração Rápida da OpenAI

## ⚡ **PASSO A PASSO SIMPLES**

### **1. Obter API Key da OpenAI:**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em **"Create new secret key"**
4. Copie a API key (começa com `sk-`)

### **2. Configurar no Projeto:**

**Crie o arquivo `.env.local` na raiz do projeto:**
```bash
# Na pasta ym-sports, crie o arquivo:
touch .env.local
```

**Adicione no arquivo `.env.local`:**
```env
VITE_OPENAI_API_KEY=sk-sua-api-key-aqui
```

### **3. Reiniciar o Servidor:**
```bash
npm run dev
```

### **4. Testar:**
1. Vá para **Dashboard → Treinos**
2. Clique em **"Gerar com IA"**
3. Preencha o formulário
4. Clique em **"Gerar Plano"**

---

## ✅ **PRONTO!**

Agora você pode gerar treinos personalizados com IA real usando seus dados do perfil!

**🎊 Sistema 100% funcional com IA da OpenAI!**
