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

// Lista completa de notificações (extraída do hook)
const notificationSchedule = {
  motivational: [
    { time: "07:00", title: "💪 Hora de Treinar!", body: "Seu corpo é seu templo. Que tal um treino hoje?" },
    { time: "08:00", title: "🔥 Motivação Matinal", body: "Cristiano Ronaldo treina todos os dias. E você?" },
    { time: "09:30", title: "⚽ Lembre-se do Seu Sonho", body: "Cada treino te aproxima do seu objetivo!" },
    { time: "11:00", title: "🏆 Mentalidade Vencedora", body: "Messi não desistiu aos 13 anos. Você também não deve!" },
    { time: "12:00", title: "🥗 Hora da Nutrição", body: "Seu corpo precisa de combustível de qualidade!" },
    { time: "14:00", title: "💧 Hidratação é Fundamental", body: "Já bebeu água suficiente hoje? Seu desempenho agradece!" },
    { time: "15:30", title: "🎯 Foco no Objetivo", body: "Pelé disse: 'Sucesso é 99% transpiração e 1% inspiração'" },
    { time: "16:00", title: "⚡ Energia da Tarde", body: "Que tal assistir um vídeo motivacional?" },
    { time: "17:30", title: "🌟 Você é Único", body: "Ronaldinho mostrou que ser diferente é ser especial!" },
    { time: "18:00", title: "📊 Acompanhe Seu Progresso", body: "Veja suas conquistas no app e celebre cada vitória!" },
    { time: "19:00", title: "🍽️ Jantar Inteligente", body: "Confira seu plano nutricional para uma refeição perfeita!" },
    { time: "21:00", title: "🧠 Mentalidade Noturna", body: "Visualize seus objetivos antes de dormir. Sonhe grande!" }
  ],
  app: [
    { time: "10:00", title: "📈 Atualize Seu Perfil", body: "Complete suas informações para um portfólio mais atrativo!", frequency: "semanal" },
    { time: "08:30", title: "🏃‍♂️ Novo Treino Disponível", body: "Criamos um treino personalizado para você!", frequency: "diário" },
    { time: "20:00", title: "🥇 Ranking Atualizado", body: "Veja sua posição no ranking nacional!", frequency: "semanal" },
    { time: "13:00", title: "🎨 YM Design", body: "Que tal criar uma arte profissional para suas redes?", frequency: "semanal" },
    { time: "16:30", title: "📱 Portfólio em Destaque", body: "Seu portfólio teve novas visualizações!", frequency: "semanal" }
  ],
  achievements: [
    { time: "12:30", title: "🏆 Nova Conquista Disponível", body: "Complete mais treinos para desbloquear uma nova conquista!" },
    { time: "18:30", title: "⭐ Sequência de Treinos", body: "Você está em uma boa sequência! Continue assim!" },
    { time: "11:30", title: "📊 Meta de Nutrição", body: "Que tal criar um novo plano nutricional?" }
  ]
};

interface NotificationScheduleProps {
  compact?: boolean;
}

export function NotificationSchedule({ compact = false }: NotificationScheduleProps) {
  const navigate = useNavigate();
  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'Manhã';
    if (hour >= 12 && hour < 18) return 'Tarde';
    return 'Noite';
  };

  const groupNotificationsByTime = () => {
    const allNotifications = [
      ...notificationSchedule.motivational.map(n => ({ ...n, type: 'motivational' })),
      ...notificationSchedule.app.map(n => ({ ...n, type: 'app' })),
      ...notificationSchedule.achievements.map(n => ({ ...n, type: 'achievements' }))
    ];

    const grouped = allNotifications.reduce((acc, notification) => {
      const timeOfDay = getTimeOfDay(notification.time);
      if (!acc[timeOfDay]) acc[timeOfDay] = [];
      acc[timeOfDay].push(notification);
      return acc;
    }, {} as Record<string, any[]>);

    // Ordenar por horário dentro de cada período
    Object.keys(grouped).forEach(period => {
      grouped[period].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'motivational': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'app': return <Heart className="h-4 w-4 text-red-500" />;
      case 'achievements': return <Trophy className="h-4 w-4 text-yellow-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'motivational': return <Badge variant="outline" className="text-xs">Motivação</Badge>;
      case 'app': return <Badge variant="outline" className="text-xs">App</Badge>;
      case 'achievements': return <Badge variant="outline" className="text-xs">Conquistas</Badge>;
      default: return null;
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Horários das Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Manhã (5h-12h)</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>07:00 - Hora de Treinar</li>
                <li>08:00 - Motivação Matinal</li>
                <li>08:30 - Novo Treino (diário)</li>
                <li>09:30 - Lembre do Sonho</li>
                <li>10:00 - Atualize Perfil (semanal)</li>
                <li>11:00 - Mentalidade Vencedora</li>
                <li>11:30 - Meta de Nutrição</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Tarde (12h-18h)</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>12:00 - Hora da Nutrição</li>
                <li>12:30 - Nova Conquista</li>
                <li>13:00 - YM Design (semanal)</li>
                <li>14:00 - Hidratação</li>
                <li>15:30 - Foco no Objetivo</li>
                <li>16:00 - Energia da Tarde</li>
                <li>16:30 - Portfólio (semanal)</li>
                <li>17:30 - Você é Único</li>
              </ul>
            </div>
            <div className="col-span-2">
              <h5 className="font-medium mb-2">Noite (18h-5h)</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>18:00 - Acompanhe Progresso</li>
                <li>18:30 - Sequência de Treinos</li>
                <li>19:00 - Jantar Inteligente</li>
                <li>20:00 - Ranking Atualizado (semanal)</li>
                <li>21:00 - Mentalidade Noturna</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-xs">
                <Zap className="mr-1 h-3 w-3" />
                12 Motivacionais
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Heart className="mr-1 h-3 w-3" />
                5 do App
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Trophy className="mr-1 h-3 w-3" />
                3 de Conquistas
              </Badge>
            </div>
            
            <div className="text-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard/notifications-schedule')}
                className="text-xs"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Ver Cronograma Completo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedNotifications = groupNotificationsByTime();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Cronograma de Notificações</h2>
          <p className="text-muted-foreground">
            Todas as notificações que você receberá durante o dia
          </p>
        </div>
      </div>

      {/* Resumo */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-500">12</div>
              <div className="text-sm text-muted-foreground">Motivacionais</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">5</div>
              <div className="text-sm text-muted-foreground">Do App</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-muted-foreground">Conquistas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificações por período */}
      {Object.entries(groupedNotifications).map(([period, notifications]) => (
        <Card key={period}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {period}
              <Badge variant="outline">{notifications.length} notificações</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex items-center gap-2 min-w-0">
                    {getTypeIcon(notification.type)}
                    <div className="font-mono text-sm font-medium">
                      {notification.time}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {notification.title}
                      </h4>
                      {getTypeBadge(notification.type)}
                      {notification.frequency && (
                        <Badge variant="secondary" className="text-xs">
                          {notification.frequency}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notification.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Frequências:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Diário:</strong> Todos os dias</li>
                <li>• <strong>Semanal:</strong> Segundas-feiras</li>
                <li>• <strong>Conquistas:</strong> Horários aleatórios</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Configurações:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Você pode desativar por categoria</li>
                <li>• Configurações salvas automaticamente</li>
                <li>• Teste de notificações disponível</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
