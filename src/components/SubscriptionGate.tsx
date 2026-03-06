import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { SubscriptionExpiredOverlay } from "./SubscriptionExpiredOverlay";

// ── Cache de assinatura ───────────────────────────────────────────────────────
const SUB_CACHE_KEY = 'ym_sub_cache';

interface SubCache {
  status: string;           // 'active' | 'cancelled' | 'refunded' | 'none'
  expires_at: string | null;
  plan: string | null;
  cached_at: number;        // timestamp em ms
}

function saveSubCache(data: SubCache) {
  try { localStorage.setItem(SUB_CACHE_KEY, JSON.stringify(data)); } catch { /* */ }
}

function loadSubCache(): SubCache | null {
  try {
    const raw = localStorage.getItem(SUB_CACHE_KEY);
    if (!raw) return null;
    const cache: SubCache = JSON.parse(raw);
    // Cache válido por 24 h — depois disso, exige conexão para atualizar
    const ageMs = Date.now() - cache.cached_at;
    if (ageMs > 24 * 60 * 60 * 1000) return null;
    return cache;
  } catch { return null; }
}

function clearSubCache() {
  localStorage.removeItem(SUB_CACHE_KEY);
}

function isSubActiveFromCache(cache: SubCache): boolean {
  if (cache.status !== 'active') return false;
  if (!cache.expires_at) return false;
  return new Date(cache.expires_at) > new Date();
}
// ─────────────────────────────────────────────────────────────────────────────

interface SubscriptionGateProps {
  children: React.ReactNode;
}

type GateStatus = 'checking' | 'active' | 'expired' | 'never_subscribed';

interface SubscriptionInfo {
  status: GateStatus;
  expiredAt?: string | null;
  plan?: string | null;
  fromCache?: boolean;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { user, loading: authLoading, isOffline } = useAuth();
  const [info, setInfo] = useState<SubscriptionInfo>({ status: 'checking' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setInfo({ status: 'never_subscribed' });
      return;
    }

    const check = async () => {
      // ── Modo offline: usar cache ───────────────────────────────────────
      if (isOffline || !navigator.onLine) {
        const cache = loadSubCache();
        if (cache) {
          if (isSubActiveFromCache(cache)) {
            setInfo({ status: 'active', fromCache: true });
          } else if (cache.status === 'active' && cache.expires_at && new Date(cache.expires_at) <= new Date()) {
            // Assinatura expirou enquanto estava offline
            setInfo({ status: 'expired', expiredAt: cache.expires_at, plan: cache.plan, fromCache: true });
          } else if (cache.status === 'none' || !cache.status) {
            setInfo({ status: 'never_subscribed' });
          } else {
            setInfo({ status: 'expired', expiredAt: cache.expires_at, plan: cache.plan, fromCache: true });
          }
        } else {
          // Sem cache e sem internet → não conseguimos verificar
          setInfo({ status: 'never_subscribed' });
        }
        return;
      }

      // ── Online: verificar no Supabase e atualizar cache ────────────────
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_expires_at, subscription_plan')
          .eq('id', user.id)
          .maybeSingle();

        const hasExpiry  = !!profile?.subscription_expires_at;
        const expiryDate = hasExpiry ? new Date(profile.subscription_expires_at!) : null;
        const isExpired  = expiryDate !== null && expiryDate <= new Date();
        const isActive   = profile?.subscription_status === 'active' && expiryDate !== null && !isExpired;

        if (isActive) {
          saveSubCache({
            status:    'active',
            expires_at: profile!.subscription_expires_at,
            plan:      profile!.subscription_plan ?? null,
            cached_at: Date.now(),
          });
          setInfo({ status: 'active' });
          return;
        }

        if (hasExpiry || profile?.subscription_status === 'cancelled' || profile?.subscription_status === 'refunded') {
          saveSubCache({
            status:    profile?.subscription_status ?? 'expired',
            expires_at: profile?.subscription_expires_at ?? null,
            plan:      profile?.subscription_plan ?? null,
            cached_at: Date.now(),
          });
          setInfo({
            status:    'expired',
            expiredAt: profile?.subscription_expires_at,
            plan:      profile?.subscription_plan,
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
          await supabase
            .from('profiles')
            .update({ subscription_status: 'active', subscription_expires_at: activeSub.expires_at })
            .eq('id', user.id);
          saveSubCache({
            status:    'active',
            expires_at: activeSub.expires_at,
            plan:      null,
            cached_at: Date.now(),
          });
          setInfo({ status: 'active' });
          return;
        }

        const { data: expiredSub } = await supabase
          .from('user_subscriptions')
          .select('id, expires_at, plan:plan_id(name)')
          .eq('user_id', user.id)
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (expiredSub) {
          saveSubCache({
            status:    'expired',
            expires_at: expiredSub.expires_at,
            plan:      null,
            cached_at: Date.now(),
          });
          setInfo({ status: 'expired', expiredAt: expiredSub.expires_at });
          return;
        }

        saveSubCache({ status: 'none', expires_at: null, plan: null, cached_at: Date.now() });
        setInfo({ status: 'never_subscribed' });

      } catch {
        // Falha de rede inesperada — tentar cache
        const cache = loadSubCache();
        if (cache && isSubActiveFromCache(cache)) {
          setInfo({ status: 'active', fromCache: true });
        } else {
          setInfo({ status: 'never_subscribed' });
        }
      }
    };

    check();
  }, [user, authLoading, isOffline]);

  // Quando voltar online, re-verificar
  useEffect(() => {
    if (!isOffline && user && !authLoading) {
      clearSubCache();
      setInfo({ status: 'checking' });
    }
  }, [isOffline]);

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

  if (!user) return <Navigate to="/auth/login" replace />;

  if (info.status === 'never_subscribed') return <Navigate to="/plans" replace />;

  if (info.status === 'expired') {
    return (
      <>
        {children}
        <SubscriptionExpiredOverlay expiredAt={info.expiredAt} plan={info.plan} />
      </>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGate;
