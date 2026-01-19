# 📂 Assets do YM Design

## 📸 FOTOS (Artes Profissionais)

**Pasta:** `/public/ym-design/fotos/`

### Como adicionar fotos:

1. Salve suas fotos com nomes descritivos:
   - `foto-1-jogador-profissional.jpg`
   - `foto-2-card-apresentacao.jpg`
   - `foto-3-banner-social.jpg`
   - etc...

2. **Formato recomendado:**
   - JPG ou PNG
   - Resolução: 1080x1920 (vertical) ou 1920x1080 (horizontal)
   - Tamanho máximo: 2MB por foto

3. **Exemplo de estrutura:**
```
public/ym-design/fotos/
├── foto-1-jogador-profissional.jpg
├── foto-2-card-apresentacao.jpg
├── foto-3-banner-social.jpg
├── foto-4-montagem-artistica.jpg
├── foto-5-logo-time.jpg
└── foto-6-poster-motivacional.jpg
```

---

## 🎬 VÍDEOS MOTION (Motion Design)

**Pasta:** `/public/ym-design/motion/`

### ⚠️ IMPORTANTE: Vídeos devem ser pequenos!

Para não deixar o app pesado, recomendo:

#### **Opção A: Vídeos Curtos** (Recomendado)
- Formato: MP4 (H.264)
- Duração: máximo 15 segundos
- Tamanho: máximo 5MB por vídeo
- Resolução: 1080x1920 ou 1920x1080

#### **Opção B: GIFs Animados** (Melhor opção!)
- Formato: GIF
- Duração: 3-5 segundos em loop
- Tamanho: máximo 2MB
- Resolução: 1080x1920 ou menor

#### **Opção C: Links do YouTube** (Ideal para vídeos longos)
- Faça upload no YouTube (não listado)
- Apenas guarde os IDs dos vídeos
- Exemplo: `dQw4w9WgXcQ` (do link youtube.com/watch?v=dQw4w9WgXcQ)

### Como adicionar vídeos:

1. Salve seus vídeos com nomes descritivos:
   - `motion-1-intro-jogador.mp4`
   - `motion-2-highlights.mp4`
   - `motion-3-estatisticas.mp4`

2. **Exemplo de estrutura:**
```
public/ym-design/motion/
├── motion-1-intro-jogador.mp4 (ou .gif)
├── motion-2-highlights.mp4
├── motion-3-estatisticas.mp4
└── thumbnails/  (miniaturas dos vídeos)
    ├── motion-1-thumb.jpg
    ├── motion-2-thumb.jpg
    └── motion-3-thumb.jpg
```

---

## 🎨 MINIATURAS (Thumbnails)

Para melhor performance, crie uma miniatura (imagem estática) de cada vídeo:

1. Pegue um frame interessante do vídeo
2. Salve como JPG
3. Coloque na pasta `/public/ym-design/motion/thumbnails/`
4. Use o mesmo nome do vídeo + `-thumb.jpg`

---

## 🔧 DEPOIS DE ADICIONAR OS ARQUIVOS

1. Execute o comando:
```bash
npm run dev
```

2. Os arquivos estarão disponíveis em:
   - Fotos: `http://localhost:5173/ym-design/fotos/foto-1.jpg`
   - Motion: `http://localhost:5173/ym-design/motion/motion-1.mp4`

3. Me avise quando terminar de adicionar os arquivos que eu atualizo o código!

---

## 📝 CHECKLIST

- [ ] Fotos adicionadas na pasta `/public/ym-design/fotos/`
- [ ] Vídeos adicionados na pasta `/public/ym-design/motion/`
- [ ] Miniaturas criadas para cada vídeo
- [ ] Todos os arquivos com nomes descritivos
- [ ] Tamanhos de arquivo verificados (não muito grande!)

---

## 💡 DICA PRO

Se você usar o **Google Drive** ou **Dropbox**:
1. Coloque todos os arquivos lá
2. Me mande os links compartilhados
3. Eu baixo e coloco nas pastas corretas
4. Facilita muito! 📦
