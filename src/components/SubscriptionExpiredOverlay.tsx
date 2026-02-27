import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, RefreshCw, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionExpiredOverlayProps {
  expiredAt?: string | null;
  plan?: string | null;
}

export function SubscriptionExpiredOverlay({ expiredAt, plan }: SubscriptionExpiredOverlayProps) {
  const navigate = useNavigate();

  const planLabel: Record<string, string> = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    semestral: "Semestral",
  };

  const expiredDate = expiredAt
    ? new Date(expiredAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    // Overlay cobre TODO o conteúdo do dashboard sem possibilidade de fechar
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Ícone de cadeado */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center relative"
            animate={{
              boxShadow: [
                "0 0 20px rgba(239,68,68,0.2)",
                "0 0 50px rgba(239,68,68,0.5)",
                "0 0 20px rgba(239,68,68,0.2)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <Lock className="w-12 h-12 text-red-400" />
          </motion.div>
        </div>

        {/* Texto principal */}
        <div className="text-center mb-6 space-y-2">
          <h1 className="text-2xl font-black text-white">
            Sua assinatura expirou
          </h1>
          {plan && (
            <p className="text-gray-400 text-sm">
              Plano {planLabel[plan] ?? plan}
              {expiredDate && ` · Expirou em ${expiredDate}`}
            </p>
          )}
          <p className="text-gray-300 text-sm leading-relaxed pt-2">
            Para continuar acessando todas as funcionalidades do YM Sports, renove sua assinatura.
          </p>
        </div>

        {/* Benefícios rápidos */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 mb-6 space-y-2">
          {[
            "Treinos personalizados com IA",
            "Planos nutricionais completos",
            "Ranking nacional de jogadores",
            "Portfólio profissional de atleta",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{item}</span>
            </div>
          ))}
        </div>

        {/* Botão — único CTA, não pode fechar sem clicar */}
        <Button
          onClick={() => navigate("/plans")}
          className="w-full h-14 text-base font-black bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:shadow-[0_0_50px_rgba(234,179,8,0.8)] transition-all"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Renovar Assinatura
        </Button>

        <p className="text-center text-gray-600 text-xs mt-4">
          Pagamento 100% seguro via Hotmart
        </p>
      </motion.div>
    </div>
  );
}
