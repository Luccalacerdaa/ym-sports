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
  const getCroppedImg = (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        // Criar um canvas temporário para aplicar a rotação
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('No 2d context'));
          return;
        }

        // Calcular o tamanho do canvas para acomodar a imagem rotacionada
        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        // Definir as dimensões do canvas
        canvas.width = safeArea;
        canvas.height = safeArea;

        // Limpar o canvas com fundo transparente
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mover para o centro do canvas
        ctx.translate(safeArea / 2, safeArea / 2);
        
        // Aplicar rotação
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Desenhar a imagem centralizada
        ctx.drawImage(
          image,
          -image.width / 2,
          -image.height / 2,
          image.width,
          image.height
        );
        
        // Voltar à origem
        ctx.rotate(-(rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        // Criar um segundo canvas para o recorte circular
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');

        if (!croppedCtx) {
          reject(new Error('No 2d context'));
          return;
        }

        // Definir um tamanho fixo para o resultado final (300x300 é um bom tamanho para avatar)
        const finalSize = 300;
        croppedCanvas.width = finalSize;
        croppedCanvas.height = finalSize;

        // Desenhar um círculo e recortar
        croppedCtx.beginPath();
        croppedCtx.arc(finalSize / 2, finalSize / 2, finalSize / 2, 0, 2 * Math.PI);
        croppedCtx.clip();

        // Calcular a escala para ajustar a área recortada ao tamanho final
        const scale = Math.max(
          finalSize / pixelCrop.width,
          finalSize / pixelCrop.height
        );
        
        // Desenhar a área recortada no canvas final
        croppedCtx.drawImage(
          canvas,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          finalSize,
          finalSize
        );

        // Get the data URL of the cropped image
        resolve(croppedCanvas.toDataURL('image/jpeg'));
      };

      image.onerror = () => {
        reject(new Error('Could not load image'));
      };
    });
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
