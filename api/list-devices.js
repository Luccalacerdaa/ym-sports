import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Buscar TODOS os dispositivos cadastrados
    const { data: devices, error } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Estatísticas gerais
    const totalDevices = devices?.length || 0;
    const uniqueUsers = new Set(devices?.map(d => d.user_id) || []).size;
    
    // Agrupar por usuário
    const devicesByUser = devices?.reduce((acc, device) => {
      if (!acc[device.user_id]) {
        acc[device.user_id] = [];
      }
      acc[device.user_id].push({
        id: device.id,
        endpoint_preview: device.endpoint.substring(0, 80) + '...',
        created_at: device.created_at,
        updated_at: device.updated_at,
        is_old: !device.updated_at // Se não tem updated_at, é do sistema antigo
      });
      return acc;
    }, {});

    // Identificar dispositivos "antigos" (sem updated_at)
    const oldDevices = devices?.filter(d => !d.updated_at) || [];
    const newDevices = devices?.filter(d => d.updated_at) || [];

    console.log(`📊 Dispositivos cadastrados:
      Total: ${totalDevices}
      Usuários únicos: ${uniqueUsers}
      Sistema NOVO (com updated_at): ${newDevices.length}
      Sistema ANTIGO (sem updated_at): ${oldDevices.length}
    `);

    return res.status(200).json({
      success: true,
      statistics: {
        total_devices: totalDevices,
        unique_users: uniqueUsers,
        new_system: newDevices.length,
        old_system: oldDevices.length,
        percentage_updated: totalDevices > 0 
          ? Math.round((newDevices.length / totalDevices) * 100) 
          : 0
      },
      devices_by_user: devicesByUser,
      old_devices: oldDevices.map(d => ({
        id: d.id,
        user_id: d.user_id,
        endpoint_preview: d.endpoint.substring(0, 80) + '...',
        created_at: d.created_at
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao listar dispositivos:', error);
    return res.status(500).json({ 
      error: error.message,
      hint: 'Verifique se a tabela push_subscriptions existe e tem a coluna updated_at'
    });
  }
}

