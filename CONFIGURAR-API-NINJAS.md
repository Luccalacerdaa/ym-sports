# 🔧 Como Configurar a API da Ninjas

## 📋 **Configuração da API da Ninjas para Exercícios**

### **1. Obter Chave da API:**

1. **Acesse:** https://api-ninjas.com/
2. **Crie uma conta** gratuita
3. **Gere uma chave de API** gratuita
4. **Copie a chave** gerada

### **2. Configurar no Projeto:**

1. **Crie o arquivo `.env.local`** na raiz do projeto:
```bash
# Adicione esta linha ao seu .env.local
VITE_API_NINJAS_KEY=sua_chave_da_api_aqui
```

### **3. Exemplo de Uso:**

A API da Ninjas oferece:
- **Exercícios por músculo**
- **Exercícios por tipo**
- **Instruções detalhadas**
- **Dificuldade e equipamentos**

### **4. Limites da API Gratuita:**

- **50 requisições por dia**
- **Rate limit de 1 requisição por segundo**

---

## 🚀 **Funcionalidades Implementadas:**

### **✅ Hook useExerciseAPI:**
- Busca exercícios por nome
- Busca exercícios por músculo
- Busca exercícios por tipo
- Integração com base de dados local

### **✅ Enriquecimento Automático:**
- Exercícios da base local + API da Ninjas
- Instruções detalhadas da API
- Mapeamento de tipos para categorias
- Fallback para base local se API falhar

### **✅ IA Atualizada:**
- Prompt melhorado para incluir vídeos
- Instruções para usar canais profissionais
- Sempre incluir links do YouTube
- Vídeos genéricos como fallback

---

## 📊 **Como Funciona:**

### **1. Geração de Treinos:**
1. **IA gera exercício** com nome específico
2. **Sistema busca** na base local primeiro
3. **Se não encontrar,** busca na API da Ninjas
4. **Enriquece exercício** com dados da API
5. **Adiciona vídeos** conforme instruções da IA

### **2. Fallback Inteligente:**
- **Base local** → **API da Ninjas** → **IA com vídeos**
- **Sempre funciona** mesmo sem API configurada
- **Vídeos sempre incluídos** via IA

---

## 🎯 **Benefícios:**

### **✅ Com API da Ninjas:**
- **Mais exercícios** disponíveis
- **Instruções detalhadas** da API
- **Dados atualizados** e precisos
- **Integração perfeita** com sistema existente

### **✅ Sem API da Ninjas:**
- **Base local** funciona normalmente
- **IA gera vídeos** automaticamente
- **Sistema robusto** e confiável
- **Fallback inteligente**

---

## 🔧 **Testando:**

### **1. Com API Configurada:**
```bash
# Adicione ao .env.local
VITE_API_NINJAS_KEY=sua_chave_aqui

# Reinicie o servidor
npm run dev
```

### **2. Sem API Configurada:**
- Sistema usa base local
- IA gera vídeos automaticamente
- Funciona normalmente

---

## 📝 **Exemplo de Resposta da API:**

```json
{
  "name": "push-ups",
  "type": "strength",
  "muscle": "chest",
  "equipment": "body weight",
  "difficulty": "beginner",
  "instructions": "Lie face down on the ground..."
}
```

---

## 🎉 **Sistema Completo!**

### ✅ **Funcionalidades:**
- **API da Ninjas** integrada
- **Base local** robusta
- **IA com vídeos** sempre funcionando
- **Fallback inteligente**
- **Sistema híbrido** e confiável

### ✅ **Benefícios:**
- **Mais exercícios** disponíveis
- **Vídeos sempre incluídos**
- **Sistema robusto** e confiável
- **Experiência rica** para o usuário

**🚀 Configure a API da Ninjas para mais exercícios!**
**🎯 Sistema funciona com ou sem API!**
