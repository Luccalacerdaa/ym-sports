import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useScheduledNotifications, ScheduledNotification } from "@/hooks/useScheduledNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Bell, BellOff, Calendar, Clock, Trash2, Plus, Droplet, Coffee, Utensils, Dumbbell, Settings } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationManagerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationManager({ open, onClose }: NotificationManagerProps) {
  const { user } = useAuth();
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    createNotification, 
    updateNotification, 
    deleteNotification,
    createMealNotifications,
    createHydrationNotifications,
    createTrainingNotifications,
    setupDefaultNotifications
  } = useScheduledNotifications();

  const [activeTab, setActiveTab] = useState("all");
  const [showNewNotification, setShowNewNotification] = useState(false);
  const [newNotification, setNewNotification] = useState<Omit<ScheduledNotification, 'user_id'>>({
    title: "",
    body: "",
    type: "general",
    scheduled_for: new Date().toISOString(),
    active: true
  });

  // Carregar notificações quando o componente for montado
  useEffect(() => {
    if (open && user) {
      fetchNotifications();
    }
  }, [open, user]);

  // Filtrar notificações por tipo
  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(notification => notification.type === activeTab);

  // Manipuladores de eventos
  const handleToggleNotification = async (id: string, active: boolean) => {
    const success = await updateNotification(id, { active });
    if (success) {
      toast.success(active ? "Notificação ativada" : "Notificação desativada");
    } else {
      toast.error("Erro ao atualizar notificação");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta notificação?")) {
      const success = await deleteNotification(id);
      if (success) {
        toast.success("Notificação excluída com sucesso");
      } else {
        toast.error("Erro ao excluir notificação");
      }
    }
  };

  const handleCreateNotification = async () => {
    // Validar campos
    if (!newNotification.title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    if (!newNotification.body.trim()) {
      toast.error("A mensagem é obrigatória");
      return;
    }

    // Criar notificação
    const created = await createNotification(newNotification);
    if (created) {
      toast.success("Notificação criada com sucesso");
      setShowNewNotification(false);
      setNewNotification({
        title: "",
        body: "",
        type: "general",
        scheduled_for: new Date().toISOString(),
        active: true
      });
    } else {
      toast.error("Erro ao criar notificação");
    }
  };

  const handleSetupDefaultNotifications = async () => {
    if (confirm("Deseja configurar as notificações padrão? Isso criará notificações para refeições, hidratação e treinos.")) {
      const success = await setupDefaultNotifications();
      if (success) {
        toast.success("Notificações padrão configuradas com sucesso");
        fetchNotifications();
      } else {
        toast.error("Erro ao configurar notificações padrão");
      }
    }
  };

  // Renderizar ícone baseado no tipo de notificação
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "meal":
        return <Coffee className="h-5 w-5 text-orange-500" />;
      case "hydration":
        return <Droplet className="h-5 w-5 text-blue-500" />;
      case "training":
        return <Dumbbell className="h-5 w-5 text-green-500" />;
      case "event":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  // Renderizar tipo de notificação
  const renderNotificationType = (type: string) => {
    switch (type) {
      case "meal":
        return "Refeição";
      case "hydration":
        return "Hidratação";
      case "training":
        return "Treino";
      case "event":
        return "Evento";
      default:
        return "Geral";
    }
  };

  // Renderizar tipo de repetição
  const renderRepeatType = (repeatType?: string, repeatDays?: string[]) => {
    if (!repeatType || repeatType === "none") {
      return "Uma vez";
    }

    if (repeatType === "daily") {
      return "Diariamente";
    }

    if (repeatType === "weekly" && repeatDays && repeatDays.length > 0) {
      const days = repeatDays.map(day => {
        switch (day.toLowerCase()) {
          case "monday": return "Segunda";
          case "tuesday": return "Terça";
          case "wednesday": return "Quarta";
          case "thursday": return "Quinta";
          case "friday": return "Sexta";
          case "saturday": return "Sábado";
          case "sunday": return "Domingo";
          default: return day;
        }
      });

      return `Semanalmente (${days.join(", ")})`;
    }

    return "Semanalmente";
  };

  // Renderizar lista de notificações
  const renderNotificationsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          <span className="ml-2">Carregando notificações...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <BellOff className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Erro ao carregar notificações: {error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchNotifications}>
            Tentar novamente
          </Button>
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <BellOff className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowNewNotification(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova notificação
            </Button>
            <Button variant="default" onClick={handleSetupDefaultNotifications}>
              Configurar notificações padrão
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className={notification.active ? "" : "opacity-70"}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {renderNotificationIcon(notification.type)}
                  <CardTitle className="text-base ml-2">{notification.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notification.active}
                    onCheckedChange={(checked) => handleToggleNotification(notification.id!, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNotification(notification.id!)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {renderNotificationType(notification.type)}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(parseISO(notification.scheduled_for), "dd/MM/yyyy HH:mm")}
                </Badge>
                {notification.repeat_type && notification.repeat_type !== "none" && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {renderRepeatType(notification.repeat_type, notification.repeat_days)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{notification.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Renderizar formulário de nova notificação
  const renderNewNotificationForm = () => {
    return (
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={newNotification.title}
            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
            placeholder="Título da notificação"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Mensagem</Label>
          <Input
            id="body"
            value={newNotification.body}
            onChange={(e) => setNewNotification({ ...newNotification, body: e.target.value })}
            placeholder="Mensagem da notificação"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={newNotification.type}
            onValueChange={(value) => setNewNotification({ ...newNotification, type: value as any })}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Geral</SelectItem>
              <SelectItem value="meal">Refeição</SelectItem>
              <SelectItem value="hydration">Hidratação</SelectItem>
              <SelectItem value="training">Treino</SelectItem>
              <SelectItem value="event">Evento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduled_date">Data</Label>
          <Input
            id="scheduled_date"
            type="date"
            value={new Date(newNotification.scheduled_for).toISOString().split('T')[0]}
            onChange={(e) => {
              const date = new Date(e.target.value);
              const time = new Date(newNotification.scheduled_for);
              date.setHours(time.getHours(), time.getMinutes(), 0, 0);
              setNewNotification({ ...newNotification, scheduled_for: date.toISOString() });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduled_time">Hora</Label>
          <Input
            id="scheduled_time"
            type="time"
            value={new Date(newNotification.scheduled_for).toTimeString().slice(0, 5)}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':').map(Number);
              const date = new Date(newNotification.scheduled_for);
              date.setHours(hours, minutes, 0, 0);
              setNewNotification({ ...newNotification, scheduled_for: date.toISOString() });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repeat_type">Repetição</Label>
          <Select
            value={newNotification.repeat_type || "none"}
            onValueChange={(value) => setNewNotification({ ...newNotification, repeat_type: value as any })}
          >
            <SelectTrigger id="repeat_type">
              <SelectValue placeholder="Selecione o tipo de repetição" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Uma vez</SelectItem>
              <SelectItem value="daily">Diariamente</SelectItem>
              <SelectItem value="weekly">Semanalmente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="active"
            checked={newNotification.active}
            onCheckedChange={(checked) => setNewNotification({ ...newNotification, active: checked })}
          />
          <Label htmlFor="active">Ativa</Label>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        {showNewNotification ? (
          <>
            <DialogHeader>
              <DialogTitle>Nova Notificação</DialogTitle>
              <DialogDescription>
                Crie uma nova notificação programada.
              </DialogDescription>
            </DialogHeader>
            {renderNewNotificationForm()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewNotification(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateNotification}>
                Criar Notificação
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Gerenciar Notificações
              </DialogTitle>
              <DialogDescription>
                Configure e gerencie suas notificações programadas.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="meal">Refeições</TabsTrigger>
                  <TabsTrigger value="hydration">Hidratação</TabsTrigger>
                  <TabsTrigger value="training">Treinos</TabsTrigger>
                  <TabsTrigger value="general">Gerais</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab} className="mt-4">
                  {renderNotificationsList()}
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={handleSetupDefaultNotifications}>
                  Configurar Padrão
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Fechar
                  </Button>
                  <Button onClick={() => setShowNewNotification(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Notificação
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
