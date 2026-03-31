import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Bell, Send, Info, Terminal, CheckCircle2, XCircle } from 'lucide-react';
import { usePushSimple } from '@/hooks/usePushSimple';

export default function NotificationTest() {
  const { user } = useAuth();
  const { isSubscribed, permission } = usePushSimple();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '🎉 YM Sports',
    body: 'Teste de notificação!',
    url: '/dashboard'
  });

  const clearNotificationCache = () => {
    let count = 0;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('daily_notification_')) {
        localStorage.removeItem(key);
        count++;
      }
    }
    toast.success(`✅ ${count} notificações limpas do cache!`);
    console.log(`🧹 Cache de notificações limpo: ${count} itens removidos`);
  };

  const sendTestNotification = async () => {
    if (!user) {
      toast.error('❌ Você precisa estar logado');
      return;
    }

    if (!isSubscribed) {
      toast.error('❌ Ative as notificações push primeiro nas Configurações');
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          title: formData.title,
          body: formData.body,
          url: formData.url
        })
      });

      const result = await response.json();
      setLastResult(result);

      if (response.ok && result.success) {
        toast.success(`✅ Notificação enviada! (${result.sent}/${result.total})`);
      } else {
        toast.error(`❌ Erro: ${result.error || 'Falha ao enviar'}`);
      }
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(`❌ Erro: ${error.message}`);
      setLastResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const curlCommand = `curl -X POST https://ymsports.com.br/api/notify \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "${user?.id || 'SEU_USER_ID'}",
    "title": "🎉 YM Sports",
    "body": "Teste via curl!",
    "url": "/dashboard"
  }'`;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Central de Notificações</h1>
          <p className="text-gray-400">Teste e gerencie notificações push</p>
        </div>
      </div>

      {/* Status */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Info className="h-5 w-5 text-blue-400" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Permissão de Notificações:</span>
            <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
              {permission === 'granted' ? '✅ Concedida' : 
               permission === 'denied' ? '❌ Negada' : 
               '⚠️ Pendente'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Push Subscription:</span>
            <Badge variant={isSubscribed ? 'default' : 'secondary'}>
              {isSubscribed ? '✅ Ativa' : '❌ Inativa'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">User ID:</span>
            <code className="text-xs bg-black/40 px-2 py-1 rounded text-yellow-400">
              {user?.id.substring(0, 20)}...
            </code>
          </div>

          {!isSubscribed && (
            <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700/50 mt-4">
              <p className="text-xs text-yellow-300">
                ⚠️ Para receber notificações, ative o Push nas <a href="/dashboard/settings" className="underline">Configurações</a>
              </p>
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={clearNotificationCache}
              variant="outline"
              className="w-full border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/20"
              size="sm"
            >
              🧹 Limpar Cache de Notificações Diárias
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Útil para testar notificações que já foram enviadas hoje
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Teste */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Send className="h-5 w-5 text-purple-400" />
            Enviar Notificação de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Título</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: 🎉 Nova Conquista!"
              className="bg-black/40 border-purple-700/50 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Mensagem</label>
            <Textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Ex: Você subiu para o nível 10!"
              className="bg-black/40 border-purple-700/50 text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">URL de Destino (opcional)</label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="/dashboard"
              className="bg-black/40 border-purple-700/50 text-white"
            />
          </div>

          <Button
            onClick={sendTestNotification}
            disabled={loading || !isSubscribed}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? '📤 Enviando...' : '🚀 Enviar Notificação'}
          </Button>

          {lastResult && (
            <div className={`p-4 rounded-lg border ${
              lastResult.success 
                ? 'bg-green-900/30 border-green-700/50' 
                : 'bg-red-900/30 border-red-700/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {lastResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <span className={`font-semibold ${
                  lastResult.success ? 'text-green-300' : 'text-red-300'
                }`}>
                  {lastResult.success ? 'Sucesso!' : 'Erro'}
                </span>
              </div>
              
              <div className="text-sm text-gray-300 space-y-1">
                {lastResult.sent !== undefined && (
                  <p>✅ Enviadas: {lastResult.sent}</p>
                )}
                {lastResult.failed !== undefined && (
                  <p>❌ Falharam: {lastResult.failed}</p>
                )}
                {lastResult.total !== undefined && (
                  <p>📱 Total de dispositivos: {lastResult.total}</p>
                )}
                {lastResult.error && (
                  <p className="text-red-300">Erro: {lastResult.error}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comando CURL */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Terminal className="h-5 w-5 text-green-400" />
            Enviar via Terminal (curl)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">
            Use este comando para enviar notificações via terminal ou scripts:
          </p>
          
          <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
            <code className="text-xs text-green-400 whitespace-pre-wrap break-all">
              {curlCommand}
            </code>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(curlCommand);
              toast.success('📋 Comando copiado!');
            }}
            className="w-full"
          >
            📋 Copiar Comando
          </Button>

          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/50">
            <p className="text-xs text-blue-300">
              💡 <strong>Dica:</strong> Substitua <code className="bg-black/40 px-1 rounded">SEU_USER_ID</code> pelo ID do usuário que deseja notificar.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exemplos Rápidos */}
      <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/50">
        <CardHeader>
          <CardTitle className="text-white">🎯 Exemplos de Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setFormData({
              title: '⚽ Lembrete de Treino',
              body: 'Seu treino começa em 30 minutos!',
              url: '/dashboard/calendar'
            })}
            className="w-full justify-start"
          >
            📅 Lembrete de Treino
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setFormData({
              title: '🏆 Nova Conquista!',
              body: 'Você desbloqueou: Dedicação - 7 dias consecutivos',
              url: '/dashboard/profile'
            })}
            className="w-full justify-start"
          >
            🏆 Conquista Desbloqueada
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setFormData({
              title: '📈 Você subiu de nível!',
              body: 'Parabéns! Agora você é nível 25',
              url: '/dashboard/profile'
            })}
            className="w-full justify-start"
          >
            📈 Level Up
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setFormData({
              title: '💧 Hora de se hidratar!',
              body: 'Beba água para manter o desempenho',
              url: '/dashboard/nutrition'
            })}
            className="w-full justify-start"
          >
            💧 Lembrete de Hidratação
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

