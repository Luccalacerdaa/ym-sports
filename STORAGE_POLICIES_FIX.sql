-- Corrigir políticas de acesso ao bucket portfolio-photos
-- IMPORTANTE: Execute este SQL manualmente no Dashboard do Supabase

-- 1) Primeiro, vá em Storage > portfolio-photos > Policies
-- 2) Delete todas as policies existentes manualmente
-- 3) Depois execute este SQL:

-- Garantir que o bucket existe e é público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'portfolio-photos';

-- Política 1: Qualquer usuário autenticado pode fazer upload
CREATE POLICY "Authenticated users can upload portfolio photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio-photos');

-- Política 2: Qualquer um pode visualizar (público)
CREATE POLICY "Anyone can view portfolio photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolio-photos');

-- Política 3: Usuários autenticados podem atualizar/deletar
CREATE POLICY "Authenticated users can manage portfolio photos"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'portfolio-photos')
  WITH CHECK (bucket_id = 'portfolio-photos');
