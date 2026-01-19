# 🎥 Recomendações: Vídeos e Fotos no Portfólio

## ⚠️ PROBLEMA IDENTIFICADO

Armazenar vídeos grandes (5+ minutos) no Supabase Storage vai causar:
- 💰 **Custos altíssimos** com storage e bandwidth
- 🐌 **App lento** para carregar
- 🔥 **Instabilidade** com muitos usuários
- 📊 **Estouro de quota** rapidamente

---

## ✅ SOLUÇÃO RECOMENDADA

### **1️⃣ Para VÍDEOS** (Melhor Opção)

**Use serviços de hospedagem de vídeo:**

#### **Opção A: YouTube** (Gratuito e Recomendado)
- ✅ **Gratuito** e ilimitado
- ✅ **CDN global** (rápido em qualquer lugar)
- ✅ **Compressão automática**
- ✅ **Player embutido**
- ✅ **Vídeos privados** (não listados)

**Como funcionar:**
1. Jogador faz upload do vídeo no YouTube (não listado)
2. Copia o link do YouTube
3. Cola no campo "URL do Vídeo" no portfólio
4. App exibe o vídeo incorporado

#### **Opção B: Vimeo** (Gratuito com limites)
- ✅ **Mais profissional** (sem anúncios)
- ✅ **Controle de privacidade**
- ⚠️ **Limite de 500MB/semana** (plano gratuito)
- 💰 **Plano pago** (R$ 30/mês) para ilimitado

#### **Opção C: Google Drive / Dropbox** (Alternativa)
- ✅ **Já usado pela maioria**
- ⚠️ **Limite de visualizações** (Drive)
- ⚠️ **Player menos profissional**

---

### **2️⃣ Para FOTOS** (Armazenar no Supabase)

**Implementar limites e compressão:**

```typescript
// Configurações recomendadas:
const PHOTO_CONFIG = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB por foto
  MAX_PHOTOS: 10,             // Máximo de 10 fotos por portfólio
  QUALITY: 0.8,               // Compressão 80%
  MAX_WIDTH: 1920,            // Largura máxima
  MAX_HEIGHT: 1920            // Altura máxima
};
```

**Fluxo recomendado:**
1. Usuário seleciona foto
2. **Compressão automática** no frontend (antes do upload)
3. Validação de tamanho e quantidade
4. Upload para Supabase Storage
5. URL da foto salva no banco

---

## 📊 QUOTAS RECOMENDADAS POR PORTFÓLIO

| Tipo          | Limite Gratuito | Limite Premium |
|---------------|-----------------|----------------|
| Fotos         | 5 fotos         | 20 fotos       |
| Vídeos (links)| 3 vídeos        | 10 vídeos      |
| Tamanho/foto  | 2MB             | 5MB            |

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### **1. Adicionar campo de vídeo no schema**

```sql
-- Adicionar coluna para URLs de vídeos (YouTube/Vimeo)
ALTER TABLE player_portfolio 
ADD COLUMN video_urls TEXT[] DEFAULT '{}';

-- Adicionar coluna para limitar fotos
ALTER TABLE player_portfolio 
ADD COLUMN photo_count INTEGER DEFAULT 0;
```

### **2. Validação no Frontend**

```typescript
// hooks/usePortfolio.ts

const uploadPhoto = async (file: File) => {
  // Validar quantidade
  if (portfolio.photo_count >= MAX_PHOTOS) {
    throw new Error('Limite de fotos atingido');
  }
  
  // Validar tamanho
  if (file.size > MAX_SIZE) {
    throw new Error('Foto muito grande (máx 2MB)');
  }
  
  // Comprimir foto
  const compressedFile = await compressImage(file, {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920
  });
  
  // Upload
  const { data, error } = await supabase.storage
    .from('portfolio-photos')
    .upload(`${userId}/${Date.now()}.jpg`, compressedFile);
  
  // Atualizar contador
  await updatePhotoCount(portfolio.id, portfolio.photo_count + 1);
  
  return data?.path;
};

const addVideoUrl = (url: string) => {
  // Validar se é YouTube ou Vimeo
  const isValid = /youtube|vimeo/.test(url);
  if (!isValid) {
    throw new Error('Use apenas links do YouTube ou Vimeo');
  }
  
  // Adicionar à lista
  const newUrls = [...portfolio.video_urls, url];
  await updatePortfolio({ video_urls: newUrls });
};
```

