#!/bin/bash

# Script para gerar ícones PNG a partir do SVG
# Requer ImageMagick: brew install imagemagick

# Diretório base
BASE_DIR=$(dirname "$0")
cd $BASE_DIR/..

# Verificar se o SVG existe
if [ ! -f "logo.svg" ]; then
  echo "Erro: logo.svg não encontrado!"
  exit 1
fi

# Tamanhos dos ícones
SIZES=(48 72 96 144 192 512)

# Gerar ícones
for SIZE in "${SIZES[@]}"; do
  echo "Gerando icon-${SIZE}.png..."
  convert -background white -density 600 -resize ${SIZE}x${SIZE} logo.svg icons/icon-${SIZE}.png
done

# Gerar favicon
echo "Gerando favicon.ico..."
convert -background white -density 600 -resize 32x32 logo.svg favicon.ico

echo "✅ Ícones gerados com sucesso!"
