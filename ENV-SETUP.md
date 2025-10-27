# 🔐 Configuração de Variáveis de Ambiente

## Arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto (`ym-sports/.env.local`) com o seguinte conteúdo:

```bash
# Supabase
VITE_SUPABASE_URL=https://qfnjgksvpjbuhzwuitzg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmpna3N2cGpidWh6d3VpdHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxODQ5NjYsImV4cCI6MjA3NDc2MDk2Nn0.ZW-a1HlOCgzM1QwNW3o55Ik83Cve_ClfT7hJbKEus_0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmpna3N2cGpidWh6d3VpdHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE4NDk2NiwiZXhwIjoyMDc0NzYwOTY2fQ.nHoQhumIrKzP2nhVFUP0jhqunyRJfUUhpjDBR_htpU4

# VAPID Keys para Push Notifications
VITE_VAPID_PUBLIC_KEY=BDBXvnDx0HNqAxfC-kLOuC71Gbb_0OmEZXykwI_gbE7hKc8WwE5P5phl7BoceSwJGr5mRXtTYcfQQfjxcYG0rKM
VAPID_PRIVATE_KEY=UyV1zwxSkk9XoOvdyewFagVhkRunZ9pVtIetqvXAS3U

# OpenAI (opcional - se você tiver)
VITE_OPENAI_API_KEY=your_openai_key_here
```

## Configurar na Vercel

Para o deploy em produção, adicione as mesmas variáveis na Vercel:

```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add VITE_VAPID_PUBLIC_KEY production
vercel env add VAPID_PRIVATE_KEY production
```

Ou pelo dashboard:
👉 https://vercel.com/rota-rep/ym-sports/settings/environment-variables

