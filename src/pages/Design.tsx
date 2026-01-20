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
  Eye,
  Play
} from "lucide-react";

// Dados dos trabalhos de Fotos (Artes Profissionais)
const photoPortfolio = [
  {
    id: 1,
    title: "Arte Profissional - Jogador",
    category: "Foto Profissional",
    description: "Design profissional para jogador de futebol com efeitos modernos e logo do clube.",
    tags: ["Profissional", "Futebol", "Moderno"],
    rating: 5,
    image: "/ym-design/fotos/IMG_1161.JPEG"
  },
  {
    id: 2,
    title: "Card de Apresentação",
    category: "Card Pessoal",
    description: "Card personalizado com estatísticas e informações do atleta.",
    tags: ["Card", "Estatísticas", "Personalizado"],
    rating: 5,
    image: "/ym-design/fotos/IMG_2526.JPEG"
  },
  {
    id: 3,
    title: "Banner para Redes Sociais",
    category: "Social Media",
    description: "Banner dinâmico para Instagram e Facebook com cores vibrantes.",
    tags: ["Social Media", "Instagram", "Vibrante"],
    rating: 5,
    image: "/ym-design/fotos/IMG_3711.JPEG"
  },
  {
    id: 4,
    title: "Montagem Artística",
    category: "Arte Digital",
    description: "Montagem artística com efeitos especiais e composição única.",
    tags: ["Arte Digital", "Efeitos", "Criativo"],
    rating: 5,
    image: "/ym-design/fotos/IMG_3848 (1).JPEG"
  },
  {
    id: 5,
    title: "Logo Personalizada",
    category: "Branding",
    description: "Criação de logo exclusiva para time amador com identidade visual completa.",
    tags: ["Logo", "Branding", "Time"],
    rating: 5,
    image: "/ym-design/fotos/IMG_4367.JPEG"
  }
];

