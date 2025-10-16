import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Calculator, 
  Users, 
  BarChart3,
  Target,
  Ruler,
  Weight,
  Calendar,
  Info
} from "lucide-react";

interface HeightProjection {
  currentHeight: number;
  projectedHeight: number;
  heightRange: {
    min: number;
    max: number;
  };
  growthPotential: number;
  growthStage: 'pre_puberty' | 'puberty' | 'post_puberty';
  recommendations: string[];
}

export default function HeightProjection() {
  const { profile } = useProfile();
  const [formData, setFormData] = useState({
    fatherHeight: '',
    motherHeight: '',
    currentAge: profile?.age?.toString() || '',
    currentHeight: profile?.height?.toString() || '',
    currentWeight: profile?.weight?.toString() || '',
  });
  const [projection, setProjection] = useState<HeightProjection | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = () => {
    if (!formData.fatherHeight || !formData.motherHeight || !formData.currentAge) {
      toast.error("Preencha pelo menos a altura do pai, mãe e sua idade atual");
      return;
    }

    setLoading(true);
    
    try {
      const fatherHeight = parseInt(formData.fatherHeight);
      const motherHeight = parseInt(formData.motherHeight);
      const currentAge = parseInt(formData.currentAge);
      const currentHeight = parseInt(formData.currentHeight) || 0;
      const currentWeight = parseInt(formData.currentWeight) || 0;

      // Cálculo da altura projetada usando fórmula de Tanner
      const midParentalHeight = (fatherHeight + motherHeight) / 2;
      const genderAdjustment = 6.5; // Ajuste para homens (para mulheres seria -6.5)
      const projectedHeight = midParentalHeight + genderAdjustment;

      // Determinar estágio de crescimento
      let growthStage: 'pre_puberty' | 'puberty' | 'post_puberty';
      let growthPotential = 0;
      
      if (currentAge < 12) {
        growthStage = 'pre_puberty';
        growthPotential = projectedHeight - currentHeight;
      } else if (currentAge >= 12 && currentAge <= 16) {
        growthStage = 'puberty';
        growthPotential = projectedHeight - currentHeight;
      } else {
        growthStage = 'post_puberty';
        growthPotential = Math.max(0, projectedHeight - currentHeight);
      }

      // Calcular faixa de altura (desvio padrão de ±8.5cm)
      const heightRange = {
        min: Math.max(0, projectedHeight - 8.5),
        max: projectedHeight + 8.5
      };

      // Gerar recomendações baseadas no estágio
      const recommendations = generateRecommendations(growthStage, currentAge, growthPotential, currentWeight);

      setProjection({
        currentHeight,
        projectedHeight: Math.round(projectedHeight),
        heightRange: {
          min: Math.round(heightRange.min),
          max: Math.round(heightRange.max)
        },
        growthPotential: Math.round(Math.max(0, growthPotential)),
        growthStage,
        recommendations
      });

      toast.success("Projeção calculada com sucesso!");
    } catch (error) {
      toast.error("Erro ao calcular projeção");
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (
    stage: string, 
    age: number, 
    potential: number, 
    weight: number
  ): string[] => {
    const recommendations: string[] = [];

    if (stage === 'pre_puberty') {
      recommendations.push("Foque em exercícios de alongamento e flexibilidade");
      recommendations.push("Mantenha uma alimentação rica em cálcio e proteínas");
      recommendations.push("Durma pelo menos 8-9 horas por noite");
      recommendations.push("Evite sobrecarga de peso nos treinos");
    } else if (stage === 'puberty') {
      recommendations.push("Este é o período de maior crescimento - aproveite!");
      recommendations.push("Combine treinos de força com exercícios de alongamento");
      recommendations.push("Mantenha uma dieta balanceada e rica em nutrientes");
      recommendations.push("Evite treinos excessivos que possam prejudicar o crescimento");
    } else {
      recommendations.push("O crescimento em altura já está finalizado");
      recommendations.push("Foque em ganho de massa muscular e força");
      recommendations.push("Mantenha a saúde óssea com exercícios de impacto");
      recommendations.push("Otimize a composição corporal através da dieta");
    }

    if (potential > 10) {
      recommendations.push("Você ainda tem potencial significativo de crescimento");
    } else if (potential > 5) {
      recommendations.push("Você ainda tem algum potencial de crescimento");
    } else {
      recommendations.push("O crescimento em altura está próximo do final");
    }

    return recommendations;
  };

  const getStageInfo = (stage: string) => {
    switch (stage) {
      case 'pre_puberty':
        return { label: 'Pré-Puberdade', color: 'bg-blue-100 text-blue-800', icon: '🌱' };
      case 'puberty':
        return { label: 'Puberdade', color: 'bg-green-100 text-green-800', icon: '🚀' };
      case 'post_puberty':
        return { label: 'Pós-Puberdade', color: 'bg-orange-100 text-orange-800', icon: '🏆' };
      default:
        return { label: 'Indefinido', color: 'bg-gray-100 text-gray-800', icon: '❓' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Altura e Projeção</h1>
              <p className="text-muted-foreground">Calcule sua altura projetada baseada na genética familiar</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Dados para Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Altura dos Pais
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="fatherHeight">Altura do Pai (cm)</Label>
                  <Input
                    id="fatherHeight"
                    type="number"
                    value={formData.fatherHeight}
                    onChange={(e) => setFormData({...formData, fatherHeight: e.target.value})}
                    placeholder="Ex: 175"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherHeight">Altura da Mãe (cm)</Label>
                  <Input
                    id="motherHeight"
                    type="number"
                    value={formData.motherHeight}
                    onChange={(e) => setFormData({...formData, motherHeight: e.target.value})}
                    placeholder="Ex: 165"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Seus Dados Atuais
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="currentAge">Idade Atual (anos)</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    value={formData.currentAge}
                    onChange={(e) => setFormData({...formData, currentAge: e.target.value})}
                    placeholder="Ex: 16"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentHeight">Altura Atual (cm)</Label>
                  <Input
                    id="currentHeight"
                    type="number"
                    value={formData.currentHeight}
                    onChange={(e) => setFormData({...formData, currentHeight: e.target.value})}
                    placeholder="Ex: 170"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentWeight">Peso Atual (kg)</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({...formData, currentWeight: e.target.value})}
                    placeholder="Ex: 65"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCalculate} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Projeção
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        {projection && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projeção Principal */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Projeção de Altura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Ruler className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Altura Atual</span>
                    </div>
                    <div className="text-3xl font-bold text-primary">{projection.currentHeight}cm</div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Altura Projetada</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{projection.projectedHeight}cm</div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Potencial de Crescimento</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">+{projection.growthPotential}cm</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Faixa de Altura Esperada</span>
                    <Badge className={getStageInfo(projection.growthStage).color}>
                      {getStageInfo(projection.growthStage).icon} {getStageInfo(projection.growthStage).label}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-semibold">
                      {projection.heightRange.min}cm - {projection.heightRange.max}cm
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Baseado na altura dos seus pais e sua idade atual
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recomendações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projection.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      📊 Sobre o Cálculo
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300">
                      Usamos a fórmula de Tanner, que considera a altura dos pais e ajustes para gênero. 
                      A faixa representa 95% dos casos esperados.
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                      ⚠️ Limitações
                    </h4>
                    <p className="text-green-700 dark:text-green-300">
                      Este cálculo é uma estimativa baseada em genética. Fatores como nutrição, 
                      exercícios e saúde podem influenciar o resultado final.
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                      💡 Dica
                    </h4>
                    <p className="text-orange-700 dark:text-orange-300">
                      Para resultados mais precisos, consulte um endocrinologista pediátrico, 
                      especialmente se você está preocupado com seu crescimento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