### **3. Biblioteca de Compressão**

```bash
npm install browser-image-compression
```

```typescript
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  
  const compressedFile = await imageCompression(file, options);
  return compressedFile;
};
```

---

## 💰 ESTIMATIVA DE CUSTOS

### **Cenário A: Armazenando vídeos no Supabase** (❌ NÃO RECOMENDADO)

- 1.000 usuários × 5 vídeos × 100MB = **500GB**
- Custo Supabase Storage: **R$ 250/mês** (500GB)
- Bandwidth (visualizações): **R$ 500/mês++** 🔥
- **TOTAL: ~R$ 750/mês** 💸

### **Cenário B: Usando YouTube + Fotos comprimidas** (✅ RECOMENDADO)

- 1.000 usuários × 10 fotos × 1MB = **10GB**
- Custo Supabase Storage: **R$ 5/mês** (10GB)
- Bandwidth (fotos): **R$ 20/mês**
- Vídeos: **GRATUITO** (YouTube) ✅
- **TOTAL: ~R$ 25/mês** 💚

**Economia: R$ 725/mês (97% mais barato!)** 🎉

---

## 🎯 PLANO DE AÇÃO

### **Fase 1: Implementar agora** (Urgente)
- [ ] Adicionar campo `video_urls` (array de links)
- [ ] Implementar compressão de fotos
- [ ] Adicionar limite de 5 fotos gratuitas
- [ ] Adicionar validação de tamanho (2MB)

### **Fase 2: Melhorias** (Curto prazo)
- [ ] Adicionar suporte a YouTube embed
- [ ] Adicionar suporte a Vimeo embed
- [ ] Criar UI para gerenciar vídeos/fotos
- [ ] Adicionar preview antes do upload

### **Fase 3: Premium** (Futuro)
- [ ] Criar plano premium com mais fotos
- [ ] Adicionar editor de fotos básico
- [ ] Adicionar marca d'água automática
- [ ] Adicionar galeria de fotos profissional

---

## 🔗 REFERÊNCIAS

- [YouTube Embed API](https://developers.google.com/youtube/iframe_api_reference)
- [Vimeo Player API](https://developer.vimeo.com/player/sdk)
- [Browser Image Compression](https://github.com/Donaldcwl/browser-image-compression)
- [Supabase Storage Pricing](https://supabase.com/pricing)

---

## 📝 EXEMPLO DE USO

```typescript
// Componente PortfolioEditor.tsx

const PortfolioEditor = () => {
  const handleAddVideo = (url: string) => {
    if (!isYouTubeOrVimeo(url)) {
      toast.error('Use apenas links do YouTube ou Vimeo');
      return;
    }
    addVideoUrl(url);
    toast.success('Vídeo adicionado!');
  };
  
  const handleUploadPhoto = async (file: File) => {
    try {
      // Comprimir
      const compressed = await compressImage(file);
      
      // Upload
      const url = await uploadPhoto(compressed);
      
      toast.success('Foto adicionada!');
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    <div>
      {/* Upload de fotos */}
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => handleUploadPhoto(e.target.files[0])}
      />
      <p>Limite: {photoCount}/5 fotos</p>
      
      {/* Links de vídeos */}
      <input 
        type="url"
        placeholder="Cole o link do YouTube ou Vimeo"
        onBlur={(e) => handleAddVideo(e.target.value)}
      />
      <p>Máximo: 3 vídeos</p>
    </div>
  );
};
```

---

## ✅ CONCLUSÃO

**USE YOUTUBE PARA VÍDEOS** 
- Gratuito, rápido, confiável
- Economiza ~R$ 700/mês
- App mais rápido e estável

**COMPRIMA FOTOS ANTES DO UPLOAD**
- Limite: 2MB por foto
- Máximo: 5-10 fotos por portfólio
- Compressão automática no frontend

**Resultado: App rápido, barato e escalável! 🚀**
