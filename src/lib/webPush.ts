// Web Push Utilities para YM Sports
// Sistema de Push Notifications que funciona com app fechado

// VAPID Keys geradas automaticamente
export const VAPID_PUBLIC_KEY = 'BDccAmSWepZa8p4veXdgB1lHFqbe8rYAES_CgFX30H-So64CED0YyLLqUAHuVP4lNk05aad5GqN6vWfZwrjQAqw';

// Converte base64 para Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Registra subscription de push
export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Verificar se já existe uma subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Criar nova subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      console.log('✅ Push subscription criada:', subscription);
    } else {
      console.log('ℹ️ Push subscription já existe');
    }
    
    return subscription;
  } catch (error) {
    console.error('❌ Erro ao criar push subscription:', error);
    return null;
  }
}

// Cancela subscription
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const success = await subscription.unsubscribe();
      console.log('✅ Push subscription cancelada');
      return success;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao cancelar push subscription:', error);
    return false;
  }
}

// Salva subscription no Supabase
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription,
  supabase: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: JSON.stringify(subscription),
        endpoint: subscription.endpoint,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('❌ Erro ao salvar subscription:', error);
      return false;
    }
    
    console.log('✅ Subscription salva no banco');
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar subscription:', error);
    return false;
  }
}

// Remove subscription do Supabase
export async function removePushSubscription(
  userId: string,
  supabase: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('❌ Erro ao remover subscription:', error);
      return false;
    }
    
    console.log('✅ Subscription removida do banco');
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover subscription:', error);
    return false;
  }
}
