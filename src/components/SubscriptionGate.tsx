import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { SubscriptionExpiredOverlay } from "./SubscriptionExpiredOverlay";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

type GateStatus = 'checking' | 'active' | 'expired' | 'never_subscribed';

interface SubscriptionInfo {
  status: GateStatus;
  expiredAt?: string | null;
  plan?: string | null;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<SubscriptionInfo>({ status: 'checking' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setInfo({ status: 'never_subscribed' });
      return;
    }

    const check = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_expires_at, subscription_plan')
          .eq('id', user.id)
          .maybeSingle();

        const hasExpiry = !!profile?.subscription_expires_at;
        const expiryDate = hasExpiry ? new Date(profile.subscription_expires_at!) : null;
        const isExpired = expiryDate !== null && expiryDate <= new Date();
        const isActive = profile?.subscription_status === 'active' && expiryDate !== null && !isExpired;

        // Assinatura ativa → acesso liberado
        if (isActive) {
          setInfo({ status: 'active' });
          return;
        }

        // Tinha assinatura mas expirou → mostrar overlay de renovação
        if (hasExpiry || profile?.subscription_status === 'cancelled' || profile?.subscription_status === 'refunded') {
          setInfo({
            status: 'expired',
            expiredAt: profile?.subscription_expires_at,
            plan: profile?.subscription_plan,
          });
          return;
        }

        // Fallback: verificar user_subscriptions diretamente
        const { data: activeSub } = await supabase
          .from('user_subscriptions')
          .select('id, expires_at, plan:plan_id(name)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (activeSub) {
          // Sincronizar profile
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_expires_at: activeSub.expires_at,
            })
            .eq('id', user.id);
          setInfo({ status: 'active' });
          return;
        }

        // Verificar se teve assinatura expirada em user_subscriptions
        const { data: expiredSub } = await supabase
          .from('user_subscriptions')
          .select('id, expires_at, plan:plan_id(name)')
          .eq('user_id', user.id)
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (expiredSub) {
          setInfo({
            status: 'expired',
            expiredAt: expiredSub.expires_at,
          });
          return;
        }

        // Nunca teve assinatura → ir para /plans (novo usuário)
        setInfo({ status: 'never_subscribed' });
      } catch {
        setInfo({ status: 'never_subscribed' });
      }
    };

    check();
  }, [user, authLoading]);

  // Loading
  if (authLoading || info.status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 text-yellow-500 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não logado → login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Nunca assinou → /plans (selecionar plano)
  if (info.status === 'never_subscribed') {
    return <Navigate to="/plans" replace />;
  }

  // Assinatura expirada → mostrar overlay bloqueante por cima do conteúdo
  if (info.status === 'expired') {
    return (
      <>
        {children}
        <SubscriptionExpiredOverlay
          expiredAt={info.expiredAt}
          plan={info.plan}
        />
      </>
    );
  }

  // Ativo → acesso liberado
  return <>{children}</>;
};

export default SubscriptionGate;
