import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import logoImage from "@/assets/ym-sports-logo-white-bg.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase insere o token na URL ao clicar no link do email.
    // O cliente JS detecta automaticamente e inicia a sessão.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error("Erro ao atualizar senha: " + error.message);
      } else {
        setDone(true);
        setTimeout(() => navigate("/dashboard"), 2500);
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-secondary to-black p-4">
      <Card className="w-full max-w-md animate-scale-in border-border bg-card/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex items-center justify-center">
            <img src={logoImage} alt="YM Sports Logo" className="w-24 h-24 object-contain" />
          </div>
          {done ? (
            <>
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Senha criada!</CardTitle>
              <CardDescription>Redirecionando para o app...</CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-3xl font-bold">Criar senha</CardTitle>
              <CardDescription className="text-muted-foreground">
                Escolha uma senha para acessar sua conta YM Sports.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {!done && (
            <>
              {!sessionReady && (
                <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground text-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                  Validando link de acesso...
                </div>
              )}
              {sessionReady && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirmar senha</Label>
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar senha e entrar"}
                  </Button>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
