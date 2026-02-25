import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Check, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import logoImage from "@/assets/ym-sports-logo-white-bg.png";
import stadiumBwImage from "@/assets/stadium-bw.jpg";

type PlanKey = "monthly" | "quarterly" | "biannual";

const planDurations: Record<PlanKey, number> = {
  monthly: 30,
  quarterly: 90,
  biannual: 180,
};

const planPrices: Record<PlanKey, { value: number; total?: number; label: string; discount?: string }> = {
  monthly: { value: 39.90, label: "Mensal" },
  quarterly: { value: 33.30, total: 99.90, label: "Trimestral", discount: "16% OFF" },
  biannual: { value: 31.65, total: 189.90, label: "Semestral", discount: "21% OFF" },
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

  const affiliateCode = localStorage.getItem("affiliate_code");

  const handleSelectPlan = () => {
    const duration = planDurations[selectedPlan];
    const matchingPlan = plans.find((p) => p.duration_days === duration);

    if (!matchingPlan) {
      // Se não há planos no banco ainda, ir para signup/plans depois
      if (!user) {
        navigate("/auth/signup");
        return;
      }
      return;
    }

    if (!user) {
      localStorage.setItem("selected_plan_id", matchingPlan.id);
      localStorage.setItem("selected_plan_duration", String(duration));
      navigate("/auth/signup");
      return;
    }

    redirectToCheckout(matchingPlan, affiliateCode || undefined);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 pb-4"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1.5rem)' }}
      >
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

      <div className="flex-1 flex flex-col items-center px-4 pb-10">
        {/* Title */}
        <div className="text-center mb-8 mt-2">
          <h2 className="font-bebas uppercase leading-[0.9] mb-4">
            <div className="text-white text-[clamp(2rem,6vw,4rem)] mb-1">CADA GRANDE JOGADOR</div>
            <div className="text-yellow-500 text-[clamp(1.8rem,5vw,3.5rem)] mb-2">
              COMEÇOU COM UM PRIMEIRO PASSO
            </div>
            <div className="text-yellow-500 font-bold tracking-wide text-[clamp(2.8rem,7vw,5rem)]">
              DÊ O SEU AGORA!
            </div>
          </h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Porque todo sonho merece uma chance real.
          </p>
        </div>

        <div className="w-full max-w-xl">
          {/* Toggle Group — idêntico à landing */}
          <div className="flex justify-center mb-8">
            <ToggleGroup
              type="single"
              value={selectedPlan}
              onValueChange={(v) => v && setSelectedPlan(v as PlanKey)}
              className="bg-card rounded-xl p-2 gap-2"
            >
              <ToggleGroupItem
                value="monthly"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground px-6 py-3 rounded-lg transition-all hover:bg-primary/20"
              >
                Mensal
              </ToggleGroupItem>
              <ToggleGroupItem
                value="quarterly"
                className="data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground px-6 py-3 rounded-lg transition-all relative hover:bg-green-500/20"
              >
                Trimestral
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  16%
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="biannual"
                className="data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground px-6 py-3 rounded-lg transition-all relative hover:bg-green-500/20"
              >
                Semestral
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  21%
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Pricing Card — idêntico à landing */}
          <Card
            className={`p-8 md:p-10 text-center relative overflow-hidden shadow-xl transition-all duration-300 ${
              selectedPlan === "quarterly"
                ? "border-2 border-yellow-500 shadow-[0_0_40px_rgba(252,211,77,0.8)]"
                : "border-border hover:border-primary hover:shadow-[0_0_30px_rgba(252,211,77,0.6)]"
            }`}
          >
            {/* Background */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-50"
              style={{ backgroundImage: `url(${stadiumBwImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />

            <div className="relative z-10">
              {/* Preço */}
              <div className="mb-6">
                <div className="text-5xl md:text-6xl font-bold text-foreground mb-2">
                  R$ {planPrices[selectedPlan].value.toFixed(2).replace(".", ",")}
                  <span className="text-2xl text-muted-foreground">/mês</span>
                </div>
                {selectedPlan !== "monthly" && (
                  <div className="text-muted-foreground">
                    Total: R$ {planPrices[selectedPlan].total!.toFixed(2).replace(".", ",")} por{" "}
                    {selectedPlan === "quarterly" ? "3 meses" : "6 meses"}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {[
                  "Calendário inteligente de jogos",
                  "Treinos personalizados com IA",
                  "Ranking regional atualizado",
                  "Portfólio de divulgação pessoal",
                  "Benefícios e oportunidades de divulgação de atletas",
                ].map((feature) => (
                  <li key={feature} className="flex items-center justify-center gap-2 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="hero" size="xl" onClick={handleSelectPlan} className="w-full md:w-auto">
                Assinar {planPrices[selectedPlan].label}
              </Button>
            </div>
          </Card>

          {/* Segurança */}
          <div className="flex items-center justify-center gap-2 text-gray-600 text-xs mt-4">
            <Shield className="h-3 w-3" />
            <span>Pagamento 100% seguro via Hotmart</span>
          </div>

          {!user && (
            <p className="text-center text-gray-600 text-xs mt-3">
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
