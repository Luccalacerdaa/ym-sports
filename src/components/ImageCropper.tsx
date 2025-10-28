import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Check, X } from 'lucide-react';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  imageSrc: string;
}

export function ImageCropper({ open, onClose, onCropComplete, imageSrc }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const cropperRef = useRef<any>(null);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onRotationChange = (rotation: number) => {
    setRotation(rotation);
  };

  const onCropCompleted = useCallback(
    async (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
      onClose();
    } catch (e) {
      console.error('Error creating cropped image:', e);
    }
  };

  /**
   * Creates a cropped image based on the crop area and rotation
   */
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<string> => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      // Definir um tamanho fixo para o resultado final
      const size = Math.min(image.width, image.height);
      const finalSize = 300; // Tamanho final da imagem

      // Definir dimensões do canvas
      canvas.width = finalSize;
      canvas.height = finalSize;

      // Preencher com fundo transparente
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, finalSize, finalSize);

      // Criar um caminho circular para recorte
      ctx.beginPath();
      ctx.arc(finalSize / 2, finalSize / 2, finalSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Calcular proporções para centralizar a imagem recortada
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Ajustar as coordenadas do recorte
      const cropX = pixelCrop.x * scaleX;
      const cropY = pixelCrop.y * scaleY;
      const cropWidth = pixelCrop.width * scaleX;
      const cropHeight = pixelCrop.height * scaleY;

      // Calcular o centro da área de recorte
      const centerX = cropX + cropWidth / 2;
      const centerY = cropY + cropHeight / 2;

      // Salvar o estado atual do contexto
      ctx.save();

      // Mover para o centro do canvas
      ctx.translate(finalSize / 2, finalSize / 2);
      
      // Aplicar rotação
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Calcular a escala para ajustar a área recortada ao tamanho final
      const scale = Math.max(
        finalSize / cropWidth,
        finalSize / cropHeight
      );

      // Desenhar a imagem centralizada na área recortada
      ctx.drawImage(
        image,
        centerX - cropWidth / 2, // Centralizar horizontalmente
        centerY - cropHeight / 2, // Centralizar verticalmente
        cropWidth,
        cropHeight,
        -finalSize / 2, // Posição x no canvas
        -finalSize / 2, // Posição y no canvas
        finalSize, // Largura no canvas
        finalSize // Altura no canvas
      );

      // Restaurar o estado do contexto
      ctx.restore();

      // Retornar a URL de dados da imagem recortada
      return canvas.toDataURL('image/jpeg');
    } catch (error) {
      console.error('Erro ao recortar imagem:', error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
        </DialogHeader>
      <div className="relative h-80 w-full overflow-hidden rounded-md">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid={true}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleted}
          onZoomChange={onZoomChange}
          ref={cropperRef}
          style={{
            containerStyle: {
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#000'
            },
            cropAreaStyle: {
              color: 'rgba(255, 107, 0, 0.7)',
              border: '2px solid #FF6B00',
              boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.7)'
            },
            mediaStyle: {
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain'
            }
          }}
        />
      </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Zoom</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(Math.max(1, zoom - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="w-32 md:w-48"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rotação</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRotation((rotation - 90) % 360)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={(value) => setRotation(value[0])}
                className="w-32 md:w-48"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRotation((rotation + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={createCroppedImage}>
            <Check className="h-4 w-4 mr-2" />
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
