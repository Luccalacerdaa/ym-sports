import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useDailyNotifications } from "@/hooks/useDailyNotifications";
import { useRobustNotifications } from "@/hooks/useRobustNotifications";
import { 
  Bell, 
  BellOff, 
  Zap, 
  Apple, 
  Trophy, 
  Dumbbell, 
  Heart,
  Clock,
  RefreshCw,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferences {
  motivational: boolean;
  nutrition: boolean;
  training: boolean;
  achievements: boolean;
  app: boolean;
  enabled: boolean;
}

export function NotificationSettings() {
  const { setupNotifications, sendImmediateNotification, forceReschedule, testNotificationSystem } = useDailyNotifications();
  const { 
    setupNotifications: setupRobustNotifications, 
    sendImmediateNotification: sendRobustNotification, 
    forceReschedule: forceRobustReschedule,
    checkPendingNotifications 
  } = useRobustNotifications();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    motivational: true,
    nutrition: true,
    training: true,
    achievements: true,
    app: true,
    enabled: false
  });
  
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  // Verificar status da permissão
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      setPreferences(prev => ({
        ...prev,
        enabled: Notification.permission === 'granted'
      }));
    }
  }, []);

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('ym-sports-notification-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      }
    }
  }, []);

  // Salvar preferências no localStorage
  const savePreferences = (newPreferences: NotificationPreferences) => {
    localStorage.setItem('ym-sports-notification-preferences', JSON.stringify(newPreferences));
    setPreferences(newPreferences);
  };

  // Solicitar permissão de notificação
  const handleEnableNotifications = async () => {
    const success = await setupNotifications();
    if (success) {
      setPermissionStatus('granted');
      const newPreferences = { ...preferences, enabled: true };
      savePreferences(newPreferences);
      toast.success('Notificações ativadas com sucesso!');
      
      // Enviar notificação de teste
      sendImmediateNotification(
        '🔔 Notificações Ativadas!',
        'Você receberá notificações motivacionais durante o dia!'
      );
    } else {
      toast.error('Não foi possível ativar as notificações');
    }
  };

  // Desativar notificações
  const handleDisableNotifications = () => {
    const newPreferences = { ...preferences, enabled: false };
    savePreferences(newPreferences);
    toast.info('Notificações desativadas');
  };

  // Alterar preferência específica
  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
    
    if (value) {
      toast.success(`Notificações de ${getPreferenceName(key)} ativadas`);
    } else {
      toast.info(`Notificações de ${getPreferenceName(key)} desativadas`);
    }
  };

  // Obter nome da preferência
  const getPreferenceName = (key: keyof NotificationPreferences) => {
    const names = {
      motivational: 'Motivação',
      nutrition: 'Nutrição',
      training: 'Treinos',
      achievements: 'Conquistas',
      app: 'App',
      enabled: 'Geral'
    };
    return names[key];
  };

  // Enviar notificação de teste
  const handleTestNotification = () => {
    const messages = [
      { title: '💪 Teste de Motivação', body: 'Você é mais forte do que imagina!' },
      { title: '🔥 Foco no Objetivo', body: 'Cada dia é uma nova oportunidade!' },
      { title: '⚡ Energia Positiva', body: 'Sua dedicação fará a diferença!' }
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    sendImmediateNotification(randomMessage.title, randomMessage.body);
    toast.success('Notificação de teste enviada!');
  };

  // Forçar reagendamento das notificações
  const handleForceReschedule = () => {
    try {
      forceReschedule();
      toast.success("Sistema de notificações reiniciado!");
    } catch (error) {
      toast.error("Erro ao reiniciar sistema de notificações");
    }
  };

  // Testar sistema de notificações
  const handleTestSystem = () => {
    try {
      const testTime = testNotificationSystem();
      toast.success(`Teste agendado para ${testTime} (próximo minuto)!`);
    } catch (error) {
      toast.error("Erro ao agendar teste");
    }
  };

  const getStatusBadge = () => {
    if (permissionStatus === 'granted' && preferences.enabled) {
      return <Badge className="bg-green-500 text-white">Ativo</Badge>;
    } else if (permissionStatus === 'denied') {
      return <Badge variant="destructive">Bloqueado</Badge>;
    } else {
      return <Badge variant="outline">Inativo</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status das Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </div>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissionStatus === 'denied' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                As notificações foram bloqueadas. Para ativar, vá nas configurações do navegador e permita notificações para este site.
              </p>
            </div>
          )}
          
          {permissionStatus !== 'granted' && permissionStatus !== 'denied' && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Receba notificações motivacionais durante o dia para manter seu foco e disciplina!
              </p>
              <Button onClick={handleEnableNotifications} size="lg" className="w-full">
                <Bell className="mr-2 h-4 w-4" />
                Ativar Notificações
              </Button>
            </div>
          )}
          
          {permissionStatus === 'granted' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="notifications-enabled" className="text-base font-medium">
                    Notificações Gerais
                  </Label>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={preferences.enabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleEnableNotifications();
                    } else {
                      handleDisableNotifications();
                    }
                  }}
                />
              </div>
              
              {preferences.enabled && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Tipos de Notificação
                    </h4>
                    
                    {/* Notificações Motivacionais */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <div>
                          <Label className="text-sm font-medium">Motivação</Label>
                          <p className="text-xs text-muted-foreground">
                            Frases inspiradoras e mensagens motivacionais
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.motivational}
                        onCheckedChange={(checked) => handlePreferenceChange('motivational', checked)}
                      />
                    </div>
                    
                    {/* Notificações de Nutrição */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Apple className="h-4 w-4 text-green-500" />
                        <div>
                          <Label className="text-sm font-medium">Nutrição</Label>
                          <p className="text-xs text-muted-foreground">
                            Lembretes sobre alimentação e hidratação
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.nutrition}
                        onCheckedChange={(checked) => handlePreferenceChange('nutrition', checked)}
                      />
                    </div>
                    
                    {/* Notificações de Treino */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-4 w-4 text-blue-500" />
                        <div>
                          <Label className="text-sm font-medium">Treinos</Label>
                          <p className="text-xs text-muted-foreground">
                            Lembretes para treinar e exercitar-se
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.training}
                        onCheckedChange={(checked) => handlePreferenceChange('training', checked)}
                      />
                    </div>
                    
                    {/* Notificações de Conquistas */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <div>
                          <Label className="text-sm font-medium">Conquistas</Label>
                          <p className="text-xs text-muted-foreground">
                            Novas conquistas e progresso
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.achievements}
                        onCheckedChange={(checked) => handlePreferenceChange('achievements', checked)}
                      />
                    </div>
                    
                    {/* Notificações do App */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4 text-red-500" />
                        <div>
                          <Label className="text-sm font-medium">App</Label>
                          <p className="text-xs text-muted-foreground">
                            Atualizações e novidades do app
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.app}
                        onCheckedChange={(checked) => handlePreferenceChange('app', checked)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleTestNotification}
                        className="flex-1"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Testar Notificação
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleForceReschedule}
                        className="flex-1 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reiniciar
                      </Button>
                    </div>
                    
                    <div className="text-xs text-center text-gray-400 mb-2">
                      Sistema Robusto (Novo)
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          try {
                            sendRobustNotification("🔔 Teste Sistema Robusto", "Sistema de notificações robusto funcionando!");
                            toast.success("Notificação robusta enviada!");
                          } catch (error) {
                            toast.error("Erro ao testar sistema robusto");
                          }
                        }}
                        className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Teste Robusto
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          try {
                            forceRobustReschedule();
                            toast.success("Sistema robusto reagendado!");
                          } catch (error) {
                            toast.error("Erro ao reagendar sistema robusto");
                          }
                        }}
                        className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset Robusto
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      onClick={handleTestSystem}
                      className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Teste (1min)
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Informações sobre Horários */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários das Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">Manhã</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>07:00 - Hora de Treinar</li>
                  <li>08:00 - Motivação Matinal</li>
                  <li>09:30 - Lembre do Sonho</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Tarde</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>12:00 - Nutrição</li>
                  <li>14:00 - Hidratação</li>
                  <li>16:00 - Energia da Tarde</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Noite</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>19:00 - Jantar Inteligente</li>
                  <li>21:00 - Mentalidade Noturna</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Aleatórios</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Conquistas</li>
                  <li>Progresso</li>
                  <li>Dicas do App</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}