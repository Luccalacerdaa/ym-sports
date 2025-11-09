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
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
    description: "Design profissional para jogador de futebol com efeitos modernos e logo do clube.",
    tags: ["Profissional", "Futebol", "Moderno"],
    rating: 5
  },
  {
    id: 2,
    title: "Card de Apresentação - Pedro Santos",
    category: "Card Pessoal",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=600&fit=crop",
    description: "Card personalizado com estatísticas e informações do atleta.",
    tags: ["Card", "Estatísticas", "Personalizado"],
    rating: 5
  },
  {
    id: 3,
    title: "Banner para Redes Sociais - Maria Costa",
    category: "Social Media",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop",
    description: "Banner dinâmico para Instagram e Facebook com cores vibrantes.",
    tags: ["Social Media", "Instagram", "Vibrante"],
    rating: 5
  },
  {
    id: 4,
    title: "Montagem Artística - Carlos Lima",
    category: "Arte Digital",
    image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=600&fit=crop",
    description: "Montagem artística com efeitos especiais e composição única.",
    tags: ["Arte Digital", "Efeitos", "Criativo"],
    rating: 5
  },
  {
    id: 5,
    title: "Logo Personalizada - Time Águias",
    category: "Branding",
    image: "https://images.unsplash.com/photo-1614632537190-23e4b2e0c6b4?w=400&h=600&fit=crop",
    description: "Criação de logo exclusiva para time amador com identidade visual completa.",
    tags: ["Logo", "Branding", "Time"],
    rating: 5
  },
  {
    id: 6,
    title: "Poster Motivacional - Ana Rodrigues",
    category: "Poster",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=600&fit=crop",
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
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Palette className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              YM DESIGN
            </h1>
            <p className="text-lg text-muted-foreground">Por Yago - Designer Especialista em Esportes</p>
          </div>
        </div>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transforme sua imagem esportiva com designs profissionais e criativos. 
          Especializados em fotos, artes digitais e branding para atletas e times.
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Star className="h-3 w-3 mr-1" />
            5.0 Estrelas
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            Entrega Rápida
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Heart className="h-3 w-3 mr-1" />
            +200 Clientes Satisfeitos
          </Badge>
        </div>
      </div>

      {/* CTA Principal */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Pronto para destacar seu talento?</h2>
          <p className="text-lg mb-6 opacity-90">
            Entre em contato agora e receba um orçamento personalizado para seu projeto!
          </p>
          <Button 
            size="lg" 
            onClick={handleWhatsAppContact}
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
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
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit">
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <p className="font-semibold text-purple-600">{service.price}</p>
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
              className={selectedCategory === category ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {category === "all" ? "Todos" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid do Portfólio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortfolio.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div className="relative overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-purple-600 text-white mb-2">
                    {item.category}
                  </Badge>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{item.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={handleWhatsAppContact}
              >
                <Eye className="h-4 w-4 mr-2" />
                Solicitar Orçamento
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Depoimentos */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-center text-2xl">O que nossos clientes dizem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic">"Trabalho excepcional! O Yago captou exatamente o que eu queria para minha apresentação profissional."</p>
              <p className="font-semibold">- João Silva, Atacante</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic">"Design incrível e entrega super rápida. Recomendo para todos os atletas!"</p>
              <p className="font-semibold">- Maria Costa, Meio-campo</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic">"Profissionalismo e criatividade em cada detalhe. Nosso time ficou com uma identidade única!"</p>
              <p className="font-semibold">- Carlos Lima, Técnico</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Final */}
      <Card className="bg-gradient-to-r from-gray-900 to-purple-900 text-white border-0">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Vamos criar algo incrível juntos?</h2>
          <p className="text-lg mb-6 opacity-90">
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
              className="border-white text-white hover:bg-white hover:text-purple-900"
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
