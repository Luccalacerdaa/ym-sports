import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const usePhotoUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    if (!file) {
      setError('Nenhum arquivo selecionado');
      return null;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Apenas arquivos de imagem são permitidos');
      return null;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB');
      return null;
    }

    setUploading(true);
    setError(null);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;
      
      // Fazer upload do arquivo
      const { data, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Substituir arquivo existente
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer upload da foto';
      setError(errorMessage);
      console.error('Erro no upload:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (fileName: string): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    setUploading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase.storage
        .from('profile-photos')
        .remove([fileName]);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao deletar foto';
      setError(errorMessage);
      console.error('Erro ao deletar foto:', err);
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadPhoto,
    deletePhoto,
    uploading,
    error,
  };
};
