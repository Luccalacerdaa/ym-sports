import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSimpleNotifications } from "@/hooks/useSimpleNotifications";
import { BellOff, CheckCircle2, Settings, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface SimpleNotificationManagerProps {
  open: boolean;
  onClose: () => void;
}

export const SimpleNotificationManager = ({ open, onClose }: SimpleNotificationManagerProps) => {
  console.log('🔔 [NOTIFICATION_MANAGER] Componente inicializado');
  
  const simpleNotifications = useSimpleNotifications();
  
  console.log('🔔 [NOTIFICATION_MANAGER] Hook retornou:', Object.keys(simpleNotifications || {}));
  
  const { 
    permissionGranted,
    hasPermission,
    requestPermission,
    sendTestNotification
  } = simpleNotifications || {};
  
  // Dados mockados por enquanto já que o hook não retorna notifications
  const notifications = [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  
  console.log('🔔 [NOTIFICATION_MANAGER] Notificações:', safeNotifications.length);

  const handleRequestPermission = async () => {
    console.log('🔔 [NOTIFICATION_MANAGER] Solicitando permissão...');
    if (requestPermission) {
      await requestPermission();
    } else {
      console.warn('⚠️ [NOTIFICATION_MANAGER] requestPermission não disponível');
    }
  };

  const handleTestNotification = () => {
    console.log('🧪 [NOTIFICATION_MANAGER] Enviando notificação de teste...');
    if (sendTestNotification) {
      sendTestNotification();
    } else {
      console.warn('⚠️ [NOTIFICATION_MANAGER] sendTestNotification não disponível');
    }
  };
  
  const handleSetupDefaultNotifications = () => {
    console.log('⚙️ [NOTIFICATION_MANAGER] Reconfigurando notificações...');
    // Por enquanto não faz nada, pois setupDefaultNotifications não existe no hook
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Gerenciar Notificações
          </DialogTitle>
          <DialogDescription>
            Configure suas notificações para treinos, refeições e hidratação.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Status da Permissão */}
          {!hasPermission ? (
            <div className="text-center p-4 border rounded-md bg-yellow-50 border-yellow-200">
              <BellOff className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm mb-3 text-yellow-800">
                As notificações estão desativadas no seu navegador.
              </p>
              <Button 
                onClick={handleRequestPermission} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Bell className="h-4 w-4 mr-2" />
                Ativar Notificações
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center p-3 border rounded-md bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
              <p className="text-sm text-green-800">Notificações ativadas!</p>
            </div>
          )}

          <Separator />

          {/* Lista de Notificações */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                Notificações Configuradas ({safeNotifications.length})
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSetupDefaultNotifications}
              >
                <Settings className="h-4 w-4 mr-2" />
                Reconfigurar
              </Button>
            </div>

            {safeNotifications.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhuma notificação configurada.
              </p>
            ) : (
              <div className="space-y-3">
                {safeNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-center justify-between p-3 border rounded-md bg-secondary/20"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            notification.type === 'meal' ? 'border-orange-300 text-orange-700' :
                            notification.type === 'training' ? 'border-blue-300 text-blue-700' :
                            notification.type === 'hydration' ? 'border-cyan-300 text-cyan-700' :
                            'border-gray-300 text-gray-700'
                          }`}
                        >
                          {notification.type === 'meal' ? '🍽️ Refeição' :
                           notification.type === 'training' ? '🏃‍♂️ Treino' :
                           notification.type === 'hydration' ? '💧 Hidratação' :
                           '📋 Geral'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {notification.body}
                      </p>
                      <p className="text-xs font-mono text-primary">
                        ⏰ {notification.time}
                      </p>
                    </div>
                    <div className="ml-3">
                      <Switch 
                        checked={notification.active}
                        disabled={!permissionGranted}
                        aria-label={`${notification.active ? 'Desativar' : 'Ativar'} ${notification.title}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teste de Notificação */}
          {permissionGranted && (
            <>
              <Separator />
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={handleTestNotification}
                  className="w-full"
                >
                  🧪 Enviar Notificação de Teste
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