// Dados dos trabalhos de Motion Design
const motionPortfolio = [
  {
    id: 1,
    title: "Intro Dinâmica - Jogador",
    description: "Vídeo de apresentação com efeitos de motion design e transições suaves.",
    tags: ["Motion", "Intro", "Profissional"],
    rating: 5,
    video: "/ym-design/motion/IMG_1404.MOV",
    thumbnail: "/ym-design/fotos/IMG_1161.JPEG", // Usando foto como thumbnail temporária
    youtubeId: ""
  },
  {
    id: 2,
    title: "Highlights Animados",
    description: "Compilação de melhores momentos com efeitos visuais e música.",
    tags: ["Highlights", "Animação", "Esportes"],
    rating: 5,
    video: "/ym-design/motion/IMG_4942.MOV",
    thumbnail: "/ym-design/fotos/IMG_2526.JPEG", // Usando foto como thumbnail temporária
    youtubeId: ""
  },
  {
    id: 3,
    title: "Apresentação YM Sports",
    description: "Vídeo institucional com identidade visual e apresentação profissional.",
    tags: ["Institucional", "Branding", "Premium"],
    rating: 5,
    video: "/ym-design/motion/VIDEO YM.MOV",
    thumbnail: "/ym-design/fotos/IMG_3711.JPEG", // Usando foto como thumbnail temporária
    youtubeId: ""
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
  const [selectedSection, setSelectedSection] = useState<"fotos" | "motion">("fotos");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const categories = ["all", "Foto Profissional", "Card Pessoal", "Social Media", "Arte Digital", "Branding", "Poster"];

  const filteredPortfolio = selectedCategory === "all" 
    ? photoPortfolio 
    : photoPortfolio.filter(item => item.category === selectedCategory);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      "Olá Yago! 🎨\n\nVi seu portfólio no YM Sports e fiquei impressionado com seus trabalhos! Gostaria de solicitar um orçamento para criar um design personalizado.\n\nPodemos conversar sobre os detalhes?\n\nObrigado!"
    );
    const whatsappUrl = `https://wa.me/5565996438395?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Simplificado */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src="/icons/logo.png" 
            alt="YM Sports" 
            className="h-24 w-24 object-contain"
          />
          <h1 className="text-4xl font-bold text-white">
            YM DESIGN
          </h1>
        </div>
        
        <p className="text-2xl text-[#FFD700] font-semibold">Designer Especialista em Esportes</p>
        
        <h2 className="text-xl font-semibold text-white">
          Material profissional para atletas
        </h2>
        
        <p className="text-base text-gray-300 max-w-xl mx-auto">
          Artes profissionais, edição de vídeo e divulgação.
        </p>
      </div>

      {/* Seleção de Seção: Fotos ou Motion */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          size="lg"
          variant={selectedSection === "fotos" ? "default" : "outline"}
          onClick={() => setSelectedSection("fotos")}
          className={selectedSection === "fotos" 
            ? "bg-yellow-500 text-black hover:bg-yellow-400 font-semibold" 
            : "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"}
        >
          <Camera className="h-5 w-5 mr-2" />
          Fotos Profissionais
        </Button>
        <Button
          size="lg"
          variant={selectedSection === "motion" ? "default" : "outline"}
          onClick={() => setSelectedSection("motion")}
          className={selectedSection === "motion" 
            ? "bg-yellow-500 text-black hover:bg-yellow-400 font-semibold" 
            : "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"}
        >
          <Play className="h-5 w-5 mr-2" />
          Motion Design
        </Button>
      </div>

      {/* Filtros do Portfólio (apenas para Fotos) */}
      {selectedSection === "fotos" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">Artes Profissionais</h2>
          
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
      )}

      {selectedSection === "motion" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">Motion Design</h2>
          <p className="text-center text-gray-400">Vídeos animados e apresentações dinâmicas</p>
        </div>
      )}

      {/* Grid de Fotos */}
      {selectedSection === "fotos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolio.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border border-yellow-500/20 bg-gray-900/50">
              <div className="relative overflow-hidden">
                {/* Imagem real ou placeholder */}
                <div 
                  className="w-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors duration-300"
                  style={{ aspectRatio: '9/16' }}
                >
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback se a imagem não existir
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden text-center text-gray-400">
                    <Image className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">1080 x 1920 px</p>
                    <p className="text-xs">Adicione sua foto!</p>
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
      )}

      {/* Grid de Motion */}
      {selectedSection === "motion" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {motionPortfolio.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border border-yellow-500/20 bg-gray-900/50">
              <div className="relative overflow-hidden cursor-pointer" onClick={() => setSelectedVideo(item)}>
                {/* Thumbnail do vídeo */}
                <div 
                  className="w-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors duration-300 relative"
                  style={{ aspectRatio: '16/9' }}
                >
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden text-center text-gray-400">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Vídeo Motion</p>
                    <p className="text-xs">Adicione seu vídeo!</p>
                  </div>
                  {/* Ícone de Play sobreposto */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                    <div className="bg-yellow-500 rounded-full p-4 group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-black fill-black" />
                    </div>
                  </div>
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
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-yellow-500 text-black hover:bg-yellow-400"
                    onClick={() => setSelectedVideo(item)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Assistir
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                    onClick={handleWhatsAppContact}
                  >
                    Orçamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Vídeo */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">
                {selectedVideo.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            
            <div className="aspect-video bg-black">
              {selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay"
                  title={selectedVideo.title}
                />
              ) : (
                <video 
                  src={selectedVideo.video} 
                  controls 
                  autoPlay
                  className="w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLVideoElement).style.display = 'none';
                    const parent = (e.target as HTMLVideoElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><p>Vídeo não encontrado. Adicione o arquivo na pasta public/ym-design/motion/</p></div>';
                    }
                  }}
                >
                  Seu navegador não suporta vídeos.
                </video>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-800">
              <p className="text-sm text-gray-400 text-center">
                {selectedVideo.description}
              </p>
              <div className="flex justify-center mt-4">
                <Button 
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                  onClick={handleWhatsAppContact}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Solicitar Serviço Similar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Oferta Especial */}
      <Card className="bg-yellow-500/10 border border-yellow-500/30 text-white">
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-3xl font-bold text-yellow-500">
            20% OFF em duas artes mensais
          </h3>
          <p className="text-xl text-yellow-400 font-semibold">
            EXCLUSIVO PARA ASSINANTES DO APP
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-base py-2 px-4">
              <Star className="h-4 w-4 mr-1" />
              5.0 Estrelas
            </Badge>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-base py-2 px-4">
              <Zap className="h-4 w-4 mr-1" />
              Entrega Rápida
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Destaque seu talento */}
      <Card className="bg-black border border-yellow-500/30 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Destaque seu talento</h2>
          <p className="text-lg mb-6 text-gray-300">
            Entre em contato e receba um orçamento personalizado!
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

      {/* CTA Final */}
      <Card className="bg-black border border-yellow-500/30 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Vamos criar algo incrível?</h2>
          <p className="text-lg mb-6 text-gray-300">
            Fotos profissionais, designs para redes sociais ou identidade visual completa.
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
