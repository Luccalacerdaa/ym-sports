import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, MapPin, Clock, Trophy, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: "treino" | "jogo" | "campeonato" | "reuniao";
}

const eventTypeConfig = {
  treino: {
    label: "Treino",
    icon: Dumbbell,
    variant: "secondary" as const,
  },
  jogo: {
    label: "Jogo",
    icon: Trophy,
    variant: "default" as const,
  },
  campeonato: {
    label: "Campeonato",
    icon: Trophy,
    variant: "default" as const,
  },
  reuniao: {
    label: "Reunião",
    icon: CalendarIcon,
    variant: "outline" as const,
  },
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Jogo contra FC Santos",
      date: new Date(2025, 1, 15),
      time: "15:00",
      location: "Estádio Municipal",
      type: "jogo",
    },
    {
      id: "2",
      title: "Treino Tático",
      date: new Date(2025, 1, 18),
      time: "09:00",
      location: "CT do clube",
      type: "treino",
    },
    {
      id: "3",
      title: "Copa Regional - Final",
      date: new Date(2025, 1, 22),
      time: "16:30",
      location: "Arena Paulista",
      type: "campeonato",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    time: "",
    location: "",
    type: "treino" as Event["type"],
  });

  const handleAddEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      date: selectedDate || new Date(),
    };
    setEvents([...events, event]);
    setNewEvent({
      title: "",
      date: new Date(),
      time: "",
      location: "",
      type: "treino",
    });
    setIsDialogOpen(false);
  };

  const eventsForSelectedDate = events.filter(
    (event) =>
      selectedDate &&
      event.date.toDateString() === selectedDate.toDateString()
  );

  const upcomingEvents = events
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const eventDates = events.map((event) => event.date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-primary" />
              Meu Calendário
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize seus jogos, treinos e compromissos
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome do Evento</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    placeholder="Ex: Jogo contra FC Santos"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, time: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value: Event["type"]) =>
                        setNewEvent({ ...newEvent, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treino">Treino</SelectItem>
                        <SelectItem value="jogo">Jogo</SelectItem>
                        <SelectItem value="campeonato">Campeonato</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    placeholder="Ex: Estádio Municipal"
                  />
                </div>

                <Button onClick={handleAddEvent} className="w-full">
                  Adicionar ao Calendário
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2 hover-scale animate-fade-in">
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="rounded-md border-0"
                modifiers={{
                  hasEvent: eventDates,
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textDecorationColor: "hsl(var(--primary))",
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Próximos Eventos */}
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum evento próximo
                </p>
              ) : (
                upcomingEvents.map((event) => {
                  const config = eventTypeConfig[event.type];
                  const Icon = config.icon;
                  const isPast = event.date < new Date();
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isPast 
                          ? "bg-muted/30 opacity-60" 
                          : "bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${isPast ? "text-muted-foreground" : "text-primary"}`} />
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold text-sm leading-tight">
                            {event.title}
                          </p>
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <Badge variant={config.variant} className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Eventos do Dia Selecionado */}
        {selectedDate && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">
                Eventos em {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum evento neste dia
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eventsForSelectedDate.map((event) => {
                    const config = eventTypeConfig[event.type];
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <p className="font-semibold leading-tight">{event.title}</p>
                              <Badge variant={config.variant} className="text-xs mt-1">
                                {config.label}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.time}
                              </p>
                              <p className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
