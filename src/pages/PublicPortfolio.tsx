import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PlayerPortfolio } from "@/types/portfolio";
import { 
  User, 
  MapPin, 
  Calendar, 
  Ruler, 
  Weight, 
  Phone, 
  Mail, 
  Instagram, 
  Twitter, 
  Youtube,
  Trophy,
  Target,
  Star,
  Share2,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function PublicPortfolio() {
  const { slug } = useParams<{ slug: string }>();
  const { fetchPortfolioBySlug, registerShare } = usePortfolio();
  const [portfolio, setPortfolio] = useState<PlayerPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPortfolio();
    }
  }, [slug]);

  const loadPortfolio = async () => {
    if (!slug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchPortfolioBySlug(slug);
      if (data) {
        setPortfolio(data);
      } else {
        setError('Portfólio não encontrado');
      }
    } catch (err: any) {
      console.error('Erro ao carregar portfólio:', err);
      setError('Erro ao carregar portfólio');
    } finally {
      setLoading(false);
    }
  };

  // Compartilhar portfólio
  const handleShare = async (platform: 'link' | 'whatsapp' | 'email') => {
    if (!portfolio) return;

    const shareUrl = window.location.href;
    
    try {
      if (platform === 'link') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copiado!');
      } else if (platform === 'whatsapp') {
        const message = `Confira o portfólio de ${portfolio.full_name}: ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      } else if (platform === 'email') {
        const subject = `Portfólio de ${portfolio.full_name}`;
        const body = `Confira o portfólio de ${portfolio.full_name}: ${shareUrl}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      }
      
      await registerShare(portfolio.id, platform);
    } catch (error) {
      toast.error('Erro ao compartilhar');
    }
  };

  // Renderizar habilidades com radar
  const renderSkills = () => {
    if (!portfolio?.skills) return null;

    const skillCategories = [
      {
        title: 'Técnicas',
        skills: [
          { key: 'ball_control', label: 'Controle' },
          { key: 'passing', label: 'Passe' },
          { key: 'shooting', label: 'Finalização' },
          { key: 'dribbling', label: 'Drible' }
        ]
      },
      {
        title: 'Físicas',
        skills: [
          { key: 'speed', label: 'Velocidade' },
          { key: 'strength', label: 'Força' },
          { key: 'stamina', label: 'Resistência' },
          { key: 'agility', label: 'Agilidade' }
        ]
      },
      {
        title: 'Mentais',
        skills: [
          { key: 'vision', label: 'Visão' },
          { key: 'decision_making', label: 'Decisão' },
          { key: 'leadership', label: 'Liderança' },
          { key: 'teamwork', label: 'Equipe' }
        ]
      },
      {
        title: 'Defensivas',
        skills: [
          { key: 'marking', label: 'Marcação' },
          { key: 'tackling', label: 'Desarme' },
          { key: 'interceptions', label: 'Interceptação' },
          { key: 'heading', label: 'Aéreo' }
        ]
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories.map((category) => (
          <Card key={category.title} className="bg-black/40 border border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-500">{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.skills.map((skill) => {
                const value = portfolio.skills?.[skill.key as keyof typeof portfolio.skills] || 0;
                return (
                  <div key={skill.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{skill.label}</span>
                      <span className="font-medium text-yellow-500">{value}/10</span>
                    </div>
                    <Progress value={value * 10} className="h-2 bg-gray-700" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-12">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Portfólio não encontrado</h3>
            <p className="text-muted-foreground">
              O portfólio que você está procurando não existe ou não está público.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-sm shadow-lg border-b border-yellow-500/20">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/icons/logo.png" 
                alt="YM Sports" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-yellow-500">
                  YM Sports
                </h1>
                <p className="text-sm text-gray-300">Portfólio Profissional do Jogador</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleShare('link')}
                className="bg-yellow-500/10 backdrop-blur-sm hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-500 hover:text-yellow-400"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden shadow-2xl border border-yellow-500/20">
          <div className="bg-gradient-to-r from-black via-gray-900 to-yellow-500 text-white p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,193,7,0.1)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="flex-shrink-0">
                {portfolio.profile_photo ? (
                  <img 
                    src={portfolio.profile_photo} 
                    alt={portfolio.full_name}
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl"
                    onError={(e) => {
                      console.log('Erro ao carregar foto de perfil:', portfolio.profile_photo);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-40 h-40 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-2xl backdrop-blur-sm ${portfolio.profile_photo ? 'hidden' : ''}`}>
                  <User className="h-20 w-20 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{portfolio.full_name}</h1>
                <p className="text-xl mb-4">{portfolio.position}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30">
                    <MapPin className="h-4 w-4 mr-1 text-yellow-400" />
                    {portfolio.city && portfolio.state ? `${portfolio.city}, ${portfolio.state}` : portfolio.nationality}
                  </div>
                  <div className="flex items-center bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30">
                    <Calendar className="h-4 w-4 mr-1 text-yellow-400" />
                    {portfolio.age} anos
                  </div>
                  <div className="flex items-center bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30">
                    <Ruler className="h-4 w-4 mr-1 text-yellow-400" />
                    {portfolio.height} cm
                  </div>
                  <div className="flex items-center bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30">
                    <Weight className="h-4 w-4 mr-1 text-yellow-400" />
                    {portfolio.weight} kg
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Pé {portfolio.preferred_foot === 'left' ? 'Esquerdo' : portfolio.preferred_foot === 'right' ? 'Direito' : 'Ambidestro'}
                  </Badge>
                  {portfolio.is_seeking_club && (
                    <Badge variant="secondary" className="bg-yellow-500 text-black border border-yellow-500">
                      <Target className="h-3 w-3 mr-1" />
                      Procurando Clube
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biografia */}
            {portfolio.biography && (
              <Card className="shadow-lg border border-yellow-500/20 bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Sobre</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{portfolio.biography}</p>
                </CardContent>
              </Card>
            )}

            {/* Habilidades */}
            <Card className="shadow-lg border border-yellow-500/20 bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Habilidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderSkills()}
              </CardContent>
            </Card>

            {/* Galeria de Fotos e Vídeos */}
            {((portfolio.gallery_photos && portfolio.gallery_photos.length > 0) || 
              (portfolio.skill_videos && portfolio.skill_videos.length > 0) || 
              portfolio.highlight_video) && (
              <Card className="shadow-lg border border-yellow-500/20 bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Galeria</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Vídeo de Destaque */}
                  {portfolio.highlight_video && (
                    <div className="mb-6">
                      <h4 className="text-yellow-500 font-medium mb-3">Vídeo de Destaque</h4>
                      <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                        <video 
                          controls 
                          className="w-full h-full object-cover"
                          poster="/icons/logo.png"
                        >
                          <source src={portfolio.highlight_video} type="video/mp4" />
                          Seu navegador não suporta vídeos.
                        </video>
                      </div>
                    </div>
                  )}

                  {/* Vídeos de Habilidades */}
                  {portfolio.skill_videos && portfolio.skill_videos.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-yellow-500 font-medium mb-3">Vídeos de Habilidades</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio.skill_videos.slice(0, 4).map((video, index) => (
                          <div key={index} className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                            <video 
                              controls 
                              className="w-full h-full object-cover"
                              poster="/icons/logo.png"
                            >
                              <source src={video} type="video/mp4" />
                              Seu navegador não suporta vídeos.
                            </video>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Galeria de Fotos */}
                  {portfolio.gallery_photos && portfolio.gallery_photos.length > 0 && (
                    <div>
                      <h4 className="text-yellow-500 font-medium mb-3">Fotos de Ação</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {portfolio.gallery_photos.slice(0, 8).map((photo, index) => (
                          <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden group cursor-pointer">
                            <img 
                              src={photo} 
                              alt={`Foto ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = '/icons/logo.png';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      {portfolio.gallery_photos.length > 8 && (
                        <p className="text-center text-gray-400 text-sm mt-4">
                          E mais {portfolio.gallery_photos.length - 8} fotos...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Histórico de Clubes */}
            {portfolio.club_history && portfolio.club_history.length > 0 && (
              <Card className="shadow-lg border border-yellow-500/20 bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Histórico de Clubes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolio.club_history.map((club) => (
                      <div key={club.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          {club.club_logo && (
                            <img src={club.club_logo} alt={club.club_name} className="w-12 h-12 rounded mr-4" />
                          )}
                          <div>
                            <p className="font-semibold text-lg">{club.club_name}</p>
                            <p className="text-muted-foreground">{club.position}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(club.start_date), 'MMM yyyy', { locale: ptBR })} - 
                              {club.end_date ? format(new Date(club.end_date), 'MMM yyyy', { locale: ptBR }) : 'Atual'}
                            </p>
                            {(club.games_played || club.goals_scored || club.assists) && (
                              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                {club.games_played > 0 && <span>{club.games_played} jogos</span>}
                                {club.goals_scored > 0 && <span>{club.goals_scored} gols</span>}
                                {club.assists > 0 && <span>{club.assists} assistências</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        {club.is_current && (
                          <Badge variant="default">Atual</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contato */}
            <Card className="shadow-lg border border-yellow-500/20 bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-500">Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {portfolio.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-yellow-500" />
                    <span className="text-sm text-gray-300">{portfolio.phone}</span>
                  </div>
                )}
                {portfolio.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-yellow-500" />
                    <span className="text-sm text-gray-300">{portfolio.email}</span>
                  </div>
                )}
                
                {portfolio.social_media && (
                  <div className="pt-3 border-t border-yellow-500/20">
                    <p className="text-sm font-medium mb-3 text-yellow-500">Redes Sociais</p>
                    <div className="space-y-2">
                      {portfolio.social_media.instagram && (
                        <a 
                          href={`https://instagram.com/${portfolio.social_media.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          @{portfolio.social_media.instagram}
                        </a>
                      )}
                      {portfolio.social_media.twitter && (
                        <a 
                          href={`https://twitter.com/${portfolio.social_media.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          <Twitter className="h-4 w-4 mr-2" />
                          @{portfolio.social_media.twitter}
                        </a>
                      )}
                      {portfolio.social_media.youtube && (
                        <a 
                          href={`https://youtube.com/${portfolio.social_media.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          <Youtube className="h-4 w-4 mr-2" />
                          {portfolio.social_media.youtube}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compartilhar */}
            <Card className="shadow-lg border border-yellow-500/20 bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-500">Compartilhar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400" 
                  onClick={() => handleShare('whatsapp')}
                >
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400" 
                  onClick={() => handleShare('email')}
                >
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400" 
                  onClick={() => handleShare('link')}
                >
                  Copiar Link
                </Button>
              </CardContent>
            </Card>

            {/* Conquistas */}
            {portfolio.achievements && portfolio.achievements.length > 0 && (
              <Card className="shadow-lg border border-yellow-500/20 bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Conquistas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {portfolio.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                        <span className="text-sm text-gray-300">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
