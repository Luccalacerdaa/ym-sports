/**
 * Corrige problemas de viewport em dispositivos móveis quando o teclado virtual é aberto
 * Isso ajuda a manter a barra de navegação fixa na parte inferior da tela
 */
export function setupMobileViewportFix() {
  // Detectar dispositivos móveis
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return;

  // Função para atualizar a altura do viewport
  const updateAppHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    
    // Forçar reflow para garantir que a barra inferior seja reposicionada
    const bottomBar = document.querySelector('.fixed-bottom-bar');
    if (bottomBar) {
      bottomBar.classList.remove('fixed-bottom-bar');
      void bottomBar.offsetWidth; // Forçar reflow
      bottomBar.classList.add('fixed-bottom-bar');
    }
  };

  // Atualizar altura quando a janela for redimensionada (quando o teclado aparece/desaparece)
  window.addEventListener('resize', updateAppHeight);
  
  // Atualizar altura quando a orientação mudar
  window.addEventListener('orientationchange', updateAppHeight);
  
  // Atualizar altura quando a página carregar
  window.addEventListener('load', updateAppHeight);
  
  // Executar imediatamente
  updateAppHeight();

  // Adicionar eventos para lidar com foco em inputs
  document.addEventListener('focusin', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      // Em iOS, adicionar padding para evitar que o input fique escondido pelo teclado
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        document.body.classList.add('keyboard-open');
        
        // Scroll para o elemento com foco
        setTimeout(() => {
          (e.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  });

  document.addEventListener('focusout', () => {
    document.body.classList.remove('keyboard-open');
    
    // Forçar scroll para o topo após o teclado fechar
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  });
}
