# 🔧 APLICAR MIGRATION - Portfolio Fields

## ❗ IMPORTANTE: Execute AGORA para resolver erro 400

### 📝 **O que esta migration faz:**

Adiciona campos faltantes à tabela `player_portfolios` que estavam causando o **erro 400** ao salvar o portfolio.

---

## 🚀 **PASSO A PASSO:**

### **1. Abrir Supabase Dashboard:**
```
https://supabase.com/dashboard/project/qfnjgksvpjbuhzwuitzg
```

### **2. Ir para SQL Editor:**
- Menu lateral esquerdo → **SQL Editor**
- Clicar em **+ New Query**

### **3. Copiar e Colar este SQL:**

```sql
-- Adicionar campos faltantes à tabela player_portfolios
-- Data: 2026-02-04
-- Motivo: Resolver erro 400 ao salvar portfolio

-- Adicionar campos de localização
ALTER TABLE player_portfolios 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Adicionar campos de mídia adicional
ALTER TABLE player_portfolios 
ADD COLUMN IF NOT EXISTS gallery_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skill_videos TEXT[] DEFAULT '{}';

-- Adicionar campo de conquistas estruturadas (JSONB)
ALTER TABLE player_portfolios 
ADD COLUMN IF NOT EXISTS achievements_data JSONB DEFAULT '{"medals": [], "championships": [], "individual_awards": []}';

-- Comentários para documentação
COMMENT ON COLUMN player_portfolios.city IS 'Cidade onde o jogador reside';
COMMENT ON COLUMN player_portfolios.state IS 'Estado onde o jogador reside';
COMMENT ON COLUMN player_portfolios.gallery_photos IS 'URLs das fotos da galeria do portfólio';
COMMENT ON COLUMN player_portfolios.skill_videos IS 'URLs dos vídeos de habilidades';
COMMENT ON COLUMN player_portfolios.achievements_data IS 'Conquistas estruturadas: medalhas, campeonatos e prêmios individuais';

-- Garantir que dados existentes tenham valores padrão
UPDATE player_portfolios 
SET 
  gallery_photos = COALESCE(gallery_photos, '{}'),
  skill_videos = COALESCE(skill_videos, '{}'),
  achievements_data = COALESCE(achievements_data, '{"medals": [], "championships": [], "individual_awards": []}')
WHERE gallery_photos IS NULL 
   OR skill_videos IS NULL 
   OR achievements_data IS NULL;
```

### **4. Executar:**
- Clicar em **Run** (ou pressionar `Ctrl+Enter`)

### **5. Verificar Sucesso:**
Você deve ver:
```
Success. No rows returned
```

---

## ✅ **RESULTADO:**

Depois de executar esta migration:

```
✅ Campo 'city' adicionado
✅ Campo 'state' adicionado
✅ Campo 'gallery_photos' adicionado (array de textos)
✅ Campo 'skill_videos' adicionado (array de textos)
✅ Campo 'achievements_data' adicionado (JSONB)
✅ Erro 400 RESOLVIDO!
✅ Portfolio salva normalmente
```

---

## 🧪 **TESTAR:**

1. Abra o app
2. Vá para **Perfil** → **Editar Portfólio**
3. Faça qualquer alteração
4. Clique em **Salvar**
5. ✅ **Deve salvar SEM erro 400!**

---

## 📁 **Localização do arquivo SQL:**

```
supabase/migrations/20260204_add_missing_portfolio_fields.sql
```

---

## ⚠️ **ATENÇÃO:**

- Esta migration é **segura** (usa `IF NOT EXISTS`)
- Pode executar **múltiplas vezes** sem problemas
- **NÃO** afeta dados existentes
- **APENAS adiciona** novos campos

---

## 🎯 **CAMPOS ADICIONADOS:**

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `city` | TEXT | NULL | Cidade do jogador |
| `state` | TEXT | NULL | Estado do jogador |
| `gallery_photos` | TEXT[] | `'{}'` | URLs das fotos da galeria |
| `skill_videos` | TEXT[] | `'{}'` | URLs dos vídeos de habilidades |
| `achievements_data` | JSONB | `'{"medals": [], ...}'` | Conquistas estruturadas |

---

## 🔥 **EXECUTE AGORA!**

Sem essa migration, o portfolio **NÃO VAI SALVAR** (erro 400).
