/**
 * =========================================
 * RECALCULAR RANKINGS PARA TODOS OS USUÁRIOS
 * =========================================
 * 
 * QUANDO USAR:
 * - Quando só você aparece nos rankings
 * - Quando outros jogadores não aparecem
 * - Após limpar a tabela de rankings
 * 
 * COMO USAR:
 * 1. Abra o navegador no app YM Sports (LOGADO)
 * 2. Aperte F12 (DevTools)
 * 3. Aba "Console"
 * 4. Cole ESTE código e aperte ENTER
 * 5. Aguarde (pode demorar 10-30 segundos)
 * 6. Recarregue a página
 */

(async () => {
  console.log('🏆 RECALCULANDO RANKINGS PARA TODOS OS USUÁRIOS...');
  console.log('⏳ Isso pode demorar um pouco...');
  
  // Verificar se Supabase está disponível
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase não encontrado!');
    console.log('💡 Verifique se você está logado no app');
    return;
  }
  
  const supabase = window.supabase;
  
  try {
    const now = new Date().toISOString();
    
    // 1. LIMPAR rankings antigos
    console.log('🗑️ Limpando rankings antigos...');
    const { error: deleteError } = await supabase
      .from('rankings_cache')
      .delete()
      .neq('period', 'NEVER_MATCH');
    
    if (deleteError) {
      console.error('❌ Erro ao deletar:', deleteError);
      return;
    }
    
    console.log('✅ Rankings antigos deletados');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. BUSCAR TODOS os usuários com progresso
    console.log('🔍 Buscando usuários...');
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .order('total_points', { ascending: false });
    
    if (progressError) {
      console.error('❌ Erro ao buscar progresso:', progressError);
      return;
    }
    
    console.log(`✅ Encontrados ${progressData.length} usuários`);
    
    // 3. BUSCAR localizações
    console.log('📍 Buscando localizações...');
    const { data: locationsData, error: locationsError } = await supabase
      .from('user_locations')
      .select('*');
    
    if (locationsError) {
      console.error('❌ Erro ao buscar localizações:', locationsError);
      return;
    }
    
    console.log(`✅ Encontradas ${locationsData?.length || 0} localizações`);
    
    // 4. CALCULAR rankings
    const rankingsToInsert = [];
    
    // NACIONAL
    console.log('🌎 Calculando ranking nacional...');
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
      const regionGroups = {};
      const stateGroups = {};
      
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
      
      // REGIONAL (por região geográfica, mas salvar ESTADO na coluna region)
      console.log('🗺️ Calculando rankings regionais...');
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
      
      // LOCAL (por estado, salvar CIDADE+ESTADO na coluna region)
      console.log('📍 Calculando rankings locais...');
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
    
    console.log(`✅ Calculados ${rankingsToInsert.length} rankings`);
    
    // 5. INSERIR rankings em batches
    console.log('💾 Salvando rankings...');
    const BATCH_SIZE = 50;
    for (let i = 0; i < rankingsToInsert.length; i += BATCH_SIZE) {
      const batch = rankingsToInsert.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase
        .from('rankings_cache')
        .insert(batch);
      
      if (insertError) {
        console.error(`❌ Erro no lote ${Math.floor(i/BATCH_SIZE) + 1}:`, insertError);
      } else {
        console.log(`✅ Lote ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(rankingsToInsert.length/BATCH_SIZE)} salvo`);
      }
      
      // Pequeno delay entre batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 6. LIMPAR cache localStorage
    console.log('🧹 Limpando cache...');
    localStorage.removeItem('ym_rankings_national');
    localStorage.removeItem('ym_rankings_regional');
    localStorage.removeItem('ym_rankings_local');
    
    console.log('');
    console.log('🎉 ========================================');
    console.log('🎉 RECÁLCULO CONCLUÍDO COM SUCESSO!');
    console.log('🎉 ========================================');
    console.log('');
    console.log(`📊 Estatísticas:`);
    console.log(`   - ${progressData.length} usuários processados`);
    console.log(`   - ${rankingsToInsert.length} rankings criados`);
    console.log('');
    console.log('📋 Próximo passo:');
    console.log('   - Recarregue a página (F5)');
    console.log('   - Todos os jogadores devem aparecer agora!');
    console.log('');
    
    if (confirm('✅ Recálculo concluído! Recarregar agora?')) {
      location.reload();
    }
    
  } catch (error) {
    console.error('❌ Erro ao recalcular rankings:', error);
  }
})();
