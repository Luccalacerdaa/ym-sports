import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkSubscriptionStatus, currentSubscription, loading } = useSubscription();
  const [status, setStatus] = useState<'checking' | 'success' | 'pending' | 'error'>('checking');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Aguardar um momento para o webhook processar
    const checkTimer = setTimeout(async () => {
      const isActive = await checkSubscriptionStatus();
      
      if (isActive) {
        setStatus('success');
      } else {
        setStatus('pending');
      }
    }, 3000); // Aguardar 3 segundos

    return () => clearTimeout(checkTimer);
  }, [user, navigate, checkSubscriptionStatus]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleCheckAgain = async () => {
    setStatus('checking');
    const isActive = await checkSubscriptionStatus();
    setStatus(isActive ? 'success' : 'pending');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          {status === 'checking' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl text-white">
                Verificando pagamento...
              </CardTitle>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-white">
                Pagamento confirmado!
              </CardTitle>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl text-white">
                Aguardando confirmação
              </CardTitle>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'success' && (
            <>
              <div className="text-center text-gray-300">
                <p className="mb-2">Sua assinatura foi ativada com sucesso!</p>
                
                {currentSubscription && (
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Detalhes da assinatura:</p>
                    <p className="text-yellow-500 font-medium">
                      {currentSubscription.plan?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Válida até: {new Date(currentSubscription.expires_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <p className="mt-4 text-sm text-gray-400">
                  Agora você tem acesso completo a todas as funcionalidades do YM Sports!
                </p>
              </div>

              <Button
                onClick={handleGoToDashboard}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                size="lg"
              >
                Ir para o Dashboard
              </Button>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="text-center text-gray-300">
                <p className="mb-2">Estamos processando seu pagamento.</p>
                <p className="text-sm text-gray-400">
                  Isso pode levar alguns minutos. Você receberá um email de confirmação assim que o pagamento for aprovado.
                </p>
                
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-500">
                    💡 Dica: Se você já completou o pagamento na Hotmart, aguarde alguns minutos e tente verificar novamente.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCheckAgain}
                  variant="outline"
                  className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar novamente'
                  )}
                </Button>

                <Button
                  onClick={handleGoToDashboard}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  Ir para o Dashboard
                </Button>
              </div>
            </>
          )}

          {status === 'checking' && (
            <div className="text-center text-gray-400 text-sm">
              Aguarde enquanto verificamos o status do seu pagamento...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
