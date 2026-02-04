# 📸 COMO ADICIONAR FOTOS DO APP NA LANDING PAGE

## 🎯 Seção: "Veja o APP em Ação"

Esta seção mostra screenshots reais do app funcionando para os visitantes da landing page.

---

## 📍 ONDE FICA

**Arquivo**: `src/pages/Index.tsx`  
**Seção**: App Mockup / Screenshots

---

## 🖼️ COMO ENVIAR AS FOTOS

### Opção 1: Via Chat (Recomendado)

1. **Tire screenshots do app** nos principais recursos:
   - Dashboard principal
   - Tela de treinos
   - Calendário de eventos
   - Perfil do atleta
   - Rankings
   - Planos nutricionais
   - Conquistas/badges

2. **Envie aqui no chat**:
   ```
   @caminho/para/screenshot1.png
   @caminho/para/screenshot2.png
   @caminho/para/screenshot3.png
   ...
   ```

3. **Eu vou**:
   - Copiar para `/public/screenshots/`
   - Otimizar as imagens (se necessário)
   - Atualizar o código da landing page
   - Fazer commit e push

---

### Opção 2: Manualmente

1. **Salve as screenshots** em:
   ```
   /Users/luccalacerda/Desktop/YMSPORTS/ym-sports/public/screenshots/
   ```

2. **Nomeie as imagens**:
   ```
   dashboard.png
   treinos.png
   calendario.png
   perfil.png
   ranking.png
   nutricao.png
   conquistas.png
   ```

3. **Formato recomendado**:
   - PNG (melhor qualidade) ou JPG
   - Tamanho: 1080x2400 (resolução de celular)
   - Peso: idealmente < 500KB cada

---

## 🎨 ONDE APARECE NA LANDING

### Localização no Código

```typescript
// src/pages/Index.tsx (linha ~250-300)

<section className="py-20 px-4 relative overflow-hidden">
  <div className="container mx-auto">
    <h2 className="text-4xl font-astro">
      Veja o APP em Ação
    </h2>
    
    {/* Carousel de Screenshots */}
    <Carousel>
      <CarouselContent>
        <CarouselItem>
          <img src="/screenshots/dashboard.png" />
        </CarouselItem>
        <CarouselItem>
          <img src="/screenshots/treinos.png" />
        </CarouselItem>
        {/* ... mais screenshots */}
      </CarouselContent>
    </Carousel>
  </div>
</section>
```

---

## 📊 ESPECIFICAÇÕES TÉCNICAS

### Tamanhos Ideais

```
MOBILE (9:16 - vertical):
- 1080 x 2400 pixels (Full HD+)
- 1170 x 2532 pixels (iPhone 13/14 Pro)
- 1284 x 2778 pixels (iPhone 14 Pro Max)

TABLET:
- 1620 x 2160 pixels (iPad Pro)
```

### Formatos Suportados

```
✅ PNG (melhor para UI com texto)
✅ JPG/JPEG (menor tamanho de arquivo)
✅ WebP (melhor compressão moderna)
❌ GIF (não recomendado para screenshots)
```

### Otimização

Se as imagens estiverem muito grandes:

```bash
# Redimensionar para 1080x2400
# Comprimir para ~300-500KB cada
# Converter para WebP (opcional)
```

---

## 🎬 SCREENSHOTS RECOMENDADOS

### 1. Dashboard Principal
- **O que mostrar**: Visão geral do app
- **Destaque**: Cards de treinos, eventos, progresso
- **Nome**: `dashboard.png`

### 2. Tela de Treinos
- **O que mostrar**: Lista de treinos da semana
- **Destaque**: Treinos gerados por IA, exercícios
- **Nome**: `treinos.png`

### 3. Treino Individual
- **O que mostrar**: Detalhes de um treino específico
- **Destaque**: Exercícios, séries, repetições, vídeos
- **Nome**: `treino-detalhes.png`

### 4. Calendário
- **O que mostrar**: Calendário com eventos marcados
- **Destaque**: Jogos, treinos, eventos importantes
- **Nome**: `calendario.png`

### 5. Perfil do Atleta
- **O que mostrar**: Perfil completo
- **Destaque**: Avatar, stats, nível, conquistas
- **Nome**: `perfil.png`

### 6. Rankings
- **O que mostrar**: Classificação nacional/regional
- **Destaque**: Posição do usuário, top atletas
- **Nome**: `ranking.png`

