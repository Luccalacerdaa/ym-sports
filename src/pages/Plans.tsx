import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Check, Star, Zap, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import logoImage from "@/assets/ym-sports-logo-white-bg.png";

type PlanKey = "monthly" | "quarterly" | "biannual";

const planDurations: Record<PlanKey, number> = {
  monthly: 30,
  quarterly: 90,
  biannual: 180,
};

const planLabels: Record<PlanKey, { name: string; badge?: string; savings?: string }> = {
  monthly: { name: "Mensal" },
  quarterly: { name: "Trimestral", badge: "MAIS POPULAR", savings: "Economia de 16%" },
  biannual: { name: "Semestral", savings: "Economia de 21%" },
};

export default function Plans() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { plans, hasActiveSubscription, loading, redirectToCheckout } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("quarterly");

  // Se já tem assinatura, vai direto para o dashboard
  useEffect(() => {
    if (!loading && hasActiveSubscription) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, hasActiveSubscription, navigate]);

  // Pegar afiliado do localStorage se houver
  const affiliateCode = localStorage.getItem("affiliate_code");

  const handleSelectPlan = () => {
    const duration = planDurations[selectedPlan];
    const matchingPlan = plans.find((p) => p.duration_days === duration);

    if (!matchingPlan) return;

    if (user) {
      localStorage.setItem("selected_plan_id", matchingPlan.id);
      redirectToCheckout(matchingPlan, affiliateCode || undefined);
    } else {
      localStorage.setItem("selected_plan_duration", String(duration));
      navigate("/auth/signup");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const features = [
    "Treinos personalizados com IA",
    "Planos nutricionais completos",
    "Ranking nacional de jogadores",
    "Portfólio profissional de atleta",
    "Calendário de eventos e lembretes",
    "Projeção de altura",
    "Suporte prioritário via WhatsApp",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe-top pb-4 pt-6">
        <img src={logoImage} alt="YM Sports" className="h-10 object-contain" />
        {user && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center px-5 pb-10">
        {/* Title */}
        <div className="text-center mb-8 mt-4">
          {user ? (
            <>
              <p className="text-yellow-400 text-sm font-semibold mb-2 tracking-widest uppercase">
                Quase lá!
              </p>
              <h1 className="text-3xl font-black text-white leading-tight">
                Escolha seu plano
              </h1>
              <p className="text-gray-400 mt-2 text-sm">
                Selecione o plano e complete o pagamento para ativar sua conta
              </p>
            </>
          ) : (
            <>
              <p className="text-yellow-400 text-sm font-semibold mb-2 tracking-widest uppercase">
                Comece agora
              </p>
              <h1 className="text-3xl font-black text-white leading-tight">
                Escolha seu plano
              </h1>
              <p className="text-gray-400 mt-2 text-sm">
                Acesso completo a todas as ferramentas do atleta
              </p>
            </>
          )}
        </div>

        {/* Plan cards */}
        <div className="w-full max-w-md space-y-3 mb-6">
          {(["monthly", "quarterly", "biannual"] as PlanKey[]).map((key) => {
            const duration = planDurations[key];
            const plan = plans.find((p) => p.duration_days === duration);
            const label = planLabels[key];
            const isSelected = selectedPlan === key;
            const isPopular = key === "quarterly";

            return (
              <button
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 relative ${
                  isSelected
                    ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                    : "border-gray-800 bg-gray-900/50 hover:border-gray-600"
                }`}
              >
                {/* Badge */}
                {label.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-0.5 rounded-full">
                    {label.badge}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Radio */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "border-yellow-500 bg-yellow-500"
                          : "border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-black rounded-full" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          {label.name}
                        </span>
                        {label.savings && (
                          <span className="text-xs text-green-400 font-medium">
                            {label.savings}
                          </span>
                        )}
                      </div>
                      {plan && key === "quarterly" && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Apenas R$ 33,30/mês
                        </p>
                      )}
                      {plan && key === "biannual" && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Apenas R$ 31,65/mês
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {plan ? (
                      <>
                        <span className="text-xl font-black text-white">
                          R$ {plan.price_brl.toFixed(2).replace(".", ",")}
                        </span>
                        {key === "monthly" && (
                          <p className="text-xs text-gray-500">/mês</p>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">Carregando...</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Features */}
        <div className="w-full max-w-md mb-8">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 text-center">
            Incluso em todos os planos
          </p>
          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-yellow-500" strokeWidth={3} />
                </div>
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="w-full max-w-md space-y-3">
          <Button
            onClick={handleSelectPlan}
            className="w-full h-14 text-lg font-black bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:shadow-[0_0_40px_rgba(234,179,8,0.7)] transition-all"
            disabled={plans.length === 0}
          >
            <Zap className="mr-2 h-5 w-5" />
            Assinar agora
          </Button>

          <div className="flex items-center justify-center gap-2 text-gray-600 text-xs">
            <Shield className="h-3 w-3" />
            <span>Pagamento 100% seguro via Hotmart</span>
          </div>

          {!user && (
            <p className="text-center text-gray-600 text-xs">
              Já tem uma conta?{" "}
              <button
                onClick={() => navigate("/auth/login")}
                className="text-yellow-500 hover:text-yellow-400 font-medium"
              >
                Fazer login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
