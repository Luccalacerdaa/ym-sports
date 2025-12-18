import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSimpleNotifications } from "@/hooks/useSimpleNotifications";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  Shield, 
  Smartphone,
  Info,
  ExternalLink,
  TestTube
} from "lucide-react";

export default function Settings() {
  const appVersion = "1.0.0";
  const buildDate = new Date().toLocaleDateString('pt-BR');
  const { hasPermission, requestPermission } = useSimpleNotifications();

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
          <h2 className="text-xl font-semibold">Notificações</h2>
        </div>
        
        {/* Teste Simples */}
        <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-300">
              <TestTube className="h-5 w-5" />
              Teste de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700/50">
              <p className="text-sm text-yellow-200 mb-2">
                🧪 Notificação de teste chegará em <strong>1 minuto</strong>
              </p>
              <p className="text-xs text-yellow-300/70">
                Aguarde 1 minuto e a notificação chegará automaticamente via Service Worker.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Permissão:</span>
              <Badge variant={hasPermission ? "default" : "destructive"}>
                {hasPermission ? "✅ Permitida" : "❌ Negada"}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              {!hasPermission && (
                <Button 
                  onClick={async () => {
                    const granted = await requestPermission();
                    if (granted) {
                      toast.success("✅ Permissão concedida!");
                    } else {
                      toast.error("❌ Permissão negada");
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Permitir Notificações
                </Button>
              )}
              
              <Button 
                onClick={() => {
                  // Agendar notificação para 1 minuto
                  const now = new Date();
                  const testTime = new Date(now.getTime() + 60000); // +1 minuto
                  const timeString = testTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  
                  if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                      type: 'SCHEDULE_TEST',
                      time: testTime.getTime()
                    });
                  }
                  
                  toast.success(`⏰ Notificação agendada para ${timeString}!`);
                }}
                disabled={!hasPermission}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
              >
                <TestTube className="mr-2 h-4 w-4" />
                Agendar Teste (1 min)
              </Button>
            </div>
            
            <p className="text-xs text-gray-400">
              Teste simples para verificar se notificações estão funcionando.
            </p>
          </CardContent>
        </Card>
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
