/**
 * /checkout — Gateway de compra via afiliados
 *
 * O afiliado divulga:
 *   https://ym-sports.vercel.app/checkout?plan=mensal&ref=U104670015N
 *
 * Fluxo:
 *  1. Usuário já logado  → redireciona imediatamente para Hotmart com sck=UUID
 *  2. Usuário não logado → mostra cadastro/login rápido → após auth → Hotmart com sck=UUID
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Star, Zap } from "lucide-react";
import logoImage from "@/assets/ym-sports-logo-white-bg.png";

// Produto único na Hotmart — os 3 planos são ofertas dentro do mesmo produto
const HOTMART_CHECKOUT_CODE = "W104403854A";

const PLAN_FALLBACK: Record<string, { checkout_code: string; offer_code: string; label: string; price: string }> = {
  mensal:     { checkout_code: HOTMART_CHECKOUT_CODE, offer_code: "olbidtw7", label: "Mensal",     price: "R$ 39,90/mês" },
  trimestral: { checkout_code: HOTMART_CHECKOUT_CODE, offer_code: "fpxzoplr", label: "Trimestral", price: "R$ 99,90/trimestre" },
  semestral:  { checkout_code: HOTMART_CHECKOUT_CODE, offer_code: "nh5b7zqg", label: "Semestral",  price: "R$ 189,90/semestre" },
};

type Mode = "signup" | "login";

function buildHotmartUrl(checkoutCode: string, offerCode: string, userId: string, affiliateRef?: string): string {
  const base = `https://pay.hotmart.com/${checkoutCode}`;
  const params = new URLSearchParams();
  if (offerCode) params.set("off", offerCode);
  params.set("sck", userId);
  if (affiliateRef) params.set("ap", affiliateRef);
  return `${base}?${params.toString()}`;
}

export default function CheckoutGateway() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn } = useAuth();

  const planKey = (searchParams.get("plan") || "mensal").toLowerCase();
  const affiliateRef = searchParams.get("ref") || undefined;

  const planInfo = PLAN_FALLBACK[planKey] ?? PLAN_FALLBACK["mensal"];

  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Salvar código do afiliado no localStorage para reutilizar em outros pontos
  useEffect(() => {
    if (affiliateRef) localStorage.setItem("affiliate_code", affiliateRef);
  }, [affiliateRef]);

  // Se já está logado, redireciona direto para Hotmart
  useEffect(() => {
    if (!authLoading && user) {
      goToHotmart(user.id);
    }
  }, [user, authLoading]);

  const goToHotmart = (userId: string) => {
    setRedirecting(true);
    const url = buildHotmartUrl(planInfo.checkout_code, planInfo.offer_code, userId, affiliateRef);
    window.location.href = url;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          toast.error("Esse email já tem conta. Faça login abaixo.");
          setMode("login");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        // Criar profile básico
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name,
          email,
        });
        goToHotmart(data.user.id);
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        toast.error("Email ou senha incorretos.");
        return;
      }
      if (data?.user) {
        goToHotmart(data.user.id);
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Tela de redirecionamento (usuário já logado ou recém autenticado)
  if (authLoading || redirecting) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <img src={logoImage} alt="YM Sports" className="h-10 object-contain" />
        <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />
        <p className="text-gray-400 text-sm">Preparando seu checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex flex-col items-center justify-center p-4">
      <img src={logoImage} alt="YM Sports" className="h-10 object-contain mb-6" />

      <div className="w-full max-w-sm space-y-5">

        {/* Cabeçalho do plano escolhido */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-center">
          <p className="text-xs text-yellow-500/70 uppercase tracking-widest mb-1">Plano selecionado</p>
          <p className="text-xl font-black text-white">{planInfo.label}</p>
          <p className="text-yellow-400 font-semibold">{planInfo.price}</p>
        </div>

        {/* Card de autenticação */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-5">

          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-800/60 p-1">
            {(["signup", "login"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === m
                    ? "bg-yellow-500 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {m === "signup" ? "Criar conta" : "Já tenho conta"}
              </button>
            ))}
          </div>

          {mode === "signup" ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">Nome</Label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-11"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">Email</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-11"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">Senha</Label>
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-base rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar conta e ir ao pagamento →"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">Email</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-11"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">Senha</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-11"
                />
              </div>
              <button
                type="button"
                onClick={() => navigate("/auth/forgot-password")}
                className="text-xs text-gray-500 hover:text-yellow-500 transition-colors"
              >
                Esqueci minha senha
              </button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-base rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Entrar e ir ao pagamento →"}
              </Button>
            </form>
          )}
        </div>

        {/* Selos de confiança */}
        <div className="flex justify-center gap-6 text-xs text-gray-600">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Pagamento seguro</span>
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-600" /> Hotmart</span>
          <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-blue-500" /> Acesso imediato</span>
        </div>

      </div>
    </div>
  );
}
