import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

/**
 * Garante que o usuário tenha assinatura ativa antes de acessar o dashboard.
 * Sem assinatura → redireciona para /plans.
 */
const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();

  if (authLoading || subLoading) {
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

  if (!hasActiveSubscription) {
    return <Navigate to="/plans" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGate;
