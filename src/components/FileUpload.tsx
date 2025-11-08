import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFileUpload, UploadProgress } from '@/hooks/useFileUpload';
import { Upload, X, Image, Video, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  accept: 'images' | 'videos' | 'all';
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete: (urls: string[]) => void;
  onUploadStart?: () => void;
  className?: string;
  bucket: 'portfolio-photos' | 'portfolio-videos';
  folder?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxFiles = 5,
  onUploadComplete,
  onUploadStart,
  className = '',
  bucket,
  folder
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const { uploadFile, uploadMultipleFiles, isUploading, uploadProgress } = useFileUpload();

  // Definir tipos de arquivo aceitos
  const getAcceptTypes = () => {
    switch (accept) {
      case 'images':
        return 'image/jpeg,image/png,image/webp,image/gif';
      case 'videos':
        return 'video/mp4,video/webm,video/quicktime';
      case 'all':
        return 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';
      default:
        return '';
    }
  };

  // Validar arquivo
  const validateFile = (file: File): boolean => {
    const maxSize = bucket === 'portfolio-photos' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB para fotos, 100MB para vídeos
    
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    const acceptedTypes = getAcceptTypes().split(',');
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado');
      return false;
    }

    return true;
  };

  // Criar preview do arquivo
  const createPreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Processar arquivos selecionados
  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    const validFiles = fileArray.filter(validateFile);
    
    if (validFiles.length === 0) return;

    // Criar previews
    const newPreviews = validFiles.map(file => ({
      file,
      preview: createPreview(file)
    }));

    setPreviews(newPreviews);
  };

  // Upload dos arquivos
  const handleUpload = async () => {
    if (previews.length === 0) return;

    onUploadStart?.();

    try {
      const files = previews.map(p => p.file);
      let urls: string[];

      if (multiple) {
        urls = await uploadMultipleFiles(files, bucket, folder);
      } else {
        const url = await uploadFile(files[0], bucket, folder);
        urls = url ? [url] : [];
      }

      if (urls.length > 0) {
        onUploadComplete(urls);
        setPreviews([]);
        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro no upload dos arquivos');
    }
  };

  // Remover preview
  const removePreview = (index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // Renderizar ícone do arquivo
  const renderFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-8 w-8 text-purple-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Upload */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragOver 
            ? 'border-yellow-500 bg-yellow-50' 
            : 'border-gray-300 hover:border-yellow-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptTypes()}
            multiple={multiple}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
          
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {accept === 'images' ? 'Enviar Fotos' : accept === 'videos' ? 'Enviar Vídeos' : 'Enviar Arquivos'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            Arraste e solte ou clique para selecionar
            {multiple && ` (máximo ${maxFiles} arquivos)`}
          </p>
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Selecionar Arquivos
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            {accept === 'images' && 'JPG, PNG, WebP, GIF até 10MB'}
            {accept === 'videos' && 'MP4, WebM, MOV até 100MB'}
            {accept === 'all' && 'Imagens até 10MB, Vídeos até 100MB'}
          </p>
        </CardContent>
      </Card>

      {/* Previews dos Arquivos */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Arquivos Selecionados:</h4>
          <div className="grid gap-2">
            {previews.map((preview, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-3">
                  {preview.file.type.startsWith('image/') ? (
                    <img 
                      src={preview.preview} 
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      {renderFileIcon(preview.file)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {preview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(preview.file.size)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePreview(index)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            onClick={handleUpload}
            disabled={isUploading || previews.length === 0}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              `Enviar ${previews.length} arquivo${previews.length > 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      )}

      {/* Progresso do Upload */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Progresso do Upload:</h4>
          {uploadProgress.map((progress, index) => (
            <Card key={index} className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    {progress.file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {progress.status === 'completed' ? '✅' : 
                     progress.status === 'error' ? '❌' : '⏳'}
                  </span>
                </div>
                
                {progress.status === 'uploading' && (
                  <Progress value={progress.progress} className="h-2" />
                )}
                
                {progress.status === 'error' && (
                  <p className="text-xs text-red-600">{progress.error}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
