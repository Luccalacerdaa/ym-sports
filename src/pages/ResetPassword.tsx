import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import logoImage from "@/assets/ym-sports-logo-white-bg.png";

type SessionState = "loading" | "ready" | "error";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      // ── 1. Tentar trocar o code PKCE da URL por uma sessão ──────────────
      // Supabase v2 envia o link com ?code=xxx (fluxo PKCE)
      const hashParams  = new URLSearchParams(window.location.hash.replace("#", "?"));
      const queryParams = new URLSearchParams(window.location.search);

      const code         = queryParams.get("code");
      const accessToken  = hashParams.get("access_token") || queryParams.get("access_token");
      const type         = hashParams.get("type")         || queryParams.get("type");
      const errorParam   = hashParams.get("error")        || queryParams.get("error");
      const errorDesc    = hashParams.get("error_description") || queryParams.get("error_description");

      // Link inválido ou expirado
      if (errorParam) {
        setErrorMsg(errorDesc?.replace(/\+/g, " ") || "Link inválido ou expirado.");
        setSessionState("error");
        return;
      }

      // Fluxo PKCE: trocar code por sessão
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setErrorMsg("Link inválido ou expirado. Solicite um novo.");
          setSessionState("error");
          return;
        }
        setSessionState("ready");
        return;
      }

      // Fluxo legado (hash com access_token)
      if (accessToken && type === "recovery") {
        setSessionState("ready");
        return;
      }

      // ── 2. Verificar se já há sessão ativa (evento já disparou antes de montar) ──
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionState("ready");
        return;
      }

      // ── 3. Escutar evento caso ainda não tenha chegado ──────────────────
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          setSessionState("ready");
        }
        if (event === "TOKEN_REFRESHED" && session) {
          setSessionState("ready");
        }
      });
      unsubscribe = () => listener.subscription.unsubscribe();

      // Timeout de segurança: se após 10s nada aconteceu, mostrar erro
      setTimeout(() => {
        setSessionState(prev => {
          if (prev === "loading") {
            setErrorMsg("Não foi possível validar o link. Ele pode ter expirado. Solicite um novo.");
            return "error";
          }
          return prev;
        });
      }, 10000);
    };

    init();
    return () => unsubscribe?.();
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
          ) : sessionState === "error" ? (
            <>
              <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Link inválido</CardTitle>
              <CardDescription className="text-muted-foreground">
                {errorMsg}
              </CardDescription>
            </>
          ) : sessionState === "loading" ? (
            <>
              <CardTitle className="text-3xl font-bold">Criar senha</CardTitle>
              <CardDescription className="text-muted-foreground">
                Validando link de acesso...
              </CardDescription>
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
          {/* Loading */}
          {!done && sessionState === "loading" && (
            <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground text-sm">
              <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
              Aguarde um momento...
            </div>
          )}

          {/* Erro: link expirado */}
          {!done && sessionState === "error" && (
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/auth/forgot-password")}
                variant="hero"
                size="lg"
                className="w-full"
              >
                Solicitar novo link
              </Button>
              <Button
                onClick={() => navigate("/auth/login")}
                variant="ghost"
                className="w-full text-muted-foreground text-sm"
              >
                Voltar ao login
              </Button>
            </div>
          )}

          {/* Formulário */}
          {!done && sessionState === "ready" && (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
