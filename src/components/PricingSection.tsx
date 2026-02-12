import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function PricingSection() {
  const { plans, hasActiveSubscription, redirectToCheckout } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  // Detectar código de afiliado na URL ao montar componente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const srcParam = urlParams.get('src') || urlParams.get('ref') || urlParams.get('aff');
    
    if (srcParam) {
      setAffiliateCode(srcParam);
      console.log('🎯 Código de afiliado detectado:', srcParam);
      // Salvar no localStorage para persistir durante cadastro
      localStorage.setItem('affiliate_code', srcParam);
    } else {
      // Tentar recuperar do localStorage
      const savedCode = localStorage.getItem('affiliate_code');
      if (savedCode) {
        setAffiliateCode(savedCode);
      }
    }
  }, []);

  const handleSubscribe = (plan: any) => {
    // Se usuário não está logado, redirecionar para cadastro
    if (!user) {
      // Salvar o plano selecionado para depois
      localStorage.setItem('selected_plan_id', plan.id);
      navigate('/signup');
      return;
    }

    // Se já tem assinatura ativa, mostrar mensagem
    if (hasActiveSubscription) {
      alert('Você já possui uma assinatura ativa!');
      navigate('/dashboard');
      return;
    }

    // Redirecionar para checkout da Hotmart
    redirectToCheckout(plan, affiliateCode || undefined);
  };

  const getPlanIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Zap className="h-6 w-6 text-blue-500" />;
      case 1:
        return <Star className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Crown className="h-6 w-6 text-purple-500" />;
      default:
        return <Check className="h-6 w-6" />;
    }
  };

  const getPlanBadge = (index: number) => {
    switch (index) {
      case 1:
        return <Badge className="bg-yellow-500 text-black">Mais Popular</Badge>;
      case 2:
        return <Badge className="bg-purple-500 text-white">Melhor Valor</Badge>;
      default:
        return null;
    }
  };

  if (plans.length === 0) {
    return null;
  }

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bebas text-white mb-4">
            ESCOLHA SEU PLANO
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Invista no seu futuro como atleta. Todos os recursos inclusos.
          </p>
          
          {affiliateCode && (
            <div className="mt-4 inline-block">
              <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-500">
                🎁 Link de afiliado aplicado
              </Badge>
            </div>
          )}
        </div>

        {/* Cards de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = index === 1;
            
            return (
              <Card 
                key={plan.id}
                className={`relative ${
                  isPopular 
                    ? 'border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20 scale-105' 
                    : 'border-gray-800'
                } bg-gray-900/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300`}
              >
                {/* Badge */}
                {getPlanBadge(index) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    {getPlanBadge(index)}
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(index)}
                  </div>
                  
                  <CardTitle className="text-2xl font-bebas text-white">
                    {plan.name}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-400">
                    {plan.description}
                  </CardDescription>

                  {/* Preço */}
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-gray-400 text-lg">R$</span>
                      <span className="text-5xl font-bold text-yellow-500">
                        {plan.price_brl.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      {plan.duration_days} dias de acesso completo
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Botão */}
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full ${
                      isPopular
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                    size="lg"
                  >
                    Assinar Agora
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Pagamento seguro via Hotmart
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Garantia */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-green-500/10 border border-green-500 rounded-lg px-6 py-4">
            <p className="text-green-500 font-medium">
              🛡️ Garantia de 7 dias - 100% do seu dinheiro de volta
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
