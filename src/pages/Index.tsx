import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Trophy, TrendingUp, Zap, Check, Megaphone, Heart, Volume2, VolumeX, Smartphone } from "lucide-react";
import logoImage from "@/assets/logo_hero_300x300.png";
import appMockupImage from "@/assets/app-mockup.png";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ScrollingBanner } from "@/components/ScrollingBanner";
import soccerFieldImage from "@/assets/soccer-field.jpg";
import stadiumBwImage from "@/assets/stadium-bw.jpg";
import soccerTrainingFieldImage from "@/assets/soccer-training-field.jpg";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef } from "react";
const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "biannual">("monthly");
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const benefitsSection = useScrollAnimation();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Configurar volume do vídeo e forçar play
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      
      // Forçar play do vídeo com verificação se ainda está no DOM
      const playVideo = async () => {
        try {
          // Verificar se o elemento ainda está no DOM e está pronto antes de tentar reproduzir
          if (videoRef.current && 
              document.contains(videoRef.current) && 
              videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA ou maior
            await videoRef.current.play();
          }
        } catch (error) {
          // Só logar se não for um erro conhecido de reprodução de vídeo
          if (error instanceof DOMException) {
            // Ignorar erros comuns de reprodução de vídeo
            if (!['AbortError', 'NotAllowedError', 'NotSupportedError'].includes(error.name)) {
              console.warn('Erro ao reproduzir vídeo:', error.name);
            }
          } else {
            console.warn('Erro inesperado ao reproduzir vídeo:', error);
          }
        }
      };
      
      playVideo();
    }
  }, [volume, isMuted]);

  // Ativar som após primeira interação do usuário
  useEffect(() => {
    const enableSound = () => {
      if (videoRef.current && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
        videoRef.current.play().catch(() => {});
      }
    };

    // Ativar som no primeiro clique ou toque
    document.addEventListener('click', enableSound, { once: true });
    document.addEventListener('touchstart', enableSound, { once: true });

    return () => {
      document.removeEventListener('click', enableSound);
      document.removeEventListener('touchstart', enableSound);
    };
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  const carouselSection = useScrollAnimation();
  const appScreensSection = useScrollAnimation();
  const pricingSection = useScrollAnimation();
  const ctaSection = useScrollAnimation();
  const planPrices = {
    monthly: {
      value: 15.90,
      total: 15.90,
      label: "Mensal"
    },
    quarterly: {
      value: 14.63,
      total: 43.90,
      label: "Trimestral",
      discount: "8% OFF"
    },
    biannual: {
      value: 12.90,
      total: 77.40,
      label: "Semestral",
      discount: "19% OFF"
    }
  };
  const benefits = [{
    icon: Megaphone,
    title: "divulgação",
    description: "Com o APP, você ganha oportunidade para fazer seus materiais de divulgação Pré-jogo com descontos exclusivos."
  }, {
    icon: TrendingUp,
    title: "treinos",
    description: "inteligência artificial que produz treinamentos específicos e personalizados pensando na sua melhor versão."
  }, {
    icon: Heart,
    title: "motivação",
    description: "Aba específica dentro do APP que impulsiona o seu dia com mensagens de motivação e incentivo de atletas bem sucedidos."
  }, {
    icon: Zap,
    title: "portfólio online",
    description: "plataforma que permite você divulgar sua ficha técnica com empresários, deixando sua apresentação profissional."
  }];
  return <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Video Background - Same for mobile and desktop */}
        <video 
          ref={videoRef} 
          autoPlay 
          loop 
          muted={isMuted}
          playsInline 
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
        
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

        <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in flex flex-col justify-start min-h-screen pt-8 md:pt-12">
          {/* Logo */}
          <div className="flex justify-center mb-2 animate-zoom-in">
            <img src={logoImage} alt="YM SPORTS Logo" className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] object-contain" />
          </div>
          
          {/* Texto acima do título */}
          <p className="text-foreground text-[clamp(0.45rem,1vw,0.6rem)] uppercase tracking-[0.15em] mb-2 animate-fade-down" style={{
          animationDelay: "0.1s"
        }}>
            INTELIGÊNCIA ARTIFICIAL • VISIBILIDADE NACIONAL • EVOLUÇÃO REAL
          </p>
          
          <h1 className="text-[clamp(2.8rem,8vw,5.5rem)] font-astro font-bold mb-1 text-foreground tracking-wide animate-fade-down" style={{
          animationDelay: "0.2s"
        }}>
            YM SPORTS
          </h1>
          
          <p className="text-primary font-bold uppercase tracking-wide mb-20 md:mb-24 text-[clamp(0.65rem,1.8vw,0.85rem)] animate-fade-up" style={{
          animationDelay: "0.4s"
        }}>
            A EVOLUÇÃO DO ESPORTE COMEÇA AQUI.
          </p>
          
          <p className="text-foreground font-semibold text-[clamp(1.1rem,3vw,1.5rem)] mb-2 animate-fade-up" style={{
          animationDelay: "0.6s"
        }}>
            PLATAFORMA QUE ENTENDE VOCÊ,
          </p>
          <p className="text-primary font-bold uppercase text-[clamp(1.1rem,3vw,1.5rem)] mb-16 md:mb-20 animate-fade-up" style={{
          animationDelay: "0.8s"
        }}>
            FOCADO EM EVOLUÇÃO.
          </p>
          
          <div className="flex flex-col gap-4 max-w-xl mx-auto animate-fade-up" style={{
          animationDelay: "1s"
        }}>
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => navigate("/auth/signup")} 
              className="w-full hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(252,211,77,0.6)] hover:shadow-[0_0_50px_rgba(252,211,77,0.8)] font-bold text-lg"
            >
              Começar agora
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate("/auth/login")} className="w-full hover:scale-105 transition-transform duration-300">
              Entrar
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              onClick={() => navigate("/install-guide")} 
              className="w-full hover:scale-105 transition-transform duration-300 border-primary/50 text-primary hover:bg-primary/10"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Como Instalar
            </Button>
          </div>
        </div>
      </section>

      {/* Scrolling Banner */}
      <ScrollingBanner text="YM SPORTS - A EVOLUÇÃO DO ESPORTE COMEÇA AQUI" />

      {/* Benefits Section */}
      <section ref={benefitsSection.ref} className="relative py-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{
        backgroundImage: `url(${soccerTrainingFieldImage})`
      }} />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
        
        <div className="relative z-10 container mx-auto px-4">
          <h2 className={`text-center font-bebas uppercase leading-[0.9] mb-8 transition-all duration-1000 ${benefitsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="text-white text-[clamp(2rem,4.5vw,3.8rem)]">
              POR QUE ESCOLHER
            </div>
            
            <div className="text-primary font-bold tracking-wide text-[clamp(3.8rem,9vw,7.5rem)]">
              A YM SPORTS?
            </div>
          </h2>
          
          {/* Hero Text Over Image */}
          <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${benefitsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <p className="text-primary font-bold uppercase tracking-wide mb-6 text-[clamp(1.1rem,2.8vw,1.8rem)]">
              PORQUE AQUI O SEU TALENTO VIRA OPORTUNIDADE!
            </p>
            
            <p className="text-foreground text-[clamp(0.9rem,2.2vw,1.1rem)] leading-relaxed mb-4">
              Nosso App conecta atletas, pais e treinadores em um só lugar — focado em evolução e desempenho de cada atleta.
            </p>
            
            <p className="text-foreground text-[clamp(0.9rem,2.2vw,1.1rem)] mb-6">
              Desde o primeiro treino até as grandes conquistas.
            </p>
            
            <p className="text-primary font-bold uppercase tracking-wide text-[clamp(1rem,2.8vw,1.6rem)]">
              UM IMPULSO PRO SEU FUTURO!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => <div key={index} className={`relative overflow-hidden rounded-2xl p-8 group ${benefitsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{
            transitionDelay: benefitsSection.isVisible ? `${index * 0.15}s` : '0s'
          }}>
                {/* Animated Background - INVERTIDO: amarelado por padrão, escurece no hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-yellow-800/20 to-yellow-700/10 group-hover:from-card group-hover:via-card group-hover:to-muted transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent group-hover:opacity-0 transition-opacity duration-500" />
                <div className="absolute inset-0 border-2 border-primary/30 group-hover:border-primary/0 rounded-2xl transition-all duration-500" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-primary/30 to-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <benefit.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-astro font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {benefit.description}
                  </p>
                </div>
                
                {/* Glow Effect - invertido */}
                <div className="absolute -inset-1 bg-primary/10 blur-xl opacity-100 group-hover:opacity-0 transition-opacity duration-500 -z-10" />
              </div>)}
          </div>
        </div>
      </section>
      
      {/* Scrolling Banner */}
      <ScrollingBanner text="CONQUISTE SEUS OBJETIVOS - EVOLUA SEU JOGO" />

      {/* Features Gallery Section */}
      <section ref={carouselSection.ref} className="py-20 bg-gradient-to-b from-black/50 to-black overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl md:text-5xl font-astro font-bold text-center mb-4 text-foreground transition-all duration-1000 ${carouselSection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            Conheça as Funcionalidades
          </h2>
          <p className={`text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${carouselSection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            Tecnologia de ponta para elevar seu desempenho esportivo
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 - Calendário Inteligente */}
            <div className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer">
              <img src="/landing-page/Calendario.JPEG" alt="Calendário inteligente para organizar jogos" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="bg-blue-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-astro font-bold mb-2 text-foreground">
                  Calendário Inteligente
                </h3>
                <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Organize seus jogos e treinos em um só lugar. Nunca mais perca uma partida importante.
                </p>
              </div>
            </div>

            {/* Feature 2 - Inteligência Artificial */}
            <div className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer">
              <img src="/landing-page/Foto-IA.JPEG" alt="Treinos personalizados com Inteligência Artificial" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Content that slides up on hover */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="bg-primary/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-astro font-bold mb-2 text-foreground">
                  Inteligência Artificial
                </h3>
                <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Planos personalizados que analisam seu desempenho e criam treinos sob medida para você evoluir.
                </p>
              </div>
            </div>

            {/* Feature 3 - Ranking Regional */}
            <div className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer">
              <img src="/landing-page/Ranking-regional.JPEG" alt="Ranking regional e competições" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="bg-yellow-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-astro font-bold mb-2 text-foreground">
                  Ranking Regional
                </h3>
                <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Compare seu desempenho com atletas próximos e evolua através da competição saudável.
                </p>
              </div>
            </div>

            {/* Feature 4 - Portfólio Online */}
            <div className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer">
              <img src="/landing-page/Portifolio.JPEG" alt="Portfólio online profissional" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="bg-purple-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-astro font-bold mb-2 text-foreground">
                  Portfólio Online
                </h3>
                <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Plataforma que permite você divulgar sua ficha técnica com empresários de forma profissional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Banner */}
      <ScrollingBanner text="TECNOLOGIA E INOVAÇÃO NO ESPORTE" />

      {/* App Screenshots Carousel */}
      <section ref={appScreensSection.ref} className="py-20 bg-gradient-to-b from-black to-black/50">
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl md:text-5xl font-astro font-bold text-center mb-4 text-foreground transition-all duration-1000 ${appScreensSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            Veja o App em Ação
          </h2>
          <p className={`text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${appScreensSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            Imagens reais de dentro do nosso APP que você vai ter acesso a todas as funções!
          </p>

          <Carousel opts={{
          align: "start",
          loop: true
        }} plugins={[Autoplay({
          delay: 3000
        })]} className={`w-full max-w-6xl mx-auto transition-all duration-1000 delay-400 ${appScreensSection.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {[1, 2, 3, 4, 5, 6].map(num => <CarouselItem key={num} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="border-border overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-[var(--shadow-glow)]">
                    <div className="aspect-[9/16] bg-gradient-to-br from-primary/20 via-card to-secondary/20 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="text-6xl font-astro font-bold text-primary/30 group-hover:scale-110 transition-transform duration-300">
                        {num}
                      </div>
                      <p className="absolute bottom-4 left-4 right-4 text-foreground font-semibold text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Screenshot {num}
                      </p>
                    </div>
                  </Card>
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </section>

      {/* App Mockup Section with Black Background */}
      <section className="relative py-32 overflow-hidden bg-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Image Container with Animation */}
            <div className="relative animate-float">
              <img 
                src={appMockupImage} 
                alt="YM SPORTS App Mockup" 
                className="w-full h-auto transform transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Banner */}
      <ScrollingBanner text="JUNTE-SE À REVOLUÇÃO DO ESPORTE DIGITAL" />

      {/* Pricing Section */}
      <section ref={pricingSection.ref} className="py-28 md:py-36 bg-black">
        <div className="container mx-auto px-4">
          <h2 className={`text-center font-bebas uppercase leading-[0.9] transition-all duration-1000 mb-4 ${pricingSection.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="text-white text-[clamp(2.5rem,6vw,5rem)] mb-1">
              CADA GRANDE JOGADOR
            </div>
            
            <div className="text-primary text-[clamp(2.2rem,5vw,4.5rem)] mb-2">
              COMEÇOU COM UM PRIMEIRO PASSO
            </div>
            
            <div className="text-primary font-bold tracking-wide text-[clamp(3.5rem,9vw,7rem)]">
              DÊ O SEU AGORA!
            </div>
          </h2>
          <p className={`text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${pricingSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Porque todo sonho merece uma chance real.
          </p>

          <div className="max-w-2xl mx-auto">
            {/* Toggle Group */}
            <div className={`flex justify-center mb-8 transition-all duration-1000 delay-400 ${pricingSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <ToggleGroup type="single" value={selectedPlan} onValueChange={value => value && setSelectedPlan(value as typeof selectedPlan)} className="bg-card rounded-xl p-2 gap-2">
                <ToggleGroupItem value="monthly" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground px-6 py-3 rounded-lg transition-all hover:bg-primary/20">
                  Mensal
                </ToggleGroupItem>
                <ToggleGroupItem value="quarterly" className="data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground px-6 py-3 rounded-lg transition-all relative hover:bg-green-500/20">
                  Trimestral
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    10%
                  </span>
                </ToggleGroupItem>
                <ToggleGroupItem value="biannual" className="data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground px-6 py-3 rounded-lg transition-all relative hover:bg-green-500/20">
                  Semestral
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    15%
                  </span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Pricing Card */}
            <Card className={`border-border p-8 md:p-10 text-center relative overflow-hidden shadow-xl transition-all duration-1000 delay-600 ${pricingSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              {/* Background Image with Opacity */}
              <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{
              backgroundImage: `url(${stadiumBwImage})`
            }} />
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50" />
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="text-5xl md:text-6xl font-bold text-foreground mb-2 animate-scale-in">
                    R$ {planPrices[selectedPlan].value.toFixed(2).replace(".", ",")}
                    <span className="text-2xl text-muted-foreground">/mês</span>
                  </div>
                  {selectedPlan !== "monthly" && <div className="text-muted-foreground">
                      Total: R$ {planPrices[selectedPlan].total.toFixed(2).replace(".", ",")} por{" "}
                      {selectedPlan === "quarterly" ? "3 meses" : "6 meses"}
                    </div>}
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center justify-center gap-2 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Calendário inteligente de jogos
                  </li>
                  <li className="flex items-center justify-center gap-2 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Treinos personalizados com IA
                  </li>
                  <li className="flex items-center justify-center gap-2 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Ranking regional atualizado
                  </li>
                  <li className="flex items-center justify-center gap-2 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Portfólio de divulgação pessoal
                  </li>
                  <li className="flex items-center justify-center gap-2 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Benefícios e oportunidades de divulgação de atletas
                  </li>
                </ul>

                <Button variant="hero" size="xl" onClick={() => navigate("/auth/signup")} className="w-full md:w-auto">
                  Assinar {planPrices[selectedPlan].label}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Scrolling Banner */}
      <ScrollingBanner text="COMECE SUA JORNADA HOJE" />

      {/* Inspirational Quote Section */}
      <section className="py-16 bg-gradient-to-b from-black to-black/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-5xl font-astro font-bold text-center text-primary animate-fade-in">
            A diferença entre tentar e conquistar começa aqui
          </h3>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaSection.ref} className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className={`font-bebas uppercase leading-[0.95] mb-6 text-foreground transition-all duration-1000 ${ctaSection.isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-12'}`}>
            <div className="font-medelyn text-primary text-[clamp(2.5rem,7vw,4rem)] mb-3">E aí,</div>
            <div className="text-white text-[clamp(3.5rem,9vw,6.5rem)]">PRONTO PARA</div>
            <div className="text-primary font-bold text-[clamp(3.8rem,10vw,7rem)]">EVOLUIR?</div>
          </h2>
          <p className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Junte-se a milhares de atletas que já melhoraram seu desempenho
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/auth/signup")} className={`transition-all duration-1000 delay-500 hover:scale-110 ${ctaSection.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            Começar Agora
          </Button>
          
          {/* Logo abaixo do botão */}
          <div className="mt-12 flex justify-center">
            <img src={logoImage} alt="YM SPORTS Logo" className="w-56 h-56 md:w-64 md:h-64 object-contain opacity-80" />
          </div>
        </div>
      </section>
    </div>;
};
export default Index;