import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  duration_days: number;
  hotmart_product_id: string;
  hotmart_checkout_code: string;
  hotmart_offer_code: string;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'pending' | 'active' | 'cancelled' | 'expired' | 'refunded';
  started_at: string;
  expires_at: string;
  affiliate_code?: string;
  affiliate_name?: string;
  plan?: SubscriptionPlan;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Buscar planos disponíveis
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_brl', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
  };

  // Buscar assinatura atual do usuário
  const fetchCurrentSubscription = async () => {
    if (!user) {
      setCurrentSubscription(null);
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:plan_id (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      setCurrentSubscription(data);
      setHasActiveSubscription(!!data);
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      setCurrentSubscription(null);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  // Gerar link de checkout da Hotmart
  // Usa go.hotmart.com/{checkout_code} que aceita query params e redireciona para o checkout real
  const generateCheckoutLink = (plan: SubscriptionPlan, affiliateCode?: string): string => {
    const checkoutCode = plan.hotmart_checkout_code || plan.hotmart_product_id;
    const baseUrl = `https://go.hotmart.com/${checkoutCode}`;
    
    const params = new URLSearchParams();
    
    // Passar user_id como parâmetro customizado (a Hotmart devolve no webhook via sck)
    if (user?.id) {
      params.append('sck', user.id);
    }
    
    // Adicionar código do afiliado se houver
    if (affiliateCode) {
      params.append('ap', affiliateCode);
    }
    
    // Adicionar email do usuário para pré-preencher checkout
    if (user?.email) {
      params.append('email', user.email);
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Redirecionar para checkout
  const redirectToCheckout = (plan: SubscriptionPlan, affiliateCode?: string) => {
    const checkoutUrl = generateCheckoutLink(plan, affiliateCode);
    window.location.href = checkoutUrl;
  };

  // Verificar status da assinatura (útil após redirect de volta da Hotmart)
  const checkSubscriptionStatus = async (): Promise<boolean> => {
    await fetchCurrentSubscription();
    return hasActiveSubscription;
  };

  // Cancelar assinatura (pode implementar depois)
  const cancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      await fetchCurrentSubscription();
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchCurrentSubscription();
  }, [user?.id]);

  return {
    plans,
    currentSubscription,
    hasActiveSubscription,
    loading,
    generateCheckoutLink,
    redirectToCheckout,
    checkSubscriptionStatus,
    cancelSubscription,
    fetchCurrentSubscription
  };
};
