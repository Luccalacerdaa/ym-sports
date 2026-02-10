-- Corrigir políticas de acesso ao bucket portfolio-photos
-- Permite que usuários façam upload e leiam suas próprias fotos

-- Garantir que o bucket existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-photos', 'portfolio-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can upload own portfolio photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view portfolio photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own portfolio photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own portfolio photos" ON storage.objects;

-- Política: Usuários podem fazer upload de suas próprias fotos
CREATE POLICY "Users can upload own portfolio photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-photos' AND
    (storage.foldername(name))[1] = 'profile' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Política: Qualquer um pode visualizar fotos de portfólio (públicas)
CREATE POLICY "Public can view portfolio photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'portfolio-photos');

-- Política: Usuários podem atualizar suas próprias fotos
CREATE POLICY "Users can update own portfolio photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-photos' AND
    (storage.foldername(name))[1] = 'profile' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Política: Usuários podem deletar suas próprias fotos
CREATE POLICY "Users can delete own portfolio photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-photos' AND
    (storage.foldername(name))[1] = 'profile' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Garantir que a política de galeria também funciona
DROP POLICY IF EXISTS "Users can upload gallery photos" ON storage.objects;

CREATE POLICY "Users can upload gallery photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-photos' AND
    (storage.foldername(name))[1] = 'gallery'
  );

COMMENT ON POLICY "Users can upload own portfolio photos" ON storage.objects IS 'Permite upload de fotos de perfil do portfólio';
COMMENT ON POLICY "Public can view portfolio photos" ON storage.objects IS 'Fotos de portfólio são públicas';
