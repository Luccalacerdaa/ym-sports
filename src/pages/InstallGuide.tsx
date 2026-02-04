import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Apple, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import logoImage from "@/assets/ym-sports-logo-new.png";

const InstallGuide = () => {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<"android" | "ios">("android");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Quando a plataforma mudar, resetar o vídeo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [selectedPlatform]);

  const steps = {
    android: [
      "Abra o app YM SPORTS no navegador Chrome ou Firefox",
      "Toque no menu (3 pontos) no canto superior direito",
      "Selecione 'Adicionar à tela inicial' ou 'Instalar app'",
      "Confirme a instalação tocando em 'Adicionar' ou 'Instalar'",
      "Pronto! O app agora está na sua tela inicial"
    ],
    ios: [
      "Abra o app YM SPORTS no navegador Safari",
      "Toque no ícone de compartilhar (quadrado com seta para cima) na parte inferior",
      "Role para baixo e selecione 'Adicionar à Tela de Início'",
      "Digite o nome do app (ou mantenha 'YM SPORTS')",
      "Toque em 'Adicionar' no canto superior direito",
      "Pronto! O app agora está na sua tela inicial"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black">
      {/* Header */}
      <div className="relative z-10 py-6 px-4 border-b border-border/50 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <img src={logoImage} alt="YM SPORTS Logo" className="h-12 w-12 object-contain" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-astro font-bold mb-4 text-foreground">
              Como Instalar o App
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Siga o tutorial em vídeo abaixo para instalar o YM SPORTS no seu dispositivo
            </p>
          </div>

          {/* Platform Selector */}
          <div className="flex justify-center gap-4 mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Button
              variant={selectedPlatform === "android" ? "hero" : "outline"}
              size="lg"
              onClick={() => setSelectedPlatform("android")}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-5 h-5" />
              Android
            </Button>
            <Button
              variant={selectedPlatform === "ios" ? "hero" : "outline"}
              size="lg"
              onClick={() => setSelectedPlatform("ios")}
              className="flex items-center gap-2"
            >
              <Apple className="w-5 h-5" />
              iOS (iPhone/iPad)
            </Button>
          </div>

          {/* Video Tutorial */}
          <Card className="border-primary/50 mb-8 overflow-hidden animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-foreground">
                {selectedPlatform === "android" ? (
                  <>
                    <Smartphone className="w-6 h-6 text-primary" />
                    Tutorial Android
                  </>
                ) : (
                  <>
                    <Apple className="w-6 h-6 text-primary" />
                    Tutorial iOS
                  </>
                )}
              </CardTitle>
              <CardDescription>
                Assista ao vídeo abaixo para aprender como instalar
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full bg-black" style={{ aspectRatio: "9/16", maxHeight: "70vh" }}>
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                  key={selectedPlatform} // Force re-render when platform changes
                >
                  <source 
                    src={`/tutorials/${selectedPlatform}-install.mp4`}
                    type="video/mp4"
                  />
                  Seu navegador não suporta vídeos HTML5.
                </video>
              </div>
            </CardContent>
          </Card>

          {/* Step by Step Guide */}
          <Card className="border-border animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle className="text-foreground">Passo a Passo</CardTitle>
              <CardDescription>
                Siga estas etapas para instalar o app no seu {selectedPlatform === "android" ? "Android" : "iPhone/iPad"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps[selectedPlatform].map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/20 transition-all duration-300 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </div>
                    <p className="text-foreground pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="border-primary/50 mt-8 bg-gradient-to-br from-primary/10 to-transparent animate-fade-up" style={{ animationDelay: "0.8s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle className="w-6 h-6 text-primary" />
                Por que instalar o app?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Acesso rápido direto da tela inicial do seu celular</span>
                </li>
                <li className="flex items-start gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Notificações em tempo real sobre treinos e eventos</span>
                </li>
                <li className="flex items-start gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Funciona mesmo sem conexão à internet (modo offline)</span>
                </li>
                <li className="flex items-start gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Experiência completa como um app nativo</span>
                </li>
                <li className="flex items-start gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Não ocupa espaço na memória como apps tradicionais</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center mt-12 animate-fade-up" style={{ animationDelay: "1s" }}>
            <p className="text-lg text-muted-foreground mb-6">
              Após instalar o app, faça login ou crie sua conta para começar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate("/auth/signup")}
                className="hover:scale-110 transition-transform duration-300"
              >
                Criar Conta
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate("/auth/login")}
                className="hover:scale-110 transition-transform duration-300"
              >
                Já tenho conta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;

