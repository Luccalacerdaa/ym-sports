import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

/**
 * Verifica se o usuário tem assinatura ativa antes de acessar o dashboard.
 * Consulta diretamente a tabela profiles.subscription_status para ser rápido e confiável.
 * Sem assinatura ativa → redireciona para /plans.
 */
const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setStatus('inactive');
      return;
    }

    const checkSubscription = async () => {
      try {
        // Verificar subscription_status no profile (atualizado diretamente pelo webhook)
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_expires_at')
          .eq('id', user.id)
          .maybeSingle();

        const isActiveInProfile =
          profile?.subscription_status === 'active' &&
          profile?.subscription_expires_at &&
          new Date(profile.subscription_expires_at) > new Date();

        if (isActiveInProfile) {
          setStatus('active');
          return;
        }

        // Fallback: verificar tabela user_subscriptions diretamente
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('id, expires_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (sub) {
          // Sincronizar profile caso esteja desatualizado
          await supabase
            .from('profiles')
            .update({ subscription_status: 'active', subscription_expires_at: sub.expires_at })
            .eq('id', user.id);
          setStatus('active');
          return;
        }

        setStatus('inactive');
      } catch {
        setStatus('inactive');
      }
    };

    checkSubscription();
  }, [user, authLoading]);

  if (authLoading || status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 text-yellow-500 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (status === 'inactive') {
    return <Navigate to="/plans" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGate;
