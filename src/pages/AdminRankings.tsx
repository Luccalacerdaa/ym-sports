import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRanking } from '@/hooks/useRanking';
import { Loader2, RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminRankings() {
  const { calculateRankings } = useRanking();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClearRankings = async () => {
    if (!confirm('⚠️ Isso vai DELETAR TODOS os rankings. Tem certeza?')) {
      return;
    }

    setIsClearing(true);
    setError(null);

    try {
      // Deletar TODOS os rankings
      const { error: deleteError } = await supabase
        .from('rankings')
        .delete()
        .neq('period', 'NEVER_MATCH');

      if (deleteError) throw deleteError;

      // Limpar localStorage
      localStorage.removeItem('ym_rankings_national');
      localStorage.removeItem('ym_rankings_regional');
      localStorage.removeItem('ym_rankings_local');

      alert('✅ Rankings limpos com sucesso!');
    } catch (err: any) {
      setError(err.message);
      alert('❌ Erro ao limpar rankings: ' + err.message);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRecalculateAll = async () => {
    if (!confirm('🔄 Isso vai recalcular rankings para TODOS os usuários. Continuar?')) {
      return;
    }

    setIsRecalculating(true);
    setError(null);
    setStats(null);

    try {
      const now = new Date().toISOString();

      // 1. Limpar rankings antigos
      console.log('🗑️ Limpando rankings antigos...');
      const { error: deleteError } = await supabase
        .from('rankings')
        .delete()
        .neq('period', 'NEVER_MATCH');

      if (deleteError) throw deleteError;

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Buscar TODOS os usuários com progresso
      console.log('🔍 Buscando usuários...');
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .order('total_points', { ascending: false });

      if (progressError) throw progressError;

      console.log(`✅ Encontrados ${progressData.length} usuários`);

      // 3. Buscar localizações
      const { data: locationsData, error: locationsError } = await supabase
        .from('user_locations')
        .select('*');

      if (locationsError) throw locationsError;

      console.log(`✅ Encontradas ${locationsData?.length || 0} localizações`);

      // 4. Calcular rankings
      const rankingsToInsert = [];

      // NACIONAL
      progressData.forEach((progress, index) => {
        rankingsToInsert.push({
          user_id: progress.user_id,
          ranking_type: 'national',
          position: index + 1,
          total_points: progress.total_points,
          period: 'all_time',
          calculated_at: now,
          region: null
        });
      });

      // REGIONAL e LOCAL
      if (locationsData && locationsData.length > 0) {
        const regionGroups: { [key: string]: any[] } = {};
        const stateGroups: { [key: string]: any[] } = {};

        // Agrupar usuários
        for (const progress of progressData) {
          const location = locationsData.find(loc => loc.user_id === progress.user_id);
          if (location) {
            // Por região geográfica
            if (!regionGroups[location.region]) {
              regionGroups[location.region] = [];
            }
            regionGroups[location.region].push({
              ...progress,
              state: location.state,
              city: location.city_approximate
            });

            // Por estado
            if (!stateGroups[location.state]) {
              stateGroups[location.state] = [];
            }
            stateGroups[location.state].push({
              ...progress,
              state: location.state,
              city: location.city_approximate
            });
          }
        }

        // REGIONAL (salvar ESTADO na coluna region)
        for (const region in regionGroups) {
          const users = regionGroups[region].sort((a, b) => b.total_points - a.total_points);
          users.forEach((user, index) => {
            rankingsToInsert.push({
              user_id: user.user_id,
              ranking_type: 'regional',
              position: index + 1,
              total_points: user.total_points,
              period: 'all_time',
              calculated_at: now,
              region: user.state // ESTADO, não região geográfica
            });
          });
        }

        // LOCAL (salvar CIDADE+ESTADO)
        for (const state in stateGroups) {
          const users = stateGroups[state].sort((a, b) => b.total_points - a.total_points);
          users.forEach((user, index) => {
            rankingsToInsert.push({
              user_id: user.user_id,
              ranking_type: 'local',
              position: index + 1,
              total_points: user.total_points,
              period: 'all_time',
              calculated_at: now,
              region: user.city && user.state ? `${user.city}, ${user.state}` : user.state
            });
          });
        }
      }

      // 5. Inserir em batches
      const BATCH_SIZE = 50;
      for (let i = 0; i < rankingsToInsert.length; i += BATCH_SIZE) {
        const batch = rankingsToInsert.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase
          .from('rankings')
          .insert(batch);

        if (insertError) {
          console.error(`❌ Erro no lote ${Math.floor(i/BATCH_SIZE) + 1}:`, insertError);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 6. Limpar cache
      localStorage.removeItem('ym_rankings_national');
      localStorage.removeItem('ym_rankings_regional');
      localStorage.removeItem('ym_rankings_local');

      // Estatísticas
      setStats({
        usuarios: progressData.length,
        localizacoes: locationsData?.length || 0,
        rankings: rankingsToInsert.length
      });

      alert('✅ Recálculo concluído com sucesso!\n\nRecarregue a página para ver os resultados.');

    } catch (err: any) {
      setError(err.message);
      alert('❌ Erro ao recalcular: ' + err.message);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              🛠️ Admin - Gerenciar Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Aviso */}
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-500">Área Administrativa</p>
                  <p className="text-sm text-yellow-400 mt-1">
                    Use essas ferramentas com cuidado. Elas afetam TODOS os usuários.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleClearRankings}
                disabled={isClearing}
                variant="destructive"
                className="h-auto py-6 flex flex-col gap-2"
              >
                {isClearing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Trash2 className="h-6 w-6" />
                )}
                <span className="text-lg">Limpar Rankings</span>
                <span className="text-xs opacity-70">Deletar todos os rankings</span>
              </Button>

              <Button
                onClick={handleRecalculateAll}
                disabled={isRecalculating}
                className="h-auto py-6 flex flex-col gap-2 bg-green-600 hover:bg-green-700"
              >
                {isRecalculating ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <RefreshCw className="h-6 w-6" />
                )}
                <span className="text-lg">Recalcular Tudo</span>
                <span className="text-xs opacity-70">Para todos os usuários</span>
              </Button>
            </div>

            {/* Estatísticas */}
            {stats && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-500">Recálculo Concluído!</p>
                    <div className="mt-2 space-y-1 text-sm text-green-400">
                      <p>✅ {stats.usuarios} usuários processados</p>
                      <p>✅ {stats.localizacoes} localizações encontradas</p>
                      <p>✅ {stats.rankings} rankings criados</p>
                    </div>
                    <Button
                      onClick={() => window.location.reload()}
                      className="mt-3"
                      size="sm"
                    >
                      Recarregar Página
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-500">Erro</p>
                    <p className="text-sm text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold">Como usar:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Clique em "Recalcular Tudo"</li>
                <li>Aguarde o processo (10-30 segundos)</li>
                <li>Clique em "Recarregar Página"</li>
                <li>Todos os jogadores devem aparecer!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
