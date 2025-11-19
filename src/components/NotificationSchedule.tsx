import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Zap, 
  Apple, 
  Trophy, 
  Dumbbell, 
  Heart,
  Bell,
  Calendar,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Lista completa de notificações - NOVO CRONOGRAMA ATUALIZADO
const notificationSchedule = {
  motivational: [
    // 🌅 MANHÃ
    { time: "07:00", title: "💪 Motivação Matinal", body: "Seu futuro agradece o esforço de hoje." },
    { time: "09:30", title: "💦 Hidratação Matinal", body: "Comece o dia tomando água" },
    // 🌞 TARDE
    { time: "12:00", title: "🥗 Hora da Nutrição", body: "Cuide da sua alimentação para ter energia!" },
    { time: "14:00", title: "💧 Hidratação é Fundamental", body: "Mantenha-se hidratado durante o dia!" },
    { time: "15:30", title: "🎯 Foco no Objetivo", body: "Mantenha o foco nos seus sonhos!" },
    // 🌙 NOITE
    { time: "18:30", title: "🌟 Motivação Noturna", body: "Orgulhe-se do que você fez hoje." },
    { time: "19:00", title: "🍽️ Jantar Inteligente", body: "Termine o dia com uma refeição saudável!" }
  ],
  app: [
    { time: "08:30", title: "🏃‍♂️ Treino Disponível", body: "Seu treino personalizado está te esperando!", frequency: "diário" },
    { time: "10:30", title: "📈 Atualize Seu Perfil", body: "Complete suas informações para um portfólio mais atrativo!", frequency: "semanal" },
    { time: "16:30", title: "📱 Portfólio Online", body: "Divulgue sua marca e seja descoberto!", frequency: "diário" },
    { time: "20:00", title: "🥇 Ranking Atualizado", body: "Veja sua posição no ranking nacional!", frequency: "semanal" }
  ],
  achievements: [
    { time: "13:00", title: "🏆 Nova Conquista Disponível", body: "Você tem conquistas esperando para serem desbloqueadas!" }
  ]
};

interface NotificationScheduleProps {
  compact?: boolean;
}

export function NotificationSchedule({ compact = false }: NotificationScheduleProps) {
  const navigate = useNavigate();

  // Combinar todas as notificações em uma lista única ordenada por horário
  const allNotifications = [
    ...notificationSchedule.motivational.map(n => ({ ...n, type: 'motivational' as const })),
    ...notificationSchedule.app.map(n => ({ ...n, type: 'app' as const })),
    ...notificationSchedule.achievements.map(n => ({ ...n, type: 'achievements' as const }))
  ].sort((a, b) => a.time.localeCompare(b.time));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'motivational': return <Heart className="w-4 h-4" />;
      case 'app': return <Bell className="w-4 h-4" />;
      case 'achievements': return <Trophy className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'motivational': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'app': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'achievements': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'motivational': return 'Motivação';
      case 'app': return 'App';
      case 'achievements': return 'Conquistas';
      default: return 'Geral';
    }
  };

  const displayNotifications = compact ? allNotifications.slice(0, 6) : allNotifications;

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-500" />
            {compact ? "Próximas Notificações" : "Cronograma Completo"}
          </CardTitle>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/settings/notifications')}
              className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
            >
              Ver Tudo
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
        
        {!compact && (
          <div className="text-sm text-gray-400 mt-2">
            📋 <strong>12 notificações por dia</strong> - Motivação, App e Conquistas
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {!compact && (
          <>
            {/* Resumo por período */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-orange-400 font-semibold">🌅 MANHÃ</div>
                <div className="text-sm text-gray-400">4 notificações</div>
                <div className="text-xs text-gray-500">07:00 - 10:30</div>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="text-yellow-400 font-semibold">🌞 TARDE</div>
                <div className="text-sm text-gray-400">5 notificações</div>
                <div className="text-xs text-gray-500">12:00 - 16:30</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-purple-400 font-semibold">🌙 NOITE</div>
                <div className="text-sm text-gray-400">3 notificações</div>
                <div className="text-xs text-gray-500">18:30 - 20:00</div>
              </div>
            </div>
            
            <Separator className="bg-gray-800" />
          </>
        )}

        {/* Lista de notificações */}
        <div className="space-y-2">
          {displayNotifications.map((notification, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 min-w-[60px]">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-mono text-gray-300">
                    {notification.time}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">
                    {notification.title}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {notification.body}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {notification.frequency && (
                  <Badge variant="outline" className="text-xs bg-gray-700/50 border-gray-600">
                    {notification.frequency}
                  </Badge>
                )}
                
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getTypeColor(notification.type)}`}
                >
                  {getTypeIcon(notification.type)}
                  <span className="ml-1">{getTypeName(notification.type)}</span>
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {compact && allNotifications.length > 6 && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/settings/notifications')}
              className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
            >
              +{allNotifications.length - 6} notificações restantes
            </Button>
          </div>
        )}

        {!compact && (
          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <div className="text-sm text-gray-300 font-medium mb-2">
              📊 Resumo das Categorias:
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="text-center">
                <div className="text-red-400 font-semibold">{notificationSchedule.motivational.length}</div>
                <div className="text-gray-400">Motivacionais</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold">{notificationSchedule.app.length}</div>
                <div className="text-gray-400">do App</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-semibold">{notificationSchedule.achievements.length}</div>
                <div className="text-gray-400">de Conquistas</div>
              </div>
            </div>
            
            <Separator className="bg-gray-700 my-3" />
            
            <div className="text-xs text-gray-400">
              <div className="mb-1"><strong>⚙️ Frequências:</strong></div>
              <div>• <strong>Diário:</strong> Todos os dias</div>
              <div>• <strong>Semanal:</strong> Segundas-feiras</div>
              <div>• <strong>Conquistas:</strong> Horários fixos</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}