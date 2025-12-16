import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, AlertCircle } from "lucide-react";

// Componente ULTRA SEGURO - versão temporária para debug
export default function NutritionSafe() {
  const [error, setError] = useState<string | null>(null);
  
  try {
    console.log('🛡️ [NUTRITION-SAFE] Componente seguro carregado');
    
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Nutrição (Modo Seguro)</h1>
        </div>

        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              Página em Modo de Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Esta é uma versão simplificada e segura da página de Nutrição para identificar o erro.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                <p className="text-green-400 font-semibold">✅ Componente carregou com sucesso!</p>
                <p className="text-sm text-gray-400 mt-2">
                  Se você está vendo esta mensagem, o problema está na versão completa do componente.
                </p>
              </div>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
                <p className="text-blue-400 font-semibold mb-2">🔍 Próximos passos:</p>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Verificar console do navegador</li>
                  <li>Limpar cache e recarregar (Ctrl+Shift+R)</li>
                  <li>Enviar prints dos logs para o desenvolvedor</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mt-4 bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <p className="text-red-400 font-semibold">❌ Erro capturado:</p>
              <pre className="text-xs text-gray-400 mt-2 overflow-auto">{error}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (err: any) {
    console.error('❌ [NUTRITION-SAFE] Erro no componente seguro:', err);
    setError(err.message || 'Erro desconhecido');
    
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-red-400 mb-4">Erro Capturado</h2>
            <pre className="text-sm text-gray-300 overflow-auto">{err?.message || 'Erro desconhecido'}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }
}

