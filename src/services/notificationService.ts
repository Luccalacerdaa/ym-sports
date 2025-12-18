/**
 * Serviço Centralizado de Notificações
 * 
 * Gerencia todas as notificações push do app:
 * - Eventos do calendário
 * - Conquistas desbloqueadas
 * - Level Up
 * - Lembretes de treino
 * - Hidratação
 * - Motivação diária
 */

export interface NotificationPayload {
  user_id: string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export class NotificationService {
  private static API_URL = '/api/notify';

  /**
   * Enviar notificação genérica
   */
  static async send(payload: NotificationPayload): Promise<boolean> {
    try {
      console.log(`📤 Enviando notificação: ${payload.title}`);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: payload.user_id,
          title: payload.title,
          body: payload.body,
          url: payload.url || '/dashboard',
          icon: payload.icon || '/icons/icon-192.png'
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`✅ Notificação enviada: ${result.sent}/${result.total}`);
        return true;
      } else {
        console.warn(`⚠️ Notificação não enviada: ${result.error || 'Erro desconhecido'}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      return false;
    }
  }

  /**
   * LEVEL UP - Usuário subiu de nível
   */
  static async levelUp(user_id: string, newLevel: number): Promise<boolean> {
    return this.send({
      user_id,
      title: '📈 Level Up!',
      body: `Parabéns! Você alcançou o nível ${newLevel}!`,
      url: '/dashboard/profile'
    });
  }

  /**
   * CONQUISTA - Nova conquista desbloqueada
   */
  static async achievement(user_id: string, achievementName: string, achievementDescription: string): Promise<boolean> {
    return this.send({
      user_id,
      title: '🏆 Nova Conquista!',
      body: `${achievementName}: ${achievementDescription}`,
      url: '/dashboard/achievements'
    });
  }

  /**
   * EVENTO - Lembrete de evento do calendário
   */
  static async eventReminder(
    user_id: string, 
    eventTitle: string, 
    minutesUntil: number, 
    location?: string
  ): Promise<boolean> {
    const locationText = location ? ` - ${location}` : '';
    
    if (minutesUntil <= 0) {
      // Evento começando agora
      return this.send({
        user_id,
        title: `🚀 ${eventTitle}`,
        body: `Está começando agora!${locationText}`,
        url: '/dashboard/calendar'
      });
    } else if (minutesUntil <= 10) {
      // Aviso de 10 minutos
      return this.send({
        user_id,
        title: `⚠️ ${eventTitle}`,
        body: `Faltam apenas ${minutesUntil} minutos!${locationText}`,
        url: '/dashboard/calendar'
      });
    } else {
      // Aviso de 30 minutos
      return this.send({
        user_id,
        title: `📅 ${eventTitle}`,
        body: `Começa em ${minutesUntil} minutos${locationText}`,
        url: '/dashboard/calendar'
      });
    }
  }

  /**
   * TREINO - Lembrete para fazer treino
   */
  static async workoutReminder(user_id: string): Promise<boolean> {
    return this.send({
      user_id,
      title: '💪 Hora do Treino!',
      body: 'Seu treino personalizado te espera. Vamos lá!',
      url: '/dashboard/training'
    });
  }

  /**
   * HIDRATAÇÃO - Lembrete para beber água
   */
  static async hydration(user_id: string): Promise<boolean> {
    return this.send({
      user_id,
      title: '💧 Hora de se hidratar!',
      body: 'Beba água para manter o desempenho!',
      url: '/dashboard/nutrition'
    });
  }

  /**
   * MOTIVAÇÃO - Mensagem motivacional diária
   */
  static async dailyMotivation(user_id: string): Promise<boolean> {
    const messages = [
      'Acredite em si mesmo! Você é capaz de alcançar seus objetivos! 💪',
      'Cada treino te aproxima do seu sonho! Continue firme! ⚽',
      'A persistência é o caminho do êxito! Vamos treinar! 🎯',
      'Grandes jogadores não nascem prontos, eles se constroem! 🏆',
      'O sucesso é a soma de pequenos esforços repetidos! 🌟'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.send({
      user_id,
      title: '🌟 Mensagem do Dia',
      body: randomMessage,
      url: '/dashboard/motivational'
    });
  }

  /**
   * STREAK - Sequência de treinos mantida
   */
  static async streakMilestone(user_id: string, days: number): Promise<boolean> {
    return this.send({
      user_id,
      title: '🔥 Sequência Incrível!',
      body: `${days} dias consecutivos de treino! Você é imparável!`,
      url: '/dashboard/profile'
    });
  }

  /**
   * BEM-VINDO - Nova conta criada
   */
  static async welcome(user_id: string, userName?: string): Promise<boolean> {
    const greeting = userName ? `, ${userName}` : '';
    
    return this.send({
      user_id,
      title: '👋 Bem-vindo ao YM Sports!',
      body: `Olá${greeting}! Vamos começar sua jornada rumo ao sucesso! ⚽`,
      url: '/dashboard'
    });
  }

  /**
   * TREINO CONCLUÍDO - Parabéns por concluir treino
   */
  static async workoutCompleted(user_id: string, workoutName: string, pointsEarned: number): Promise<boolean> {
    return this.send({
      user_id,
      title: '✅ Treino Concluído!',
      body: `${workoutName} - Você ganhou ${pointsEarned} pontos!`,
      url: '/dashboard/training'
    });
  }

  /**
   * META ATINGIDA - Usuário atingiu uma meta
   */
  static async goalAchieved(user_id: string, goalDescription: string): Promise<boolean> {
    return this.send({
      user_id,
      title: '🎯 Meta Atingida!',
      body: goalDescription,
      url: '/dashboard/profile'
    });
  }

  /**
   * RANKING - Subiu de posição no ranking
   */
  static async rankingUp(user_id: string, newPosition: number, category: string): Promise<boolean> {
    return this.send({
      user_id,
      title: '📊 Subiu no Ranking!',
      body: `Você está em #${newPosition} no ranking de ${category}!`,
      url: '/dashboard/ranking'
    });
  }

  /**
   * LEMBRETE PERSONALIZADO
   */
  static async customReminder(user_id: string, title: string, message: string, url?: string): Promise<boolean> {
    return this.send({
      user_id,
      title,
      body: message,
      url: url || '/dashboard'
    });
  }
}

export default NotificationService;

