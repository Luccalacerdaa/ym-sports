#!/usr/bin/env python3
"""
Script para enviar notificações push via API do YM Sports
Uso: python send-notification.py <user_id> <tipo>
"""

import sys
import json
import requests
from datetime import datetime

# Configurações
API_URL = "https://ym-sports.vercel.app/api/notify"

# Tipos de notificação
NOTIFICATION_TYPES = {
    "morning": {
        "title": "💪 Bom dia, atleta!",
        "body": "Hora de começar o dia com energia! Vamos treinar hoje?",
        "url": "/dashboard"
    },
    "workout": {
        "title": "🏋️ Hora do Treino!",
        "body": "Seu treino está te esperando. Vamos nessa!",
        "url": "/dashboard/training"
    },
    "hydration": {
        "title": "💧 Hidratação",
        "body": "Já bebeu água hoje? Mantenha-se hidratado!",
        "url": "/dashboard/nutrition"
    },
    "evening": {
        "title": "🌙 Boa Noite!",
        "body": "Descanse bem para conquistar seus objetivos amanhã!",
        "url": "/dashboard/motivational"
    },
    "test": {
        "title": "🧪 Teste YM Sports",
        "body": "Notificação de teste via Python funcionando perfeitamente! ✅",
        "url": "/dashboard"
    }
}

def print_header():
    """Imprime cabeçalho"""
    print("━" * 60)
    print("📱 YM Sports - Envio de Notificações (Python)")
    print("━" * 60)

def print_divider():
    """Imprime divisor"""
    print("━" * 60)

def show_help():
    """Mostra ajuda"""
    print_header()
    print()
    print("Uso:")
    print(f"  {sys.argv[0]} <user_id> <tipo>")
    print()
    print("Tipos disponíveis:")
    for tipo, data in NOTIFICATION_TYPES.items():
        print(f"  {tipo:12} - {data['title']}")
    print()
    print("Exemplos:")
    print(f"  {sys.argv[0]} 45610e6d-f5f5-4540-912d-a5c9a361e20f workout")
    print(f"  {sys.argv[0]} 45610e6d-f5f5-4540-912d-a5c9a361e20f test")
    print()
    print("Envio personalizado:")
    print(f"  python send-notification.py SEU_USER_ID custom \\")
    print(f"    --title '🎉 Parabéns' \\")
    print(f"    --body 'Você é incrível!' \\")
    print(f"    --url '/dashboard'")
    print()
    print_divider()

def send_notification(user_id, notification_type, custom_title=None, custom_body=None, custom_url=None):
    """Envia notificação via API"""
    
    # Buscar dados da notificação
    if notification_type == "custom":
        if not custom_title or not custom_body:
            print("❌ Erro: Para tipo 'custom', forneça --title e --body")
            return False
        
        title = custom_title
        body = custom_body
        url = custom_url or "/dashboard"
    elif notification_type in NOTIFICATION_TYPES:
        data = NOTIFICATION_TYPES[notification_type]
        title = data["title"]
        body = data["body"]
        url = data["url"]
    else:
        print(f"❌ Tipo inválido: {notification_type}")
        print("Use --help para ver tipos disponíveis")
        return False
    
    # Preparar payload
    payload = {
        "user_id": user_id,
        "title": title,
        "body": body,
        "url": url
    }
    
    # Imprimir informações
    print_header()
    print()
    print(f"👤 Usuário: {user_id[:36]}")
    print(f"📝 Título: {title}")
    print(f"💬 Mensagem: {body}")
    print(f"🔗 URL: {url}")
    print()
    print("📤 Enviando...")
    print()
    
    try:
        # Enviar requisição
        response = requests.post(
            API_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_divider()
        
        # Verificar resultado
        if response.status_code == 200:
            result = response.json()
            
            print("✅ Notificação enviada com sucesso!")
            print()
            print("Resultado:")
            print(f"  ✅ Enviadas: {result.get('sent', 0)}")
            print(f"  ❌ Falharam: {result.get('failed', 0)}")
            print(f"  📱 Total de dispositivos: {result.get('total', 0)}")
            
            if result.get('details'):
                print()
                print("Detalhes:")
                for i, detail in enumerate(result['details'], 1):
                    status = "✅" if detail.get('success') else "❌"
                    endpoint = detail.get('endpoint', 'unknown')[:50]
                    print(f"  {status} Dispositivo {i}: {endpoint}...")
            
            print()
            print_divider()
            return True
        else:
            print(f"❌ Erro ao enviar notificação (HTTP {response.status_code})")
            print()
            print("Resposta:")
            try:
                error_data = response.json()
                print(json.dumps(error_data, indent=2))
            except:
                print(response.text)
            print()
            print_divider()
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Erro: Timeout ao conectar com a API")
        print_divider()
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar com a API")
        print("   Verifique sua conexão com a internet")
        print_divider()
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        print_divider()
        return False

def main():
    """Função principal"""
    
    # Verificar argumentos
    if len(sys.argv) < 2 or sys.argv[1] in ["-h", "--help", "help"]:
        show_help()
        sys.exit(0)
    
    if len(sys.argv) < 3:
        print("❌ Erro: Argumentos insuficientes")
        print()
        show_help()
        sys.exit(1)
    
    user_id = sys.argv[1]
    notification_type = sys.argv[2]
    
    # Parse argumentos opcionais
    custom_title = None
    custom_body = None
    custom_url = None
    
    i = 3
    while i < len(sys.argv):
        if sys.argv[i] == "--title" and i + 1 < len(sys.argv):
            custom_title = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--body" and i + 1 < len(sys.argv):
            custom_body = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--url" and i + 1 < len(sys.argv):
            custom_url = sys.argv[i + 1]
            i += 2
        else:
            i += 1
    
    # Enviar notificação
    success = send_notification(
        user_id,
        notification_type,
        custom_title,
        custom_body,
        custom_url
    )
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

