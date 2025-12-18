import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePushSimple } from "@/hooks/usePushSimple";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  Shield, 
  Smartphone,
  Info,
  ExternalLink,
  Send,
  TestTube
} from "lucide-react";

export default function Settings() {
  const appVersion = "1.0.0";
  const buildDate = new Date().toLocaleDateString('pt-BR');
  const { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe } = usePushSimple();
  const { user } = useAuth();
  const navigate = useNavigate();

  const sendQuickTest = async () => {
    if (!user || !isSubscribed) {
      toast.error('❌ Ative as notificações push primeiro');
      return;
    }

    try {
      toast.info('📤 Enviando notificação de teste...');
      
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: '🎉 YM Sports - Teste',
          body: 'Notificações funcionando perfeitamente!',
          url: '/dashboard'
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success(`✅ Teste enviado! (${result.sent} dispositivo(s))`);
      } else {
        toast.error(`❌ ${result.error || 'Erro ao enviar'}`);
        if (result.failed && result.failed > 0) {
          toast.info('💡 Tente reativar o push');
        }
      }
    } catch (error) {
      toast.error('❌ Erro ao enviar teste');
    }
  };

  const reactivatePush = async () => {
    toast.info('🔄 Reativando push...');
    const success = await subscribe();
    if (success) {
      toast.success('✅ Push reativado com sucesso!');
    } else {
      toast.error('❌ Erro ao reativar');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência no YM Sports</p>
        </div>
      </div>

      {/* Notificações */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Notificações Push</h2>
        </div>
        
        {!isSupported && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                ⚠️ Seu navegador não suporta notificações push.
              </p>
            </CardContent>
          </Card>
        )}
        
        {isSupported && (
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-300">
                <Bell className="h-5 w-5" />
                Notificações Push (App Fechado)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700/50">
                <p className="text-sm text-purple-200 mb-2">
                  🚀 Receba notificações mesmo com o app fechado!
                </p>
                <p className="text-xs text-purple-300/70">
                  Eventos, conquistas e lembretes de treino.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Status:</span>
                <Badge variant={isSubscribed ? "default" : "secondary"}>
                  {isSubscribed ? "✅ Ativo" : "⭕ Inativo"}
                </Badge>
              </div>
              
              {permission === 'denied' && (
                <div className="bg-red-900/30 p-3 rounded-lg border border-red-700/50">
                  <p className="text-xs text-red-300">
                    ⚠️ Permissão bloqueada. Ative nas configurações do navegador.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                {!isSubscribed && (
                  <Button 
                    onClick={async () => {
                      const success = await subscribe();
                      if (success) {
                        toast.success("✅ Notificações push ativadas!");
                      } else {
                        toast.error("❌ Erro ao ativar");
                      }
                    }}
                    disabled={loading || permission === 'denied'}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {loading ? "Ativando..." : "🔔 Ativar Push"}
                  </Button>
                )}
                
                {isSubscribed && (
                  <>
                    <div className="bg-green-900/30 p-3 rounded-lg border border-green-700/50">
                      <p className="text-sm text-green-300 text-center">
                        ✅ Notificações push ativas!
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={sendQuickTest}
                        variant="outline"
                        className="border-yellow-700/50 hover:bg-yellow-900/30"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Teste Rápido
                      </Button>
                      
                      <Button 
                        onClick={() => navigate('/dashboard/notification-test')}
                        variant="outline"
                        className="border-blue-700/50 hover:bg-blue-900/30"
                      >
                        <TestTube className="mr-2 h-4 w-4" />
                        Central de Testes
                      </Button>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2 text-center">
                        Notificações não chegando?
                      </p>
                      <Button 
                        onClick={reactivatePush}
                        disabled={loading}
                        variant="outline"
                        className="w-full border-purple-700/50 hover:bg-purple-900/30"
                        size="sm"
                      >
                        🔄 Reativar Push
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Conta e Privacidade */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Conta e Privacidade</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-4 w-4" />
                Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Perfil Público</span>
                <Badge variant="outline">Configurável no Portfólio</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dados de Treino</span>
                <Badge variant="secondary">Privado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Estatísticas</span>
                <Badge variant="secondary">Privado</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-4 w-4" />
                App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Modo Offline</span>
                <Badge className="bg-green-500 text-white">Suportado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">PWA Instalado</span>
                <Badge variant="outline">
                  {window.matchMedia('(display-mode: standalone)').matches ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache</span>
                <Button variant="outline" size="sm">
                  Limpar Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Sobre o App */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Sobre o App</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>YM Sports</span>
              <Badge variant="outline">v{appVersion}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Seu companheiro completo para o desenvolvimento no futebol. 
              Treine, evolua e conquiste seus objetivos com nossa plataforma.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Versão:</span>
                <p className="text-muted-foreground">{appVersion}</p>
              </div>
              <div>
                <span className="font-medium">Última Atualização:</span>
                <p className="text-muted-foreground">{buildDate}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Termos de Uso
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Política de Privacidade
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Suporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recursos Experimentais */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Recursos Experimentais</h2>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="text-2xl">🚀</div>
              <h3 className="font-semibold">Novidades em Breve</h3>
              <p className="text-sm text-muted-foreground">
                Estamos trabalhando em novos recursos incríveis para melhorar sua experiência!
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge variant="outline">IA Avançada</Badge>
                <Badge variant="outline">Análise de Vídeo</Badge>
                <Badge variant="outline">Comunidade</Badge>
                <Badge variant="outline">Coaching Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
