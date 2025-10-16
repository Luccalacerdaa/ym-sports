import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qfnjgksvpjbuhzwuitzg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmpna3N2cGpidWh6d3VpdHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxODQ5NjYsImV4cCI6MjA3NDc2MDk2Nn0.ZW-a1HlOCgzM1QwNW3o55Ik83Cve_ClfT7hJbKEus_0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções auxiliares para autenticação
export const auth = supabase.auth

// Funções auxiliares para o banco de dados
export const db = supabase

// Tipos TypeScript para o banco de dados
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name?: string
          age?: number
          height?: number
          weight?: number
          email?: string
          avatar_url?: string
          bio?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id: string
          name?: string
          age?: number
          height?: number
          weight?: number
          email?: string
          avatar_url?: string
          bio?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          height?: number
          weight?: number
          email?: string
          avatar_url?: string
          bio?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}