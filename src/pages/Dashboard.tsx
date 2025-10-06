import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Dumbbell, Bell, ArrowRight, Medal, Flame } from "lucide-react";

export default function Dashboard() {
  // Mock data - futuramente virá do backend
  const player = {
    name: "João Silva",
    age: 22,
    height: "1.78m",
    weight: "75kg",
    avatar: "/placeholder.svg",
  };

  const ranking = {
    position: 12,
    points: 2450,
    region: "São Paulo",
  };

  const nextEvents = [
    { date: "15 Fev", type: "Jogo", opponent: "FC Santos" },
    { date: "18 Fev", type: "Treino", description: "Tático" },
  ];

  const todayTraining = {
    title: "Treino de Resistência",
    duration: "45 min",
    difficulty: "Médio",
  };

  const notifications = [
    "Novo jogo adicionado ao calendário",
    "Você subiu 3 posições no ranking",
    "Treino especial disponível hoje",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Flame className="h-8 w-8 text-primary animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Olá, {player.name}!
              </h1>
              <p className="text-muted-foreground">Seu melhor amigo no caminho do futebol</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Perfil */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={player.avatar} alt={player.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {player.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">{player.name}</div>
                  <div className="text-sm text-muted-foreground">Jogador</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{player.age}</div>
                  <div className="text-xs text-muted-foreground">anos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{player.height}</div>
                  <div className="text-xs text-muted-foreground">altura</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{player.weight}</div>
                  <div className="text-xs text-muted-foreground">peso</div>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Ver perfil completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Card Calendário */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextEvents.map((event, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{event.date.split(" ")[0]}</div>
                    <div className="text-xs text-muted-foreground">{event.date.split(" ")[1]}</div>
                  </div>
                  <div className="flex-1">
                    <Badge variant={event.type === "Jogo" ? "default" : "secondary"}>
                      {event.type}
                    </Badge>
                    <p className="text-sm mt-1">{event.opponent || event.description}</p>
                  </div>
                </div>
              ))}
              <Button className="w-full" variant="outline">
                Ver calendário completo
              </Button>
            </CardContent>
          </Card>

          {/* Card Ranking */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Ranking Regional
              </CardTitle>
              <CardDescription>{ranking.region}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <Medal className="h-20 w-20 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <div>
                  <div className="text-4xl font-bold text-primary">#{ranking.position}</div>
                  <div className="text-sm text-muted-foreground">Posição Atual</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{ranking.points}</div>
                  <div className="text-xs text-muted-foreground">Pontos Acumulados</div>
                </div>
              </div>
              <Button className="w-full">
                Ver ranking completo
              </Button>
            </CardContent>
          </Card>

          {/* Card Treino do Dia */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Treino do Dia
              </CardTitle>
              <CardDescription>Sugerido por IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{todayTraining.title}</h3>
                <div className="flex gap-2">
                  <Badge variant="secondary">{todayTraining.duration}</Badge>
                  <Badge variant="outline">{todayTraining.difficulty}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-0" />
                </div>
              </div>
              <Button className="w-full">
                Ver detalhes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Card Notificações */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in md:col-span-2" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {notifications.map((notif, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm flex-1">{notif}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
