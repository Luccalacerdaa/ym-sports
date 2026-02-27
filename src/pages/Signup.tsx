import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import logoImage from "@/assets/ym-sports-logo-white-bg.png";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { plans, generateCheckoutLink } = useSubscription();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Criar usuário no Supabase Auth
      const { data, error } = await signUp(formData.email, formData.password);
      
      if (error) {
        toast.error("Erro ao criar conta: " + error.message);
        return;
      }

      // Se o usuário foi criado, salvar dados do perfil
      if (data.user) {
        
        try {
          const profileData = {
            id: data.user.id,
            name: formData.name || 'Usuário',
            age: formData.age ? parseInt(formData.age) : null,
            height: formData.height ? parseInt(formData.height) : null,
            weight: formData.weight ? parseInt(formData.weight) : null,
            email: formData.email,
          };
          
          console.log("Dados do perfil a serem salvos:", profileData);
          
          const { data: profileResult, error: profileError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();

          if (profileError) {
            console.error("Erro ao salvar perfil:", profileError);
            toast.warning("Conta criada, mas houve problema ao salvar o perfil. Você pode editar depois.");
          } else {
            console.log("Perfil criado com sucesso:", profileResult);
            toast.success("Perfil criado com sucesso!");
          }
        } catch (profileError) {
          console.error("Erro ao salvar perfil:", profileError);
          toast.warning("Conta criada, mas houve problema ao salvar o perfil. Você pode editar depois.");
        }
      }

      toast.success("Conta criada com sucesso!");

      // Se havia um plano selecionado antes do cadastro, ir direto ao checkout
      const savedDuration = localStorage.getItem('selected_plan_duration');
      if (savedDuration && data.user) {
        const duration = Number(savedDuration);
        const matchingPlan = plans.find(p => p.duration_days === duration);
        if (matchingPlan) {
          const affiliateCode = localStorage.getItem('affiliate_code') || undefined;
          // generateCheckoutLink precisa do user — criar objeto mínimo compatível
          const checkoutUrl = `https://pay.hotmart.com/${matchingPlan.hotmart_checkout_code || matchingPlan.hotmart_product_id}?off=${matchingPlan.hotmart_offer_code || ''}&sck=${data.user.id}&email=${encodeURIComponent(formData.email)}${affiliateCode ? `&ap=${affiliateCode}` : ''}`;
          localStorage.removeItem('selected_plan_duration');
          localStorage.removeItem('selected_plan_id');
          window.location.href = checkoutUrl;
          return;
        }
      }

      navigate("/plans");
    } catch (error) {
      toast.error("Erro inesperado ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-secondary to-black p-4 py-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute left-4 text-foreground hover:text-primary flex items-center gap-2"
        style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      <Card className="w-full max-w-md animate-scale-in border-border bg-card/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="YM Sports Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Crie sua conta</CardTitle>
          <CardDescription className="text-muted-foreground">
            Comece sua jornada no YM Sports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <button
                onClick={() => navigate("/auth/login")}
                className="text-primary hover:underline font-medium"
              >
                Entrar
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
