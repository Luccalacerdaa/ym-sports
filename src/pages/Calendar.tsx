import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvents } from "@/hooks/useEvents";
import { toast } from "sonner";
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin,
  Clock,
  Users,
  Trophy,
  Dumbbell,
  Heart
} from "lucide-react";

export default function Calendar() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [dialogHeight, setDialogHeight] = useState<number>(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "training" as "game" | "training" | "personal" | "other",
    start_date: "",
    end_date: "",
    location: "",
    opponent: "",
    is_recurring: false,
    recurrence_pattern: "",
  });

  const eventTypeIcons = {
    game: <Trophy className="h-4 w-4" />,
    training: <Dumbbell className="h-4 w-4" />,
    personal: <Heart className="h-4 w-4" />,
    other: <CalendarIcon className="h-4 w-4" />,
  };

  const eventTypeColors = {
    game: "bg-red-100 text-red-800 border-red-200",
    training: "bg-blue-100 text-blue-800 border-blue-200",
    personal: "bg-green-100 text-green-800 border-green-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const eventTypeBorderColors = {
    game: "border-l-4 border-l-red-500",
    training: "border-l-4 border-l-blue-500",
    personal: "border-l-4 border-l-green-500",
    other: "border-l-4 border-l-gray-500",
  };

  // Função para obter eventos de uma data específica
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.start_date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Função para lidar com mudança de data no calendário
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // Preencher automaticamente a data no formulário se estiver aberto
    if (isCreateDialogOpen) {
      setFormData(prev => ({
        ...prev,
        start_date: date.toISOString().split('T')[0]
      }));
    }
  };

  // Função para abrir dialog de criação com data selecionada
  const openCreateDialog = () => {
    // Preencher com a data selecionada e horário padrão (09:00)
    const dateWithTime = new Date(selectedDate);
    dateWithTime.setHours(9, 0, 0, 0);
    const localDateTime = new Date(dateWithTime.getTime() - dateWithTime.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    setFormData(prev => ({
      ...prev,
      start_date: localDateTime
    }));
    setIsCreateDialogOpen(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date) {
      toast.error("Título e data de início são obrigatórios");
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
        location: formData.location,
        opponent: formData.opponent,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : undefined,
      };

      if (editingEvent) {
        // Editar evento existente
        const { error } = await updateEvent(editingEvent.id, eventData);
        
        if (error) {
          toast.error("Erro ao atualizar evento: " + error.message);
        } else {
          toast.success("Evento atualizado com sucesso!");
          setEditingEvent(null);
          resetForm();
        }
      } else {
        // Criar novo evento
        const { error } = await createEvent(eventData);
        
        if (error) {
          toast.error("Erro ao criar evento: " + error.message);
        } else {
          toast.success("Evento criado com sucesso!");
          setIsCreateDialogOpen(false);
          resetForm();
        }
      }
    } catch (err) {
      toast.error("Erro inesperado ao processar evento");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja deletar este evento?")) {
      return;
    }

    try {
      const { error } = await deleteEvent(eventId);
      
      if (error) {
        toast.error("Erro ao deletar evento: " + error.message);
      } else {
        toast.success("Evento deletado com sucesso!");
      }
    } catch (err) {
      toast.error("Erro inesperado ao deletar evento");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_type: "training",
      start_date: "",
      end_date: "",
      location: "",
      opponent: "",
      is_recurring: false,
      recurrence_pattern: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar calendário: {error}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
            <p className="text-muted-foreground">Gerencie seus eventos e treinos</p>
          </div>
          
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário Visual */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactCalendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  locale="pt-BR"
                  className="w-full"
                  tileContent={({ date, view }) => {
                    const eventsForDate = getEventsForDate(date);
                    return eventsForDate.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {eventsForDate.slice(0, 2).map((event, index) => (
                          <div
                            key={event.id}
                            className={`w-2 h-2 rounded-full ${
                              event.event_type === 'game' ? 'bg-red-500' :
                              event.event_type === 'training' ? 'bg-blue-500' :
                              event.event_type === 'personal' ? 'bg-green-500' :
                              'bg-gray-500'
                            }`}
                            title={event.title}
                          />
                        ))}
                        {eventsForDate.length > 2 && (
                          <div className="w-2 h-2 rounded-full bg-gray-300" title={`+${eventsForDate.length - 2} mais`} />
                        )}
                      </div>
                    ) : null;
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Eventos do Dia Selecionado */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Eventos de {selectedDate.toLocaleDateString('pt-BR')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum evento nesta data</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={openCreateDialog}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Evento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className={`p-3 border rounded-lg ${eventTypeBorderColors[event.event_type]}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {eventTypeIcons[event.event_type]}
                              <h3 className="font-semibold">{event.title}</h3>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(event.start_date).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingEvent(event);
                                setFormData({
                                  title: event.title,
                                  description: event.description || "",
                                  event_type: event.event_type,
                                  start_date: new Date(event.start_date).toISOString().split('T')[0],
                                  end_date: event.end_date ? new Date(event.end_date).toISOString().split('T')[0] : "",
                                  location: event.location || "",
                                  opponent: event.opponent || "",
                                  is_recurring: event.is_recurring || false,
                                  recurrence_pattern: event.recurrence_pattern || "",
                                });
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Legenda de Cores dos Eventos */}
                {getEventsForDate(selectedDate).length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Legenda de Cores</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-sm">Jogo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Treino</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm">Pessoal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                        <span className="text-sm">Outro</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog para Criar/Editar Evento */}
        <Dialog open={isCreateDialogOpen || !!editingEvent} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingEvent(null);
            resetForm();
          }
        }}>
          <DialogContent 
              className="max-w-md max-h-[80vh] overflow-y-auto dialog-container"
              style={{ 
                paddingBottom: `${dialogHeight > 0 ? dialogHeight + 40 : 80}px`,
                marginBottom: '100px', // Espaço extra para garantir que o botão de submit esteja visível
                maxHeight: 'calc(100vh - 120px)' // Limitar altura para não cobrir a barra inferior
              }}
            >
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Nome do evento"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event_type">Tipo de Evento</Label>
                <Select 
                  value={formData.event_type} 
                  onValueChange={(value: any) => setFormData({...formData, event_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Treino</SelectItem>
                    <SelectItem value="game">Jogo</SelectItem>
                    <SelectItem value="personal">Pessoal</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date.split('T')[0]}
                      onChange={(e) => {
                        // Preservar o horário existente ou usar horário padrão
                        const currentTime = formData.start_date.includes('T') 
                          ? formData.start_date.split('T')[1] 
                          : '09:00';
                        setFormData({...formData, start_date: `${e.target.value}T${currentTime}`});
                      }}
                      required
                      className="mb-2"
                    />
                  </div>
                  <div>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_date.includes('T') ? formData.start_date.split('T')[1] : '09:00'}
                      onChange={(e) => {
                        // Preservar a data existente ou usar a data selecionada
                        const currentDate = formData.start_date.includes('T') 
                          ? formData.start_date.split('T')[0] 
                          : selectedDate.toISOString().split('T')[0];
                        setFormData({...formData, start_date: `${currentDate}T${e.target.value}`});
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs text-muted-foreground w-full">Horários rápidos:</span>
                  {[
                    { label: '06:00', hour: 6 },
                    { label: '09:00', hour: 9 },
                    { label: '12:00', hour: 12 },
                    { label: '15:00', hour: 15 },
                    { label: '18:00', hour: 18 },
                    { label: '20:00', hour: 20 },
                  ].map(({ label, hour }) => (
                    <Button
                      key={label}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const date = new Date(selectedDate);
                        date.setHours(hour, 0, 0, 0);
                        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16);
                        setFormData({...formData, start_date: localDateTime});
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Fim</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date?.split('T')[0] || ''}
                      onChange={(e) => {
                        // Preservar o horário existente ou usar horário padrão
                        const currentTime = formData.end_date?.includes('T') 
                          ? formData.end_date.split('T')[1] 
                          : '10:00';
                        setFormData({...formData, end_date: `${e.target.value}T${currentTime}`});
                      }}
                      className="mb-2"
                    />
                  </div>
                  <div>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_date?.includes('T') ? formData.end_date.split('T')[1] : ''}
                      onChange={(e) => {
                        // Preservar a data existente ou usar a data selecionada
                        const currentDate = formData.end_date?.includes('T') 
                          ? formData.end_date.split('T')[0] 
                          : formData.start_date.split('T')[0]; // Usar mesma data do início
                        setFormData({...formData, end_date: `${currentDate}T${e.target.value}`});
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Local do evento"
                />
              </div>

              {formData.event_type === 'game' && (
                <div className="space-y-2">
                  <Label htmlFor="opponent">Adversário</Label>
                  <Input
                    id="opponent"
                    value={formData.opponent}
                    onChange={(e) => setFormData({...formData, opponent: e.target.value})}
                    placeholder="Time adversário"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detalhes do evento"
                  rows={3}
                />
              </div>

              <div 
                className="flex gap-2 pt-4"
                ref={(el) => {
                  if (el && isCreateDialogOpen) {
                    // Calcular altura do botão + margem para o padding do DialogContent
                    const height = el.getBoundingClientRect().height;
                    setDialogHeight(height);
                  }
                }}
              >
                <Button type="submit" className="flex-1">
                  {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingEvent(null);
                  resetForm();
                }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}