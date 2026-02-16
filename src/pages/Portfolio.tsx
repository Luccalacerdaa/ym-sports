import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProfile } from "@/hooks/useProfile";
import { PlayerPortfolio } from "@/types/portfolio";
import { 
  User, 
  Share2, 
  Eye, 
  Edit, 
  Plus, 
  ExternalLink,
  Copy,
  Trophy,
  MapPin,
  Calendar,
  Ruler,
  Weight,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Youtube,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { PortfolioEditor } from "@/components/PortfolioEditor";
import { SharePortfolioAnimation } from "@/components/SharePortfolioAnimation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Portfolio() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { 
    portfolio, 
    loading, 
    createPortfolio, 
    generateShareLink, 
    registerShare,
    getPortfolioStats,
    fetchMyPortfolio
  } = usePortfolio();
  
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ totalViews: 0, totalShares: 0 });
  const [showShareAnimation, setShowShareAnimation] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<'link' | 'whatsapp' | 'email'>('link');

  // Carregar estatísticas
  useEffect(() => {
    if (portfolio) {
      getPortfolioStats(portfolio.id).then(setStats);
    }
  }, [portfolio]);

  // Criar portfólio inicial se não existir
  const handleCreatePortfolio = async () => {
    if (!profile) {
      toast.error('Complete seu perfil primeiro');
      navigate('/dashboard/profile');
      return;
    }

    const initialData: Partial<PlayerPortfolio> = {
      full_name: profile.name || 'Jogador',
      position: profile.position || 'Não informado',
      age: profile.age || 18,
      height: profile.height || 175,
      weight: profile.weight || 70,
      preferred_foot: 'right',
      nationality: 'Brasil',
      email: profile.email,
      biography: '',
      is_public: true,
      is_seeking_club: false,
      career_stats: {
        total_games: 0,
        total_goals: 0,
        total_assists: 0,
        yellow_cards: 0,
        red_cards: 0
      },
      skills: {
        ball_control: 5,
        passing: 5,
        shooting: 5,
        dribbling: 5,
        crossing: 5,
        finishing: 5,
        speed: 5,
        acceleration: 5,
        strength: 5,
        jumping: 5,
        stamina: 5,
        agility: 5,
        vision: 5,
        decision_making: 5,
        concentration: 5,
        leadership: 5,
        teamwork: 5,
        marking: 5,
        tackling: 5,
        interceptions: 5,
        heading: 5
      }
    };

    try {
      await createPortfolio(initialData);
    } catch (error) {
      console.error('Erro ao criar portfólio:', error);
    }
  };

  // Compartilhar portfólio
  const handleShare = async (platform: 'link' | 'whatsapp' | 'email' | 'social') => {
    if (!portfolio) return;
    
    if (!portfolio.slug) {
      toast.error('Seu portfólio ainda não tem um link. Salve as alterações primeiro.');
      return;
    }

    const shareUrl = generateShareLink(portfolio.slug);
    
    try {
      if (platform === 'link') {
        await navigator.clipboard.writeText(shareUrl);
        setSharePlatform('link');
        setShowShareAnimation(true);
      } else if (platform === 'whatsapp') {
        const message = `Confira meu portfólio de jogador: ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        setSharePlatform('whatsapp');
        setShowShareAnimation(true);
      } else if (platform === 'email') {
        const subject = `Portfólio de ${portfolio.full_name}`;
        const body = `Olá!\n\nConfira meu portfólio de jogador: ${shareUrl}\n\nObrigado!`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        setSharePlatform('email');
        setShowShareAnimation(true);
      }
      
      await registerShare(portfolio.id, platform);
    } catch (error) {
      toast.error('Erro ao compartilhar');
    }
  };

  // Renderizar estatísticas
  const renderStats = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="flex items-center p-4">
          <Eye className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <p className="text-2xl font-bold">{stats.totalViews}</p>
            <p className="text-xs text-muted-foreground">Visualizações</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center p-4">
          <Share2 className="h-8 w-8 text-green-500 mr-3" />
          <div>
            <p className="text-2xl font-bold">{stats.totalShares}</p>
            <p className="text-xs text-muted-foreground">Compartilhamentos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Renderizar informações básicas
  const renderBasicInfo = () => {
    if (!portfolio) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            {portfolio.profile_photo ? (
              <img 
                src={portfolio.profile_photo} 
                alt={portfolio.full_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold">{portfolio.full_name}</h2>
            <p className="text-lg text-muted-foreground">{portfolio.position}</p>
            <div className="flex items-center justify-center mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{portfolio.nationality}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{portfolio.age} anos</span>
            </div>
            <div className="flex items-center">
              <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{portfolio.height} cm</span>
            </div>
            <div className="flex items-center">
              <Weight className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{portfolio.weight} kg</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⚽</span>
              <span>Pé {portfolio.preferred_foot === 'left' ? 'esquerdo' : portfolio.preferred_foot === 'right' ? 'direito' : 'ambidestro'}</span>
            </div>
          </div>

          {portfolio.biography && (
            <div>
              <h4 className="font-semibold mb-2">Biografia</h4>
              <p className="text-sm text-muted-foreground">{portfolio.biography}</p>
            </div>
          )}

          {/* Contato */}
          {(portfolio.phone || portfolio.email || portfolio.social_media) && (
            <div>
              <h4 className="font-semibold mb-2">Contato</h4>
              <div className="space-y-2">
                {portfolio.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{portfolio.phone}</span>
                  </div>
                )}
                {portfolio.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{portfolio.email}</span>
                  </div>
                )}
                {portfolio.social_media?.instagram && (
                  <div className="flex items-center text-sm">
                    <Instagram className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`https://instagram.com/${portfolio.social_media.instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      @{portfolio.social_media.instagram}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Renderizar estatísticas de carreira
  const renderCareerStats = () => {
    if (!portfolio?.career_stats) return null;

    const stats = portfolio.career_stats;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Estatísticas de Carreira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.total_games}</p>
              <p className="text-xs text-muted-foreground">Jogos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.total_goals}</p>
              <p className="text-xs text-muted-foreground">Gols</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{stats.total_assists}</p>
              <p className="text-xs text-muted-foreground">Assistências</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.yellow_cards}</p>
              <p className="text-xs text-muted-foreground">Cartões</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Renderizar histórico de clubes
  const renderClubHistory = () => {
    if (!portfolio?.club_history || portfolio.club_history.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Clubes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.club_history.map((club) => (
              <div key={club.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  {club.club_logo && (
                    <img src={club.club_logo} alt={club.club_name} className="w-10 h-10 rounded mr-3" />
                  )}
                  <div>
                    <p className="font-semibold">{club.club_name}</p>
                    <p className="text-sm text-muted-foreground">{club.position}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(club.start_date), 'MMM yyyy', { locale: ptBR })} - 
                      {club.end_date ? format(new Date(club.end_date), 'MMM yyyy', { locale: ptBR }) : 'Atual'}
                    </p>
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
    );
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Crie seu Portfólio de Jogador</h3>
            <p className="text-muted-foreground mb-6">
              Mostre suas habilidades, histórico e conquistas para empresários e clubes
            </p>
            <Button onClick={handleCreatePortfolio} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Criar Portfólio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Meu Portfólio</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (!portfolio.slug) {
                toast.error('Seu portfólio ainda não tem um link. Salve as alterações primeiro.');
                return;
              }
              window.open(generateShareLink(portfolio.slug), '_blank');
            }}
            className="flex-1 sm:flex-none"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleShare('link')}
            className="flex-1 sm:flex-none"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
          <Button 
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-black font-bold shadow-[0_0_20px_rgba(252,211,77,0.6)] hover:shadow-[0_0_30px_rgba(252,211,77,0.9)] transition-all"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mb-6">
        {renderStats()}
      </div>

      {/* Compartilhamento */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Compartilhar Portfólio
          </CardTitle>
          <CardDescription>
            Compartilhe seu portfólio com empresários e clubes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleShare('whatsapp')}>
              WhatsApp
            </Button>
            <Button variant="outline" onClick={() => handleShare('email')}>
              Email
            </Button>
            <Button variant="outline" onClick={() => handleShare('link')}>
              Copiar Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo do Portfólio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderBasicInfo()}
        {renderCareerStats()}
      </div>

      <div className="mt-6">
        {renderClubHistory()}
      </div>

      {/* Editor Modal */}
      {isEditing && (
        <PortfolioEditor 
          portfolio={portfolio}
          onClose={() => setIsEditing(false)}
          onSave={async () => {
            console.log('🔄 Recarregando portfólio após salvar...');
            setIsEditing(false);
            // Recarregar dados para mostrar alterações imediatamente
            await fetchMyPortfolio();
            console.log('✅ Portfólio recarregado!');
          }}
        />
      )}

      {/* Animação de compartilhamento */}
      {showShareAnimation && (
        <SharePortfolioAnimation
          platform={sharePlatform}
          onComplete={() => {
            setShowShareAnimation(false);
          }}
        />
      )}
    </div>
  );
}
