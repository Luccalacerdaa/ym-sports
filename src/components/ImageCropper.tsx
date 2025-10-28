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
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('No 2d context'));
          return;
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        // Set dimensions to double those of the image to allow for rotation
        canvas.width = safeArea;
        canvas.height = safeArea;

        // Translate canvas center to image center
        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        // Draw image at the center of the canvas
        ctx.drawImage(
          image,
          safeArea / 2 - image.width / 2,
          safeArea / 2 - image.height / 2
        );

        // Create a circular crop
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');

        if (!croppedCtx) {
          reject(new Error('No 2d context'));
          return;
        }

        // Set dimensions to the size of the crop
        const size = Math.min(pixelCrop.width, pixelCrop.height);
        croppedCanvas.width = size;
        croppedCanvas.height = size;

        // Draw a circle and clip to it
        croppedCtx.beginPath();
        croppedCtx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        croppedCtx.clip();

        // Draw the cropped image
        croppedCtx.drawImage(
          canvas,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          size,
          size
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
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleted}
            onZoomChange={onZoomChange}
            ref={cropperRef}
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
