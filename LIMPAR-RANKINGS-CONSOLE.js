/**
 * ========================================
 * SCRIPT PARA LIMPAR RANKINGS DUPLICADOS
 * ========================================
 * 
 * COMO USAR:
 * 1. Abra o navegador no seu app YM Sports
 * 2. Aperte F12 para abrir o DevTools
 * 3. Vá na aba "Console"
 * 4. Cole TODO este código e aperte ENTER
 * 5. Aguarde a mensagem de sucesso
 * 6. Recarregue a página (F5)
 */

(async () => {
  console.log('🧹 Iniciando limpeza de rankings...');
  
  // Verificar se o Supabase está disponível
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase não encontrado!');
    console.log('💡 Verifique se você está logado no app');
    return;
  }
  
  const supabase = window.supabase;
  
  try {
    // 1. Deletar TODOS os rankings
    console.log('🗑️ Deletando todos os rankings...');
    const { error: deleteError } = await supabase
      .from('rankings_cache')
      .delete()
      .neq('period', 'NEVER_MATCH'); // Workaround para deletar tudo
    
    if (deleteError) {
      console.error('❌ Erro ao deletar rankings:', deleteError);
      return;
    }
    
    console.log('✅ Rankings deletados com sucesso!');
    
    // 2. Aguardar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Verificar se está vazio
    const { data: checkData, error: checkError } = await supabase
      .from('rankings_cache')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Erro ao verificar:', checkError);
      return;
    }
    
    if (checkData && checkData.length > 0) {
      console.warn('⚠️ Ainda há rankings na tabela. Tentando novamente...');
      // Tentar novamente
      location.reload();
      return;
    }
    
    console.log('✅ Tabela de rankings está limpa!');
    console.log('');
    console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('📋 Próximos passos:');
    console.log('   1. Recarregue a página (F5)');
    console.log('   2. Os rankings serão recalculados automaticamente');
    console.log('   3. Não haverá mais duplicatas!');
    console.log('');
    
    // Perguntar se quer recarregar agora
    if (confirm('✅ Limpeza concluída! Deseja recarregar a página agora?')) {
      location.reload();
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar rankings:', error);
  }
})();