### 7. Plano Nutricional
- **O que mostrar**: Plano gerado por IA
- **Destaque**: Refeições, calorias, macros
- **Nome**: `nutricao.png`

### 8. Conquistas
- **O que mostrar**: Badges desbloqueados
- **Destaque**: Progresso, próximas conquistas
- **Nome**: `conquistas.png`

---

## 🚀 EXEMPLO DE USO

### Depois que você enviar as fotos:

```typescript
// Eu vou atualizar o código assim:

const screenshots = [
  {
    src: "/screenshots/dashboard.png",
    alt: "Dashboard YM Sports - Visão geral do atleta",
    title: "Dashboard Completo"
  },
  {
    src: "/screenshots/treinos.png",
    alt: "Treinos gerados por IA",
    title: "Treinos Inteligentes"
  },
  {
    src: "/screenshots/calendario.png",
    alt: "Calendário de eventos e jogos",
    title: "Calendário de Eventos"
  },
  // ... mais screenshots
];

// Renderizar no carousel
{screenshots.map((screenshot, index) => (
  <CarouselItem key={index}>
    <div className="relative">
      <img 
        src={screenshot.src}
        alt={screenshot.alt}
        className="rounded-xl shadow-2xl"
      />
      <h3>{screenshot.title}</h3>
    </div>
  </CarouselItem>
))}
```

---

## 💡 DICAS PARA SCREENSHOTS PERFEITAS

### Antes de Tirar:

1. ✅ **Logout e crie conta de teste** com dados bonitos
2. ✅ **Preencha dados completos** (avatar, nome, stats)
3. ✅ **Gere treinos de exemplo** para popular
4. ✅ **Adicione eventos no calendário**
5. ✅ **Desbloqueie algumas conquistas**
6. ✅ **Use tema dark** (mais bonito para marketing)

### Durante o Screenshot:

1. ✅ **Esconda barra de status** (hora, bateria) se possível
2. ✅ **Scroll até a parte mais importante**
3. ✅ **Evite erros ou loading states**
4. ✅ **Use dados realistas** (não "teste teste")
5. ✅ **Tire múltiplos ângulos** da mesma tela

### Depois:

1. ✅ **Corte bordas desnecessárias**
2. ✅ **Verifique se não tem informação sensível**
3. ✅ **Renomeie com nomes descritivos**
4. ✅ **Organize em uma pasta**

---

## 🎨 EFEITOS VISUAIS (Automáticos)

Quando você adicionar as fotos, eu vou aplicar:

```css
/* Mockup de celular */
- Border radius arredondado
- Shadow 3D
- Hover effect (scale + glow)
- Animação de entrada

/* Carousel */
- Autoplay suave
- Transição fade
- Indicadores de progresso
- Navegação por setas

/* Responsivo */
- Desktop: 3 screenshots visíveis
- Tablet: 2 screenshots
- Mobile: 1 screenshot
```

---

## 📦 ESTRUTURA FINAL

```
public/
├── hero-video.mp4 ✅ (vídeo de intro)
├── tutorials/
│   ├── ios-install.mp4 ✅ (tutorial iOS)
│   └── android-install.mp4 ✅ (tutorial Android)
└── screenshots/ ⏳ (aguardando suas fotos)
    ├── dashboard.png
    ├── treinos.png
    ├── treino-detalhes.png
    ├── calendario.png
    ├── perfil.png
    ├── ranking.png
    ├── nutricao.png
    └── conquistas.png
```

---

## ✅ CHECKLIST

Antes de enviar, verifique:

- [ ] Screenshots em boa resolução (1080x2400+)
- [ ] Todas as telas principais cobertas
- [ ] Dados de exemplo realistas
- [ ] Sem informações sensíveis visíveis
- [ ] Tema consistente (dark mode)
- [ ] Formato PNG ou JPG
- [ ] Tamanho < 500KB por imagem (se possível)
- [ ] Nomes descritivos nos arquivos

---

## 🚀 QUANDO ESTIVER PRONTO

Envie aqui no chat:
```
Tenho X screenshots para adicionar na landing page
```

E anexe todas as imagens de uma vez! Eu vou:
1. Copiar para a pasta correta
2. Atualizar o código
3. Testar localmente
4. Fazer commit e push
5. Você verá as fotos ao vivo! 🎉

---

**Última atualização**: 03/02/2026  
**Status**: ⏳ Aguardando screenshots
