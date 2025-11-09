import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  MessageCircle, 
  Star, 
  Image, 
  Zap, 
  Trophy,
  Camera,
  Sparkles,
  ExternalLink,
  Heart,
  Eye
} from "lucide-react";

// Dados de exemplo dos trabalhos do Yago
const designPortfolio = [
  {
    id: 1,
    title: "Arte Profissional - João Silva",
    category: "Foto Profissional",
    description: "Design profissional para jogador de futebol com efeitos modernos e logo do clube.",
    tags: ["Profissional", "Futebol", "Moderno"],
    rating: 5
  },
  {
    id: 2,
    title: "Card de Apresentação - Pedro Santos",
    category: "Card Pessoal",
    description: "Card personalizado com estatísticas e informações do atleta.",
    tags: ["Card", "Estatísticas", "Personalizado"],
    rating: 5
  },
  {
    id: 3,
    title: "Banner para Redes Sociais - Maria Costa",
    category: "Social Media",
    description: "Banner dinâmico para Instagram e Facebook com cores vibrantes.",
    tags: ["Social Media", "Instagram", "Vibrante"],
    rating: 5
  },
  {
    id: 4,
    title: "Montagem Artística - Carlos Lima",
    category: "Arte Digital",
    description: "Montagem artística com efeitos especiais e composição única.",
    tags: ["Arte Digital", "Efeitos", "Criativo"],
    rating: 5
  },
  {
    id: 5,
    title: "Logo Personalizada - Time Águias",
    category: "Branding",
    description: "Criação de logo exclusiva para time amador com identidade visual completa.",
    tags: ["Logo", "Branding", "Time"],
    rating: 5
  },
  {
    id: 6,
    title: "Poster Motivacional - Ana Rodrigues",
    category: "Poster",
    description: "Poster inspiracional com frase motivacional e design impactante.",
    tags: ["Motivacional", "Poster", "Inspiração"],
    rating: 5
  }
];

const services = [
  {
    icon: Camera,
    title: "Fotos Profissionais",
    description: "Edição e tratamento de fotos esportivas com qualidade profissional",
    price: "A partir de R$ 50"
  },
  {
    icon: Palette,
    title: "Design Personalizado",
    description: "Criação de artes exclusivas para redes sociais e apresentações",
    price: "A partir de R$ 80"
  },
  {
    icon: Sparkles,
    title: "Efeitos Especiais",
    description: "Montagens com efeitos visuais e composições artísticas",
    price: "A partir de R$ 120"
  },
  {
    icon: Trophy,
    title: "Branding Esportivo",
    description: "Logos, uniformes e identidade visual para times e atletas",
    price: "A partir de R$ 200"
  }
];

export default function Design() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "Foto Profissional", "Card Pessoal", "Social Media", "Arte Digital", "Branding", "Poster"];

  const filteredPortfolio = selectedCategory === "all" 
    ? designPortfolio 
    : designPortfolio.filter(item => item.category === selectedCategory);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      "Olá Yago! 🎨\n\nVi seu portfólio no YM Sports e fiquei impressionado com seus trabalhos! Gostaria de solicitar um orçamento para criar um design personalizado.\n\nPodemos conversar sobre os detalhes?\n\nObrigado!"
    );
    const whatsappUrl = `https://wa.me/5565996438395?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-yellow-500 rounded-full">
            <img 
              src="/icons/logo.png" 
              alt="YM Sports" 
              className="h-8 w-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-yellow-500">
              YM DESIGN
            </h1>
            <p className="text-lg text-gray-400">Por Yago - Designer Especialista em Esportes</p>
          </div>
        </div>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Transforme sua imagem esportiva com designs profissionais e criativos. 
          Especializados em fotos, artes digitais e branding para atletas e times.
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            <Star className="h-3 w-3 mr-1" />
            5.0 Estrelas
          </Badge>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            <Zap className="h-3 w-3 mr-1" />
            Entrega Rápida
          </Badge>
        </div>
      </div>

      {/* CTA Principal */}
      <Card className="bg-black border border-yellow-500/30 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-500">Pronto para destacar seu talento?</h2>
          <p className="text-lg mb-6 text-gray-300">
            Entre em contato agora e receba um orçamento personalizado para seu projeto!
          </p>
          <Button 
            size="lg" 
            onClick={handleWhatsAppContact}
            className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Falar com Yago no WhatsApp
          </Button>
        </CardContent>
      </Card>

      {/* Serviços */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Nossos Serviços</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border border-yellow-500/20 bg-gray-900/50">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-yellow-500 rounded-full w-fit">
                  <service.icon className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-lg text-yellow-500">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-sm text-gray-300">{service.description}</p>
                <p className="font-semibold text-yellow-400">{service.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filtros do Portfólio */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Portfólio de Trabalhos</h2>
        
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-yellow-500 text-black hover:bg-yellow-400" : "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"}
            >
              {category === "all" ? "Todos" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid do Portfólio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortfolio.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border border-yellow-500/20 bg-gray-900/50">
            <div className="relative overflow-hidden">
              {/* Proporção 1080x1920 (9:16) */}
              <div 
                className="w-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors duration-300"
                style={{ aspectRatio: '9/16' }}
              >
                <div className="text-center text-gray-400">
                  <Image className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">1080 x 1920 px</p>
                  <p className="text-xs">Design Preview</p>
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <Badge className="bg-yellow-500 text-black">
                  {item.category}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-yellow-500">{item.title}</h3>
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-gray-300">{item.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button 
                className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                onClick={handleWhatsAppContact}
              >
                <Eye className="h-4 w-4 mr-2" />
                Solicitar Orçamento
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* CTA Final */}
      <Card className="bg-black border border-yellow-500/30 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-yellow-500">Vamos criar algo incrível juntos?</h2>
          <p className="text-lg mb-6 text-gray-300">
            Seja para fotos profissionais, designs para redes sociais ou identidade visual completa, 
            estamos prontos para elevar sua imagem no esporte!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleWhatsAppContact}
              className="bg-green-600 hover:bg-green-700 font-semibold"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp: (65) 99643-8395
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
              onClick={handleWhatsAppContact}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Solicitar Orçamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
