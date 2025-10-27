import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    subscription,
    loading,
    subscribe,
    unsubscribe,
    testNotification
  } = usePushNotifications();

  // Verificar se está inscrito
  const isSubscribed = !!subscription && permission === 'granted';

  // Navegador não suporta
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Notificações Não Suportadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Seu navegador não suporta notificações push. Para receber notificações, tente usar:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Google Chrome (Desktop ou Android)</li>
              <li>Microsoft Edge</li>
              <li>Firefox</li>
              <li>Opera</li>
            </ul>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-orange-800">
                <strong>Nota:</strong> Safari no iOS só suporta notificações push quando o app é instalado como PWA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <CardTitle>Notificações Push</CardTitle>
          </div>
          
          {isSubscribed && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
        </div>
        <CardDescription>
          Receba alertas sobre treinos, conquistas e eventos mesmo com o app fechado
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Switch principal */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-base">Ativar Notificações</Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed 
                ? 'Você receberá notificações em tempo real' 
                : 'Ative para receber atualizações importantes'
              }
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={(checked) => {
              if (checked) {
                subscribe();
              } else {
                unsubscribe();
              }
            }}
            disabled={loading}
          />
        </div>

        {/* Estado: Permissão Negada */}
        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-900">
                  Notificações Bloqueadas
                </p>
                <p className="text-sm text-red-800">
                  Você bloqueou as notificações para este site. Para ativá-las:
                </p>
                <ol className="text-sm text-red-800 list-decimal list-inside space-y-1">
                  <li>Clique no ícone de <strong>cadeado</strong> na barra de endereço</li>
                  <li>Procure por <strong>"Notificações"</strong></li>
                  <li>Altere para <strong>"Permitir"</strong></li>
                  <li>Recarregue a página</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Estado: Ativado */}
        {isSubscribed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-green-900">
                  Notificações Ativadas!
                </p>
                <p className="text-sm text-green-800">
                  Você receberá alertas mesmo com o app fechado.
                </p>
                
                {/* Botão de teste */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testNotification}
                  className="mt-2"
                >
                  🧪 Testar Notificação
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Informações sobre tipos de notificações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">
                O que você receberá:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <span>Novas conquistas desbloqueadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">📈</span>
                  <span>Subidas de nível e marcos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">⚽</span>
                  <span>Lembretes de treinos e jogos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span>Novos planos de treino gerados</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <span>Competidores próximos no ranking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Informações sobre privacidade */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>🔒 <strong>Privacidade:</strong> Suas notificações são criptografadas e seguras.</p>
          <p>📱 <strong>Dispositivos:</strong> Você pode receber notificações em todos os dispositivos onde fizer login.</p>
          <p>🔕 <strong>Controle:</strong> Você pode desativar a qualquer momento.</p>
        </div>
      </CardContent>
    </Card>
  );
}

