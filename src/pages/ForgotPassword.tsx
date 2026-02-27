import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import logoImage from "@/assets/ym-sports-logo-white-bg.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const siteUrl = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-password`,
      });

      if (error) {
        toast.error("Erro ao enviar email: " + error.message);
      } else {
        setSent(true);
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-secondary to-black p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/auth/login")}
        className="absolute left-4 text-foreground hover:text-primary flex items-center gap-2"
        style={{ top: "calc(1rem + env(safe-area-inset-top, 0px))" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card className="w-full max-w-md animate-scale-in border-border bg-card/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex items-center justify-center">
            <img src={logoImage} alt="YM Sports Logo" className="w-24 h-24 object-contain" />
          </div>
          {!sent ? (
            <>
              <CardTitle className="text-3xl font-bold">Redefinir senha</CardTitle>
              <CardDescription className="text-muted-foreground">
                Digite seu email e enviaremos um link para criar uma nova senha.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Email enviado!</CardTitle>
              <CardDescription className="text-muted-foreground">
                Verifique sua caixa de entrada (e a pasta de spam) e clique no link para criar sua senha.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail da sua compra</Label>
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
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar link de acesso
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/auth/login")}
                variant="hero"
                size="lg"
                className="w-full"
              >
                Ir para o Login
              </Button>
              <Button
                onClick={() => { setSent(false); setEmail(""); }}
                variant="ghost"
                className="w-full text-muted-foreground text-sm"
              >
                Reenviar para outro email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Lembrou a senha?{" "}
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

export default ForgotPassword;
