import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import logoImage from "@/assets/ym-sports-logo-white-bg.png";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast.error("Erro ao fazer login: " + error.message);
      } else {
        toast.success("Login realizado com sucesso!");
        
        const userId = data?.user?.id;
        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status, subscription_expires_at')
            .eq('id', userId)
            .maybeSingle();

          const status = profile?.subscription_status;

          // Já teve assinatura (ativa, expirada, cancelada, reembolso)
          // → vai para /dashboard (SubscriptionGate mostra overlay se necessário)
          if (status && status !== 'none') {
            navigate("/dashboard");
            return;
          }

          // Nunca assinou → /plans para escolher plano
          navigate("/plans");
        } else {
          navigate("/plans");
        }
      }
    } catch (error) {
      toast.error("Erro inesperado ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-secondary to-black p-4">
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
          <CardTitle className="text-3xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-muted-foreground">
            Entre na sua conta YM Sports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-border"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/auth/forgot-password")}
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              Esqueci minha senha / Primeiro acesso
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <button
                onClick={() => navigate("/auth/signup")}
                className="text-primary hover:underline font-medium"
              >
                Comece agora!
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
