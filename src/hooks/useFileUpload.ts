import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface UseFileUploadReturn {
  uploadFile: (file: File, bucket: 'portfolio-photos' | 'portfolio-videos', folder?: string) => Promise<string | null>;
  uploadMultipleFiles: (files: File[], bucket: 'portfolio-photos' | 'portfolio-videos', folder?: string) => Promise<string[]>;
  deleteFile: (url: string, bucket: 'portfolio-photos' | 'portfolio-videos') => Promise<boolean>;
  compressImage: (file: File, maxWidth?: number, quality?: number) => Promise<File>;
  isUploading: boolean;
  uploadProgress: UploadProgress[];
}

export const useFileUpload = (): UseFileUploadReturn => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  // Função para comprimir imagens
  const compressImage = async (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular dimensões mantendo proporção
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Função para fazer upload de um arquivo
  const uploadFile = async (
    file: File, 
    bucket: 'portfolio-photos' | 'portfolio-videos', 
    folder?: string
  ): Promise<string | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      setIsUploading(true);

      // Comprimir imagem se for foto
      let fileToUpload = file;
      if (bucket === 'portfolio-photos' && file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file);
        console.log(`Imagem comprimida: ${file.size} → ${fileToUpload.size} bytes`);
      }

      // Gerar nome único para o arquivo
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;

      // Adicionar ao progresso
      const progressItem: UploadProgress = {
        file: fileToUpload,
        progress: 0,
        status: 'uploading'
      };
      setUploadProgress(prev => [...prev, progressItem]);

      // Fazer upload
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        setUploadProgress(prev => 
          prev.map(item => 
            item.file === fileToUpload 
              ? { ...item, status: 'error', error: error.message }
              : item
          )
        );
        toast.error(`Erro no upload: ${error.message}`);
        return null;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;

      // Atualizar progresso
      setUploadProgress(prev => 
        prev.map(item => 
          item.file === fileToUpload 
            ? { ...item, status: 'completed', progress: 100, url: publicUrl }
            : item
        )
      );

      toast.success('Arquivo enviado com sucesso!');
      return publicUrl;

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error('Erro inesperado no upload');
      return null;
    } finally {
      setIsUploading(false);
      // Limpar progresso após 3 segundos
      setTimeout(() => {
        setUploadProgress([]);
      }, 3000);
    }
  };

  // Função para fazer upload de múltiplos arquivos
  const uploadMultipleFiles = async (
    files: File[], 
    bucket: 'portfolio-photos' | 'portfolio-videos', 
    folder?: string
  ): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const file of files) {
      const url = await uploadFile(file, bucket, folder);
      if (url) {
        urls.push(url);
      }
    }

    return urls;
  };

  // Função para deletar arquivo
  const deleteFile = async (
    url: string, 
    bucket: 'portfolio-photos' | 'portfolio-videos'
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      // Extrair path da URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar arquivo:', error);
        toast.error('Erro ao deletar arquivo');
        return false;
      }

      toast.success('Arquivo deletado com sucesso!');
      return true;

    } catch (error: any) {
      console.error('Erro ao deletar arquivo:', error);
      toast.error('Erro inesperado ao deletar arquivo');
      return false;
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    compressImage,
    isUploading,
    uploadProgress
  };
};
