// Vercel Serverless Function para Notificações Agendadas
// URL: https://ym-sports.vercel.app/api/scheduled-push
// Deve ser chamado por cron job externo

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CRON_SECRET = process.env.CRON_SECRET || 'ym-sports-cron-2024';
const SEND_PUSH_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/send-push`
  : 'https://ym-sports.vercel.app/api/send-push';

// Cronograma de notificações
const NOTIFICATIONS: Record<string, { title: string; body: string }> = {
  '07:00': {
    title: '💪 Bom dia, atleta!',
    body: 'Hora de começar o dia com energia!'
  },
  '08:30': {
    title: '🏃‍♂️ Treino te espera',
    body: 'Seu treino personalizado está disponível!'
  },
  '12:00': {
    title: '🥗 Hora do almoço',
    body: 'Cuide da sua alimentação!'
  },
  '15:30': {
    title: '🎯 Foco no objetivo',
    body: 'Continue firme nos seus sonhos!'
  },
  '18:30': {
    title: '🌟 Fim de dia',
    body: 'Que tal um treino noturno?'
  },
  '20:00': {
    title: '🏆 Ranking',
    body: 'Veja sua posição no ranking!'
  }
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.authorization;
    const secret = req.body?.secret || authHeader?.replace('Bearer ', '');

    if (secret !== CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Obter horário atual em horário de Brasília (UTC-3)
    const now = new Date();
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    const currentTime = `${brasiliaTime.getUTCHours().toString().padStart(2, '0')}:${brasiliaTime.getUTCMinutes().toString().padStart(2, '0')}`;

    console.log(`⏰ Verificando notificação para ${currentTime} (horário de Brasília)...`);

    // Verificar se há notificação para este horário
    const notification = NOTIFICATIONS[currentTime];

    if (!notification) {
      console.log(`ℹ️ Nenhuma notificação agendada para ${currentTime}`);
      return res.status(200).json({
        message: `Nenhuma notificação agendada para ${currentTime}`,
        time: currentTime
      });
    }

    console.log(`📤 Enviando notificação: ${notification.title}`);

    // Chamar o endpoint de envio de push
    const response = await fetch(SEND_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        all: true,
        payload: {
          title: notification.title,
          body: notification.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          tag: `scheduled-${currentTime}`,
          url: '/dashboard'
        },
        secret: CRON_SECRET
      })
    });

    const result = await response.json();

    console.log('✅ Resultado:', result);

    return res.status(200).json({
      message: 'Notificação agendada enviada',
      time: currentTime,
      notification: notification,
      result: result
    });

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return res.status(500).json({ error: error.message });
  }
}
