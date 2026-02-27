import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import logoImage from "@/assets/ym-sports-logo-white-bg.png";

type Status = "checking" | "success" | "pending";

// Verifica diretamente no Supabase se a assinatura foi ativada
async function checkActiveSubscription(userId: string): Promise<boolean> {
  // 1. Verificar profiles.subscription_status (atualizado pelo webhook)
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (
    profile?.subscription_status === "active" &&
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date()
  ) {
    return true;
  }

  // 2. Fallback: verificar user_subscriptions
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  return !!sub;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>("checking");
  const [attempts, setAttempts] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Polling com intervalo crescente: 3s, 5s, 8s, 12s, 20s, 30s
  const intervals = [3000, 5000, 8000, 12000, 20000, 30000];
  const MAX_ATTEMPTS = 6;

  const scheduleNextCheck = (attempt: number, userId: string) => {
    if (attempt >= MAX_ATTEMPTS) {
      setStatus("pending");
      return;
    }
    const delay = intervals[attempt] ?? 30000;
    setSecondsLeft(Math.round(delay / 1000));

    const countdown = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(countdown); return 0; }
        return s - 1;
      });
    }, 1000);

    pollRef.current = setTimeout(async () => {
      clearInterval(countdown);
      const isActive = await checkActiveSubscription(userId);
      if (isActive) {
        setStatus("success");
      } else {
        setAttempts(attempt + 1);
        scheduleNextCheck(attempt + 1, userId);
      }
    }, delay);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth/login");
      return;
    }

    // Primeira verificação após 3 segundos
    scheduleNextCheck(0, user.id);

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [user, authLoading]);

  const handleManualCheck = async () => {
    if (!user) return;
    if (pollRef.current) clearTimeout(pollRef.current);
    setStatus("checking");
    setAttempts(0);
    setSecondsLeft(0);
    const isActive = await checkActiveSubscription(user.id);
    if (isActive) {
      setStatus("success");
    } else {
      setStatus("pending");
    }
  };

  const handleGoToDashboard = () => navigate("/dashboard");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <img src={logoImage} alt="YM Sports" className="h-12 object-contain mb-8" />

      <div className="w-full max-w-sm">

        {/* CHECKING */}
        {status === "checking" && (
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-28 h-28">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-yellow-500/40 animate-ping [animation-delay:0.3s]" />
              <div className="relative w-full h-full rounded-full bg-yellow-500/10 flex items-center justify-center border-2 border-yellow-500/60">
                <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Confirmando pagamento...
              </h1>
              <p className="text-gray-400 text-sm">
                Aguarde enquanto verificamos com a Hotmart.
                {secondsLeft > 0 && (
                  <span className="block mt-1 text-yellow-500/70">
                    Próxima verificação em {secondsLeft}s
                    {attempts > 0 && ` (tentativa ${attempts + 1}/${MAX_ATTEMPTS})`}
                  </span>
                )}
              </p>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 text-left space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">O que acontece agora</p>
              {[
                "Hotmart processa o pagamento",
                "Notificação enviada ao sistema",
                "Sua conta é ativada automaticamente",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-500 text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="text-gray-300 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <div className="relative w-full h-full rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500/60">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Acesso ativado!
              </h1>
              <p className="text-gray-400 text-sm">
                Sua assinatura está ativa. Bem-vindo ao YM Sports!
              </p>
            </div>

            <Button
              onClick={handleGoToDashboard}
              className="w-full h-14 text-base font-black bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.4)]"
            >
              Entrar no App
            </Button>
          </div>
        )}

        {/* PENDING — webhook ainda não processou */}
        {status === "pending" && (
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-28 h-28">
              <div className="relative w-full h-full rounded-full bg-yellow-500/10 flex items-center justify-center border-2 border-yellow-500/40">
                <AlertCircle className="h-12 w-12 text-yellow-500" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Pagamento em processamento
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Seu pagamento foi recebido e está sendo processado. A ativação pode levar alguns minutos.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
              <p className="text-sm text-yellow-400 font-medium mb-1">
                O que fazer agora?
              </p>
              <p className="text-xs text-gray-400">
                Se o pagamento foi aprovado na Hotmart, aguarde 1-2 minutos e clique em "Verificar novamente". Caso o problema persista, entre em contato com o suporte.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleManualCheck}
                className="w-full h-12 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 rounded-2xl"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Verificar novamente
              </Button>

              <Button
                onClick={handleGoToDashboard}
                variant="ghost"
                className="w-full text-gray-500 hover:text-white text-sm"
              >
                Ir para o app mesmo assim
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
