# 📊 Como Verificar Dispositivos Cadastrados para Notificações

## 🎯 Objetivo

Este documento explica como verificar quantos dispositivos estão cadastrados para receber notificações push e identificar quais precisam ser atualizados para o novo sistema.

---

## 🔍 API de Listagem de Dispositivos

### **Endpoint:** `/api/list-devices`

Esta API lista TODOS os dispositivos cadastrados no banco de dados e fornece estatísticas sobre o sistema.

### **Como Usar:**

#### **Opção 1: Pelo Navegador (mais simples)**

1. Abra o navegador
2. Acesse: `https://seu-dominio.vercel.app/api/list-devices`
   - **Exemplo local**: `http://localhost:5173/api/list-devices`
   - **Exemplo produção**: `https://ym-sports.vercel.app/api/list-devices`

#### **Opção 2: Via cURL (linha de comando)**

```bash
curl https://seu-dominio.vercel.app/api/list-devices
```

#### **Opção 3: Via JavaScript (Console do navegador)**

```javascript
fetch('/api/list-devices')
  .then(res => res.json())
  .then(data => console.table(data));
```

---

## 📋 Resposta da API

A API retorna um JSON com as seguintes informações:

```json
{
  "success": true,
  "statistics": {
    "total_devices": 15,           // Total de dispositivos cadastrados
    "unique_users": 8,              // Número de usuários únicos
    "new_system": 10,               // Dispositivos no novo sistema (com updated_at)
    "old_system": 5,                // Dispositivos no sistema antigo (sem updated_at)
    "percentage_updated": 67        // % de dispositivos atualizados
  },
  "devices_by_user": {
    "uuid-usuario-1": [
      {
        "id": "uuid-dispositivo-1",
        "endpoint_preview": "https://fcm.googleapis.com/fcm/send/...",
        "created_at": "2025-01-01T10:00:00Z",
        "updated_at": "2025-01-31T15:00:00Z",
        "is_old": false              // false = novo sistema ✅
      }
    ],
    "uuid-usuario-2": [
      {
        "id": "uuid-dispositivo-2",
        "endpoint_preview": "https://fcm.googleapis.com/fcm/send/...",
        "created_at": "2024-12-20T08:00:00Z",
        "updated_at": null,
        "is_old": true               // true = sistema antigo ⚠️
      }
    ]
  },
  "old_devices": [
    {
      "id": "uuid-dispositivo-2",
      "user_id": "uuid-usuario-2",
      "endpoint_preview": "https://fcm.googleapis.com/fcm/send/...",
      "created_at": "2024-12-20T08:00:00Z"
    }
  ],
  "timestamp": "2025-01-31T20:00:00Z"
}
```

---

## 🔄 Sistema de Atualização Automática

### **Como Funciona:**

Quando um usuário com uma subscription **antiga** (sistema anterior) visita o site:

1. ✅ O hook `usePushSimple` detecta automaticamente que há uma subscription antiga
2. 🔄 Atualiza a subscription no backend automaticamente
3. ✅ A notificação passa a funcionar com o novo sistema

### **Identificação de Subscriptions Antigas:**

- **Sistema ANTIGO**: Subscriptions **SEM** o campo `updated_at`
- **Sistema NOVO**: Subscriptions **COM** o campo `updated_at`

### **Logs no Console:**

Quando o usuário visita o site, você verá no console:

```
🔍 Verificando se subscription precisa ser atualizada...
🔄 Subscription antiga detectada! Atualizando automaticamente...
✅ Subscription atualizada automaticamente para o novo sistema!
```

---

## 📊 Exemplo de Uso Prático

### **1. Verificar Status Geral:**

```bash
curl https://ym-sports.vercel.app/api/list-devices | jq '.statistics'
```

**Resultado:**
```json
{
  "total_devices": 15,
  "unique_users": 8,
  "new_system": 10,
  "old_system": 5,
  "percentage_updated": 67
}
```

### **2. Listar Dispositivos Antigos:**

```bash
curl https://ym-sports.vercel.app/api/list-devices | jq '.old_devices'
```

**Resultado:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "uuid-usuario-1",
    "endpoint_preview": "https://fcm.googleapis.com/fcm/send/...",
    "created_at": "2024-12-20T08:00:00Z"
  }
]
```

### **3. Ver Dispositivos por Usuário:**

```bash
curl https://ym-sports.vercel.app/api/list-devices | jq '.devices_by_user["uuid-do-usuario"]'
```

---

## ⚠️ IMPORTANTE

### **Privacidade:**

- Esta API **NÃO** expõe dados sensíveis como `p256dh` ou `auth`
- Apenas mostra previews dos endpoints (primeiros 80 caracteres)
- Use apenas em **ambientes seguros** (não exponha publicamente)

### **Segurança:**

Se você quiser proteger esta API, adicione autenticação:

```javascript
// No início do handler em api/list-devices.js
if (!req.headers.authorization) {
  return res.status(401).json({ error: 'Não autorizado' });
}
```

---

## 🧪 Testar a Atualização Automática

### **Passo 1: Verificar se há dispositivos antigos**

```bash
curl https://ym-sports.vercel.app/api/list-devices | jq '.statistics.old_system'
```

Se retornar **> 0**, há dispositivos antigos.

### **Passo 2: Pedir para o usuário acessar o site**

Quando o usuário visitar o site:
- A atualização será **automática**
- Não é necessário reativar notificações manualmente

### **Passo 3: Verificar novamente**

```bash
curl https://ym-sports.vercel.app/api/list-devices | jq '.statistics'
```

O número em `old_system` deve ter **diminuído**.

---

## 🎯 Resumo

| Item | Descrição |
|------|-----------|
| **API Endpoint** | `/api/list-devices` |
| **Método** | `GET` |
| **Autenticação** | Nenhuma (adicionar se necessário) |
| **Retorno** | JSON com estatísticas e lista de dispositivos |
| **Atualização** | Automática quando usuário visita o site |
| **Identificação** | `is_old: true` = sistema antigo |

---

## 📞 Comandos Úteis

```bash
# Ver total de dispositivos
curl /api/list-devices | jq '.statistics.total_devices'

# Ver % de dispositivos atualizados
curl /api/list-devices | jq '.statistics.percentage_updated'

# Ver quantos dispositivos antigos restam
curl /api/list-devices | jq '.statistics.old_system'

# Ver todos os dispositivos de um usuário específico
curl /api/list-devices | jq '.devices_by_user["UUID_DO_USUARIO"]'
```

---

✅ **Pronto! Agora você pode monitorar e atualizar automaticamente todos os dispositivos cadastrados.**

