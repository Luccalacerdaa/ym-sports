import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePushSimple } from '@/hooks/usePushSimple';
import { toast } from 'sonner';

/**
 * Componente que solicita permissão de notificações automaticamente
 * Aparece apenas 1 vez quando o usuário entra no app
 * Após aceitar ou recusar, não aparece mais
 */
export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { isSupported, isSubscribed, permission, subscribe } = usePushSimple();

  useEffect(() => {
    // Verificar se já pediu permissão antes
    const hasAskedBefore = localStorage.getItem('notification_prompt_shown');
    
    // Só mostrar se:
    // 1. Notificações são suportadas
    // 2. Ainda não está inscrito
    // 3. Permissão não foi negada
    // 4. Nunca pediu antes OU usuário recusou mas não bloqueou
    const shouldShow = 
      isSupported && 
      !isSubscribed && 
      permission !== 'denied' &&
      !hasAskedBefore;

    if (shouldShow) {
      // Aguardar 2 segundos após entrar para não ser invasivo
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, isSubscribed, permission]);

  const handleAccept = async () => {
    console.log('🔔 Usuário aceitou ativar notificações');
    const success = await subscribe();
    
    if (success) {
      toast.success('✅ Notificações ativadas! Você receberá alertas importantes.');
      localStorage.setItem('notification_prompt_shown', 'true');
      setShowPrompt(false);
    } else {
      toast.error('❌ Erro ao ativar notificações. Tente novamente.');
    }
  };

  const handleDismiss = () => {
    console.log('🔕 Usuário dispensou o prompt de notificações');
    localStorage.setItem('notification_prompt_shown', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <Card className="w-full max-w-md pointer-events-auto animate-in slide-in-from-bottom-5 duration-300 bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-purple-700 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-purple-700/50 p-3 rounded-full">
              <Bell className="h-6 w-6 text-purple-200" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-white mb-1">
                Ativar Notificações?
              </h3>
              <p className="text-sm text-purple-200/90 leading-relaxed">
                Receba lembretes de treinos, alertas de eventos e notificações de conquistas, 
                mesmo com o app fechado.
              </p>
            </div>

            <button 
              onClick={handleDismiss}
              className="text-purple-300 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-purple-800/30 p-3 rounded-lg border border-purple-700/50">
            <p className="text-xs text-purple-200/80">
              ✨ Notificações importantes:
            </p>
            <ul className="text-xs text-purple-300/70 mt-1 space-y-1 ml-4">
              <li>• Eventos começando em breve</li>
              <li>• Conquistas desbloqueadas</li>
              <li>• Lembretes de treino e hidratação</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleDismiss}
              variant="outline"
              className="flex-1 border-purple-700/50 hover:bg-purple-900/30 text-purple-200"
            >
              Agora Não
            </Button>
            <Button 
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
            >
              🔔 Ativar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

