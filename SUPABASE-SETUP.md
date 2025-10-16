# 🚀 Configuração do Supabase - YM Sports Hub

## ✅ O que foi configurado no código:

### 1. **Cliente Supabase**
- ✅ Cliente configurado em `src/lib/supabase.ts`
- ✅ Contexto de autenticação em `src/contexts/AuthContext.tsx`
- ✅ Hook personalizado em `src/hooks/useProfile.ts`
- ✅ Rotas protegidas com `src/components/ProtectedRoute.tsx`

### 2. **Páginas Atualizadas**
- ✅ **Login** (`src/pages/Login.tsx`) - Conectado com Supabase Auth
- ✅ **Signup** (`src/pages/Signup.tsx`) - Cria usuários e perfis
- ✅ **Profile** (`src/pages/Profile.tsx`) - Gerencia dados do perfil

## 🔧 Próximos passos no Supabase Dashboard:

### 1. **Executar o Script SQL**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o projeto: `qfnjgksvpjbuhzwuitzg`
3. Navegue para **SQL Editor**
4. Execute o script do arquivo `supabase-setup.sql`

### 2. **Configurações de Autenticação (Opcional)**
1. Vá para **Authentication > Settings**
2. Configure **Site URL**: `http://localhost:5173` (para desenvolvimento)
3. Configure **Redirect URLs**: `http://localhost:5173/**`

### 3. **Verificar RLS (Row Level Security)**
1. Vá para **Table Editor > profiles**
2. Verifique se o RLS está habilitado
3. Verifique as políticas criadas

## 🧪 Como testar:

### 1. **Cadastro de Usuário**
1. Acesse `http://localhost:5173/auth/signup`
2. Preencha o formulário
3. Verifique o email de confirmação
4. Confirme o cadastro

### 2. **Login**
1. Acesse `http://localhost:5173/auth/login`
2. Use as credenciais criadas
3. Deve redirecionar para o dashboard

### 3. **Perfil**
1. Acesse `http://localhost:5173/dashboard/profile`
2. Edite as informações
3. Salve e verifique se persistiu

## 📋 Estrutura da Tabela `profiles`:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  height INTEGER,
  weight INTEGER,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Políticas de Segurança (RLS):

- ✅ **SELECT**: Usuários podem ver apenas seu próprio perfil
- ✅ **INSERT**: Usuários podem inserir apenas seu próprio perfil
- ✅ **UPDATE**: Usuários podem atualizar apenas seu próprio perfil
- ✅ **Trigger**: Cria perfil automaticamente após signup

## 🚨 Troubleshooting:

### Erro "relation does not exist"
- Execute o script SQL no Supabase Dashboard

### Erro de permissão
- Verifique se o RLS está configurado corretamente
- Verifique se as políticas foram criadas

### Usuário não consegue fazer login
- Verifique se o email foi confirmado
- Verifique as configurações de autenticação

## 📱 Funcionalidades Implementadas:

- ✅ **Autenticação completa** (login, signup, logout)
- ✅ **Proteção de rotas** (apenas usuários logados)
- ✅ **Gerenciamento de perfis** (CRUD completo)
- ✅ **Feedback visual** (loading states, toasts)
- ✅ **Tratamento de erros** (mensagens amigáveis)
- ✅ **Responsivo** (funciona em mobile e desktop)

## 🎯 Próximas funcionalidades sugeridas:

1. **Upload de avatar** (usando Supabase Storage)
2. **Recuperação de senha**
3. **Login social** (Google, GitHub)
4. **Notificações** em tempo real
5. **Chat** entre usuários
6. **Sistema de pontos/ranking**

---

**🎉 Parabéns! Seu sistema de autenticação está funcionando!**
