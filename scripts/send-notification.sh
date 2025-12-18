#!/bin/bash

# Script para enviar notificações via curl
# Uso: ./scripts/send-notification.sh <user_id> <type>

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
API_URL="https://ym-sports.vercel.app/api/notify"

# Função de ajuda
show_help() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📱 YM Sports - Envio de Notificações${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Uso:"
    echo "  $0 <user_id> <tipo>"
    echo ""
    echo "Tipos disponíveis:"
    echo "  morning     - 💪 Bom dia, atleta!"
    echo "  workout     - 🏋️ Hora do Treino!"
    echo "  hydration   - 💧 Hidratação"
    echo "  evening     - 🌙 Boa Noite!"
    echo "  test        - 🧪 Teste"
    echo "  custom      - 📝 Mensagem personalizada"
    echo "  all-users   - 📢 Enviar para todos os usuários"
    echo ""
    echo "Exemplos:"
    echo "  $0 45610e6d-f5f5-4540-912d-a5c9a361e20f workout"
    echo "  $0 45610e6d-f5f5-4540-912d-a5c9a361e20f test"
    echo "  $0 all all-users"
    echo ""
    echo "Envio personalizado:"
    echo "  TITLE=\"🎉 Parabéns\" BODY=\"Você é incrível!\" URL=\"/dashboard\" $0 <user_id> custom"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Verificar argumentos
if [ $# -lt 2 ]; then
    show_help
    exit 1
fi

USER_ID="$1"
TYPE="$2"

# Definir título, corpo e URL baseado no tipo
case $TYPE in
    morning)
        TITLE="💪 Bom dia, atleta!"
        BODY="Hora de começar o dia com energia! Vamos treinar hoje?"
        URL="/dashboard"
        ;;
    workout)
        TITLE="🏋️ Hora do Treino!"
        BODY="Seu treino está te esperando. Vamos nessa!"
        URL="/dashboard/training"
        ;;
    hydration)
        TITLE="💧 Hidratação"
        BODY="Já bebeu água hoje? Mantenha-se hidratado!"
        URL="/dashboard/nutrition"
        ;;
    evening)
        TITLE="🌙 Boa Noite!"
        BODY="Descanse bem para conquistar seus objetivos amanhã!"
        URL="/dashboard/motivational"
        ;;
    test)
        TITLE="🧪 Teste YM Sports"
        BODY="Notificação de teste via curl funcionando perfeitamente! ✅"
        URL="/dashboard"
        ;;
    custom)
        TITLE="${TITLE:-📝 YM Sports}"
        BODY="${BODY:-Você tem uma nova notificação!}"
        URL="${URL:-/dashboard}"
        ;;
    all-users)
        echo -e "${YELLOW}⚠️  Enviando para TODOS os usuários...${NC}"
        # Aqui você implementaria a lógica para buscar todos os usuários
        echo -e "${RED}❌ Funcionalidade ainda não implementada${NC}"
        echo "   Use o GitHub Actions para enviar para todos"
        exit 1
        ;;
    *)
        echo -e "${RED}❌ Tipo inválido: $TYPE${NC}"
        show_help
        exit 1
        ;;
esac

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📤 Enviando Notificação${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}👤 Usuário:${NC} ${USER_ID:0:36}"
echo -e "${YELLOW}📝 Título:${NC} $TITLE"
echo -e "${YELLOW}💬 Mensagem:${NC} $BODY"
echo -e "${YELLOW}🔗 URL:${NC} $URL"
echo ""
echo -e "${BLUE}Enviando...${NC}"
echo ""

# Enviar notificação
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"user_id\": \"$USER_ID\",
        \"title\": \"$TITLE\",
        \"body\": \"$BODY\",
        \"url\": \"$URL\"
    }")

# Separar resposta e código HTTP
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY_RESPONSE=$(echo "$RESPONSE" | head -n-1)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar resultado
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Notificação enviada com sucesso!${NC}"
    echo ""
    echo "Resposta:"
    echo "$BODY_RESPONSE" | jq '.' 2>/dev/null || echo "$BODY_RESPONSE"
else
    echo -e "${RED}❌ Erro ao enviar notificação (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Resposta:"
    echo "$BODY_RESPONSE"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

