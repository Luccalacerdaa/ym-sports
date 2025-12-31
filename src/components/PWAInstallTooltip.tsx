import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, 
  Download, 
  Share, 
  Plus, 
  Home,
  X,
  Play,
  Apple,
  Chrome
} from "lucide-react";
import { toast } from "sonner";

interface PWAInstallTooltipProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PWAInstallTooltip({ isOpen, onClose }: PWAInstallTooltipProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Detectar plataforma automaticamente
  useEffect(() => {
    if (isOpen) {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('mac')) {
        setSelectedPlatform('ios');
      } else if (userAgent.includes('android') || userAgent.includes('chrome')) {
        setSelectedPlatform('android');
      }
    }
  }, [isOpen]);

  const handleInstallClick = () => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      toast.success('O app já está instalado!');
      onClose();
      return;
    }

    // Mostrar instruções baseadas na plataforma
    if (selectedPlatform) {
      setShowVideo(true);
    }
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('ym-sports-pwa-tooltip-dismissed', 'true');
    toast.info('OK! Você pode instalar o app a qualquer momento nas configurações.');
    onClose();
  };

  const renderInstructions = () => {
    if (selectedPlatform === 'ios') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Apple className="h-5 w-5" />
            <h3 className="font-semibold">Como instalar no iOS (iPhone/iPad)</h3>
          </div>
          
          {showVideo ? (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black">
                <video
                  className="w-full h-auto"
                  controls
                  autoPlay
                  playsInline
                  src="/tutorials/ios-install.mov"
                >
                  Seu navegador não suporta o vídeo de instalação para iOS.
                </video>
              </div>
              
              <div className="text-sm space-y-2">
                <p className="font-medium">Passos rápidos:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Toque no ícone <Share className="inline h-4 w-4" /> (Compartilhar) na parte inferior</li>
                  <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                  <li>Toque em "Adicionar" no canto superior direito</li>
                  <li>O app YM Sports aparecerá na sua tela inicial!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <Smartphone className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                <h4 className="font-semibold mb-2">Instale o YM Sports</h4>
                <p className="text-sm text-muted-foreground">
                  Tenha acesso rápido ao app direto da sua tela inicial, 
                  sem precisar abrir o navegador!
                </p>
              </div>
              
              <Button onClick={() => setShowVideo(true)} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Ver Tutorial em Vídeo
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (selectedPlatform === 'android') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Chrome className="h-5 w-5" />
            <h3 className="font-semibold">Como instalar no Android</h3>
          </div>
          
          {showVideo ? (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black">
                <video
                  className="w-full h-auto"
                  controls
                  autoPlay
                  playsInline
                  src="/tutorials/android-install.mov"
                >
                  Seu navegador não suporta o vídeo de instalação para Android.
                </video>
              </div>
              
              <div className="text-sm space-y-2">
                <p className="font-medium">Passos rápidos:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Toque nos três pontos (⋮) no canto superior direito</li>
                  <li>Selecione "Adicionar à tela inicial" ou "Instalar app"</li>
                  <li>Toque em "Adicionar" ou "Instalar"</li>
                  <li>O app YM Sports aparecerá na sua tela inicial!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <Smartphone className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <h4 className="font-semibold mb-2">Instale o YM Sports</h4>
                <p className="text-sm text-muted-foreground">
                  Acesse o app como um aplicativo nativo, 
                  com notificações e funcionamento offline!
                </p>
              </div>
              
              <Button onClick={() => setShowVideo(true)} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Ver Tutorial em Vídeo
              </Button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Instalar YM Sports
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefícios */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Por que instalar?
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Acesso rápido</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Notificações</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Modo offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Experiência nativa</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Plataforma */}
          {!selectedPlatform && (
            <div className="space-y-3">
              <h4 className="font-medium">Escolha sua plataforma:</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlatform('ios')}
                  className="h-16 flex-col gap-2"
                >
                  <Apple className="h-6 w-6" />
                  <span className="text-sm">iOS</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlatform('android')}
                  className="h-16 flex-col gap-2"
                >
                  <Chrome className="h-6 w-6" />
                  <span className="text-sm">Android</span>
                </Button>
              </div>
            </div>
          )}

          {/* Instruções da Plataforma */}
          {selectedPlatform && (
            <div>
              {renderInstructions()}
            </div>
          )}

          <Separator />

          {/* Botões de Ação */}
          <div className="flex flex-col gap-2">
            {selectedPlatform && !showVideo && (
              <Button onClick={handleInstallClick} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Instalar Agora
              </Button>
            )}
            
            {selectedPlatform && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedPlatform(null);
                  setShowVideo(false);
                }}
                className="w-full"
              >
                Escolher Outra Plataforma
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Agora Não
              </Button>
              <Button variant="ghost" onClick={handleDontShowAgain} className="flex-1">
                Não Mostrar Novamente
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              {window.matchMedia('(display-mode: standalone)').matches 
                ? '✅ App já instalado' 
                : '📱 Disponível para instalação'
              }
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
