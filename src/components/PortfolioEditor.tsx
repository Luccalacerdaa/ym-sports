import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerPortfolio, ClubHistory, Medal, Championship, IndividualAward } from "@/types/portfolio";
import { usePortfolio } from "@/hooks/usePortfolio";
import { toast } from "sonner";
import { Plus, Trash2, Save, Upload, Image, Video, X } from "lucide-react";
import FileUpload from "@/components/FileUpload";

interface PortfolioEditorProps {
  portfolio: PlayerPortfolio;
  onClose: () => void;
  onSave: () => void;
}

export function PortfolioEditor({ portfolio, onClose, onSave }: PortfolioEditorProps) {
  const { updatePortfolio, addClubHistory, updateClubHistory, removeClubHistory } = usePortfolio();
  const [loading, setLoading] = useState(false);
  
  // Estados para os dados do portfólio
  const [basicInfo, setBasicInfo] = useState({
    full_name: portfolio.full_name,
    position: portfolio.position,
    age: portfolio.age,
    height: portfolio.height,
    weight: portfolio.weight,
    preferred_foot: portfolio.preferred_foot,
    nationality: portfolio.nationality,
    city: portfolio.city || '',
    state: portfolio.state || '',
    biography: portfolio.biography || '',
    phone: portfolio.phone || '',
    email: portfolio.email || '',
    profile_photo: portfolio.profile_photo || '',
    highlight_video: portfolio.highlight_video || '',
    gallery_photos: portfolio.gallery_photos || [],
    skill_videos: portfolio.skill_videos || []
  });

  const [socialMedia, setSocialMedia] = useState({
    instagram: portfolio.social_media?.instagram || '',
    youtube: portfolio.social_media?.youtube || ''
  });

  const [careerStats, setCareerStats] = useState(portfolio.career_stats || {
    total_games: 0,
    total_goals: 0,
    total_assists: 0,
    yellow_cards: 0,
    red_cards: 0
  });

  const [achievements, setAchievements] = useState(portfolio.achievements_data || {
    medals: [],
    championships: [],
    individual_awards: []
  });

  const [settings, setSettings] = useState({
    is_public: portfolio.is_public,
    is_seeking_club: portfolio.is_seeking_club,
    salary_expectation: portfolio.salary_expectation || ''
  });

  const [newClub, setNewClub] = useState({
    club_name: '',
    position: '',
    start_date: '',
    end_date: '',
    is_current: false,
    games_played: 0,
    goals_scored: 0,
    assists: 0
  });

  // Salvar alterações
  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Validar campos obrigatórios
      if (!basicInfo.full_name?.trim()) {
        toast.error('Nome completo é obrigatório');
        setLoading(false);
        return;
      }
      
      if (!basicInfo.position?.trim()) {
        toast.error('Posição é obrigatória');
        setLoading(false);
        return;
      }
      
      // Preparar dados limpos para atualização - APENAS campos da tabela player_portfolios
      
      const updateData: any = {
        full_name: basicInfo.full_name.trim(),
        position: basicInfo.position,
        age: Number(basicInfo.age) || 0,
        height: Number(basicInfo.height) || 0,
        weight: Number(basicInfo.weight) || 0,
        preferred_foot: basicInfo.preferred_foot || 'right',
        nationality: basicInfo.nationality?.trim() || 'Brasil',
        city: basicInfo.city?.trim() || null,
        state: basicInfo.state?.trim() || null,
        biography: basicInfo.biography?.trim() || null,
        phone: basicInfo.phone?.trim() || null,
        email: basicInfo.email?.trim() || null,
        profile_photo: basicInfo.profile_photo?.trim() || null,
        highlight_video: basicInfo.highlight_video?.trim() || null,
        gallery_photos: Array.isArray(basicInfo.gallery_photos) 
          ? basicInfo.gallery_photos.filter(p => p && p.trim()) 
          : [],
        skill_videos: Array.isArray(basicInfo.skill_videos) 
          ? basicInfo.skill_videos.filter(v => v && v.trim()) 
          : [],
        social_media: {
          instagram: socialMedia.instagram?.trim() || null,
          youtube: socialMedia.youtube?.trim() || null
        },
        career_stats: {
          total_games: Number(careerStats.total_games) || 0,
          total_goals: Number(careerStats.total_goals) || 0,
          total_assists: Number(careerStats.total_assists) || 0,
          yellow_cards: Number(careerStats.yellow_cards) || 0,
          red_cards: Number(careerStats.red_cards) || 0
        },
        achievements_data: {
          medals: Array.isArray(achievements.medals) ? achievements.medals : [],
          championships: Array.isArray(achievements.championships) ? achievements.championships : [],
          individual_awards: Array.isArray(achievements.individual_awards) ? achievements.individual_awards : []
        },
        is_public: Boolean(settings.is_public),
        is_seeking_club: Boolean(settings.is_seeking_club),
        salary_expectation: settings.salary_expectation?.trim() || null
      };
      
      await updatePortfolio(updateData);
      
      toast.success('Portfólio atualizado com sucesso!');
      onSave();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message || 'Verifique os dados e tente novamente'}`);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo clube
  const handleAddClub = async () => {
    if (!newClub.club_name || !newClub.position || !newClub.start_date) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      await addClubHistory({
        ...newClub,
        created_at: new Date().toISOString()
      });
      
      setNewClub({
        club_name: '',
        position: '',
        start_date: '',
        end_date: '',
        is_current: false,
        games_played: 0,
        goals_scored: 0,
        assists: 0
      });
    } catch (error) {
      console.error('Erro ao adicionar clube:', error);
    }
  };


  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl flex flex-col p-0"
        style={{
          maxHeight: 'calc(90vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="p-4 sm:p-6 pb-0">
          <DialogHeader>
            <DialogTitle>Editar Portfólio</DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 h-auto">
            <TabsTrigger value="basic" className="text-xs sm:text-sm py-2">Básico</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm py-2">Contato</TabsTrigger>
            <TabsTrigger value="media" className="text-xs sm:text-sm py-2">Mídia</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs sm:text-sm py-2">Estatísticas</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs sm:text-sm py-2">Conquistas</TabsTrigger>
            <TabsTrigger value="clubs" className="text-xs sm:text-sm py-2">Clubes</TabsTrigger>
          </TabsList>

          {/* Informações Básicas */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      value={basicInfo.full_name}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Posição *</Label>
                    <Select value={basicInfo.position} onValueChange={(value) => setBasicInfo(prev => ({ ...prev, position: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Goleiro">Goleiro</SelectItem>
                        <SelectItem value="Zagueiro">Zagueiro</SelectItem>
                        <SelectItem value="Lateral Direito">Lateral Direito</SelectItem>
                        <SelectItem value="Lateral Esquerdo">Lateral Esquerdo</SelectItem>
                        <SelectItem value="Volante">Volante</SelectItem>
                        <SelectItem value="Meio-campo">Meio-campo</SelectItem>
                        <SelectItem value="Meia-atacante">Meia-atacante</SelectItem>
                        <SelectItem value="Ponta Direita">Ponta Direita</SelectItem>
                        <SelectItem value="Ponta Esquerda">Ponta Esquerda</SelectItem>
                        <SelectItem value="Atacante">Atacante</SelectItem>
                        <SelectItem value="Centroavante">Centroavante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={basicInfo.age}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={basicInfo.height}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={basicInfo.weight}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferred_foot">Pé Preferido</Label>
                    <Select value={basicInfo.preferred_foot} onValueChange={(value: 'left' | 'right' | 'both') => setBasicInfo(prev => ({ ...prev, preferred_foot: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Direito</SelectItem>
                        <SelectItem value="left">Esquerdo</SelectItem>
                        <SelectItem value="both">Ambidestro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nacionalidade</Label>
                    <Input
                      id="nationality"
                      value={basicInfo.nationality}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, nationality: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={basicInfo.city}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={basicInfo.state}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="biography">Biografia</Label>
                  <Textarea
                    id="biography"
                    placeholder="Conte um pouco sobre você, sua trajetória e objetivos..."
                    value={basicInfo.biography}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, biography: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_public"
                      checked={settings.is_public}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_public: !!checked }))}
                    />
                    <Label htmlFor="is_public">Portfólio público (visível para todos)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_seeking_club"
                      checked={settings.is_seeking_club}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_seeking_club: !!checked }))}
                    />
                    <Label htmlFor="is_seeking_club">Procurando clube</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mídia - Fotos e Vídeos */}
          <TabsContent value="media" className="space-y-4">
            {/* Foto de Perfil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Foto de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {basicInfo.profile_photo && (
                  <div className="flex items-center gap-4">
                    <img 
                      src={basicInfo.profile_photo} 
                      alt="Foto de perfil atual"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setBasicInfo(prev => ({ ...prev, profile_photo: '' }))}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                )}
                
                <FileUpload
                  accept="images"
                  multiple={false}
                  maxFiles={1}
                  bucket="portfolio-photos"
                  folder="profile"
                  onUploadComplete={(urls) => {
                    if (urls[0]) {
                      setBasicInfo(prev => ({ ...prev, profile_photo: urls[0] }));
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Galeria de Fotos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Galeria de Fotos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {basicInfo.gallery_photos && basicInfo.gallery_photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {basicInfo.gallery_photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={`Foto ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          onClick={() => {
                            const newPhotos = [...(basicInfo.gallery_photos || [])];
                            newPhotos.splice(index, 1);
                            setBasicInfo(prev => ({ ...prev, gallery_photos: newPhotos }));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <FileUpload
                  accept="images"
                  multiple={true}
                  maxFiles={5}
                  bucket="portfolio-photos"
                  folder="gallery"
                  onUploadComplete={(urls) => {
                    const currentPhotos = basicInfo.gallery_photos || [];
                    const remainingSlots = 5 - currentPhotos.length;
                    const newPhotos = urls.slice(0, remainingSlots);
                    
                    setBasicInfo(prev => ({ 
                      ...prev, 
                      gallery_photos: [...currentPhotos, ...newPhotos].slice(0, 5)
                    }));
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {(basicInfo.gallery_photos || []).length}/5 fotos
                </p>
              </CardContent>
            </Card>

            {/* Vídeo de Destaque - YouTube */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Vídeo de Destaque (YouTube)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="highlight_video">Link do vídeo no YouTube</Label>
                  <Input
                    id="highlight_video"
                    type="url"
                    value={basicInfo.highlight_video}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, highlight_video: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole o link completo do seu vídeo no YouTube
                  </p>
                </div>
                
                {basicInfo.highlight_video && (() => {
                  // Extrair ID do YouTube
                  let videoId = '';
                  try {
                    const url = new URL(basicInfo.highlight_video);
                    if (url.hostname.includes('youtube.com')) {
                      videoId = url.searchParams.get('v') || '';
                    } else if (url.hostname.includes('youtu.be')) {
                      videoId = url.pathname.slice(1);
                    }
                  } catch (e) {
                    // URL inválida
                  }
                  
                  return videoId ? (
                    <div className="space-y-2">
                      <div className="aspect-video w-full rounded border overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setBasicInfo(prev => ({ ...prev, highlight_video: '' }))}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover Vídeo
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-red-500">Link inválido. Use um link do YouTube.</p>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Vídeos Melhores Momentos - YouTube */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Vídeos Melhores Momentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {basicInfo.skill_videos && basicInfo.skill_videos.length > 0 && (
                  <div className="space-y-3">
                    {basicInfo.skill_videos.map((video, index) => {
                      // Extrair ID do YouTube para preview
                      let videoId = '';
                      try {
                        const url = new URL(video);
                        if (url.hostname.includes('youtube.com')) {
                          videoId = url.searchParams.get('v') || '';
                        } else if (url.hostname.includes('youtu.be')) {
                          videoId = url.pathname.slice(1);
                        }
                      } catch (e) {
                        // URL inválida
                      }
                      
                      return (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={video}
                              onChange={(e) => {
                                const newVideos = [...(basicInfo.skill_videos || [])];
                                newVideos[index] = e.target.value;
                                setBasicInfo(prev => ({ ...prev, skill_videos: newVideos }));
                              }}
                              placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newVideos = [...(basicInfo.skill_videos || [])];
                                newVideos.splice(index, 1);
                                setBasicInfo(prev => ({ ...prev, skill_videos: newVideos }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {videoId && (
                            <div className="aspect-video w-full rounded border overflow-hidden">
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                          
                          {video && !videoId && (
                            <p className="text-xs text-red-500">Link inválido. Use um link do YouTube.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {(!basicInfo.skill_videos || basicInfo.skill_videos.length < 3) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBasicInfo(prev => ({ 
                        ...prev, 
                        skill_videos: [...(prev.skill_videos || []), '']
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Link do YouTube
                  </Button>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {(basicInfo.skill_videos || []).length}/3 vídeos • Adicione links de vídeos do YouTube mostrando seus melhores momentos
                </p>
              </CardContent>
            </Card>

            {/* Informações sobre Upload */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-800 mb-2">📤 Sistema de Upload</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Fotos:</strong> Compressão automática, máximo 10MB</li>
                  <li>• <strong>Vídeos:</strong> Máximo 100MB, formato MP4 recomendado</li>
                  <li>• <strong>Armazenamento:</strong> Seguro no Supabase Storage</li>
                  <li>• <strong>URLs:</strong> Geradas automaticamente após upload</li>
                  <li>• <strong>Acesso:</strong> Público para visualização no portfólio</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contato e Redes Sociais */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Redes Sociais</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={socialMedia.instagram}
                        onChange={(e) => setSocialMedia(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="seu_usuario"
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={socialMedia.youtube}
                        onChange={(e) => setSocialMedia(prev => ({ ...prev, youtube: e.target.value }))}
                        placeholder="seu_canal"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Carreira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_games">Jogos Totais</Label>
                    <Input
                      id="total_games"
                      type="number"
                      value={careerStats.total_games}
                      onChange={(e) => setCareerStats(prev => ({ ...prev, total_games: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_goals">Gols Totais</Label>
                    <Input
                      id="total_goals"
                      type="number"
                      value={careerStats.total_goals}
                      onChange={(e) => setCareerStats(prev => ({ ...prev, total_goals: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_assists">Assistências Totais</Label>
                    <Input
                      id="total_assists"
                      type="number"
                      value={careerStats.total_assists}
                      onChange={(e) => setCareerStats(prev => ({ ...prev, total_assists: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yellow_cards">Cartões Amarelos</Label>
                    <Input
                      id="yellow_cards"
                      type="number"
                      value={careerStats.yellow_cards}
                      onChange={(e) => setCareerStats(prev => ({ ...prev, yellow_cards: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="red_cards">Cartões Vermelhos</Label>
                    <Input
                      id="red_cards"
                      type="number"
                      value={careerStats.red_cards}
                      onChange={(e) => setCareerStats(prev => ({ ...prev, red_cards: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conquistas */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Medalhas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Medalhas e Troféus
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const newMedal: Medal = {
                          id: Date.now().toString(),
                          name: '',
                          description: '',
                          category: 'gold',
                          competition: '',
                          date_received: new Date().toISOString().split('T')[0]
                        };
                        setAchievements(prev => ({
                          ...prev,
                          medals: [...prev.medals, newMedal]
                        }));
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.medals.map((medal, index) => (
                    <div key={medal.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold">Medalha {index + 1}</h4>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            setAchievements(prev => ({
                              ...prev,
                              medals: prev.medals.filter(m => m.id !== medal.id)
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nome da Medalha</Label>
                          <Input 
                            value={medal.name}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                medals: prev.medals.map(m => 
                                  m.id === medal.id ? { ...m, name: e.target.value } : m
                                )
                              }));
                            }}
                            placeholder="Ex: Medalha de Ouro"
                          />
                        </div>
                        <div>
                          <Label>Categoria</Label>
                          <Select 
                            value={medal.category}
                            onValueChange={(value: 'gold' | 'silver' | 'bronze') => {
                              setAchievements(prev => ({
                                ...prev,
                                medals: prev.medals.map(m => 
                                  m.id === medal.id ? { ...m, category: value } : m
                                )
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gold">Ouro</SelectItem>
                              <SelectItem value="silver">Prata</SelectItem>
                              <SelectItem value="bronze">Bronze</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Competição</Label>
                          <Input 
                            value={medal.competition}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                medals: prev.medals.map(m => 
                                  m.id === medal.id ? { ...m, competition: e.target.value } : m
                                )
                              }));
                            }}
                            placeholder="Ex: Campeonato Estadual"
                          />
                        </div>
                        <div>
                          <Label>Data</Label>
                          <Input 
                            type="date"
                            value={medal.date_received}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                medals: prev.medals.map(m => 
                                  m.id === medal.id ? { ...m, date_received: e.target.value } : m
                                )
                              }));
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea 
                          value={medal.description}
                          onChange={(e) => {
                            setAchievements(prev => ({
                              ...prev,
                              medals: prev.medals.map(m => 
                                m.id === medal.id ? { ...m, description: e.target.value } : m
                              )
                            }));
                          }}
                          placeholder="Descreva a conquista..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  {achievements.medals.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma medalha adicionada. Clique no botão + para adicionar.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Campeonatos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Campeonatos
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const newChampionship: Championship = {
                          id: Date.now().toString(),
                          name: '',
                          competition: '',
                          year: new Date().getFullYear(),
                          position: 'champion',
                          club_name: ''
                        };
                        setAchievements(prev => ({
                          ...prev,
                          championships: [...prev.championships, newChampionship]
                        }));
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.championships.map((championship, index) => (
                    <div key={championship.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold">Campeonato {index + 1}</h4>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            setAchievements(prev => ({
                              ...prev,
                              championships: prev.championships.filter(c => c.id !== championship.id)
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nome do Campeonato</Label>
                          <Input 
                            value={championship.name}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                championships: prev.championships.map(c => 
                                  c.id === championship.id ? { ...c, name: e.target.value } : c
                                )
                              }));
                            }}
                            placeholder="Ex: Copa do Brasil"
                          />
                        </div>
                        <div>
                          <Label>Competição</Label>
                          <Input 
                            value={championship.competition}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                championships: prev.championships.map(c => 
                                  c.id === championship.id ? { ...c, competition: e.target.value } : c
                                )
                              }));
                            }}
                            placeholder="Ex: Nacional"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>Ano</Label>
                          <Input 
                            type="number"
                            value={championship.year}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                championships: prev.championships.map(c => 
                                  c.id === championship.id ? { ...c, year: parseInt(e.target.value) } : c
                                )
                              }));
                            }}
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                        </div>
                        <div>
                          <Label>Posição</Label>
                          <Select 
                            value={championship.position}
                            onValueChange={(value: 'champion' | 'runner_up' | 'third_place' | 'participant') => {
                              setAchievements(prev => ({
                                ...prev,
                                championships: prev.championships.map(c => 
                                  c.id === championship.id ? { ...c, position: value } : c
                                )
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="champion">Campeão</SelectItem>
                              <SelectItem value="runner_up">Vice-campeão</SelectItem>
                              <SelectItem value="third_place">3º Lugar</SelectItem>
                              <SelectItem value="participant">Participante</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Clube</Label>
                          <Input 
                            value={championship.club_name}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                championships: prev.championships.map(c => 
                                  c.id === championship.id ? { ...c, club_name: e.target.value } : c
                                )
                              }));
                            }}
                            placeholder="Nome do clube"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {achievements.championships.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum campeonato adicionado. Clique no botão + para adicionar.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Prêmios Individuais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Prêmios Individuais
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const newAward: IndividualAward = {
                          id: Date.now().toString(),
                          name: '',
                          description: '',
                          category: 'best_player',
                          competition: '',
                          year: new Date().getFullYear()
                        };
                        setAchievements(prev => ({
                          ...prev,
                          individual_awards: [...prev.individual_awards, newAward]
                        }));
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.individual_awards.map((award, index) => (
                    <div key={award.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold">Prêmio {index + 1}</h4>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            setAchievements(prev => ({
                              ...prev,
                              individual_awards: prev.individual_awards.filter(a => a.id !== award.id)
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nome do Prêmio</Label>
                          <Input 
                            value={award.name}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                individual_awards: prev.individual_awards.map(a => 
                                  a.id === award.id ? { ...a, name: e.target.value } : a
                                )
                              }));
                            }}
                            placeholder="Ex: Melhor Jogador"
                          />
                        </div>
                        <div>
                          <Label>Categoria</Label>
                          <Select 
                            value={award.category}
                            onValueChange={(value: any) => {
                              setAchievements(prev => ({
                                ...prev,
                                individual_awards: prev.individual_awards.map(a => 
                                  a.id === award.id ? { ...a, category: value } : a
                                )
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="best_player">Melhor Jogador</SelectItem>
                              <SelectItem value="top_scorer">Artilheiro</SelectItem>
                              <SelectItem value="best_goalkeeper">Melhor Goleiro</SelectItem>
                              <SelectItem value="best_defender">Melhor Defensor</SelectItem>
                              <SelectItem value="best_midfielder">Melhor Meio-campo</SelectItem>
                              <SelectItem value="best_forward">Melhor Atacante</SelectItem>
                              <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Competição</Label>
                          <Input 
                            value={award.competition}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                individual_awards: prev.individual_awards.map(a => 
                                  a.id === award.id ? { ...a, competition: e.target.value } : a
                                )
                              }));
                            }}
                            placeholder="Ex: Campeonato Estadual"
                          />
                        </div>
                        <div>
                          <Label>Ano</Label>
                          <Input 
                            type="number"
                            value={award.year}
                            onChange={(e) => {
                              setAchievements(prev => ({
                                ...prev,
                                individual_awards: prev.individual_awards.map(a => 
                                  a.id === award.id ? { ...a, year: parseInt(e.target.value) } : a
                                )
                              }));
                            }}
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea 
                          value={award.description}
                          onChange={(e) => {
                            setAchievements(prev => ({
                              ...prev,
                              individual_awards: prev.individual_awards.map(a => 
                                a.id === award.id ? { ...a, description: e.target.value } : a
                              )
                            }));
                          }}
                          placeholder="Descreva o prêmio..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  {achievements.individual_awards.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum prêmio individual adicionado. Clique no botão + para adicionar.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clubes */}
          <TabsContent value="clubs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Clube</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="club_name">Nome do Clube *</Label>
                    <Input
                      id="club_name"
                      value={newClub.club_name}
                      onChange={(e) => setNewClub(prev => ({ ...prev, club_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="club_position">Posição *</Label>
                    <Input
                      id="club_position"
                      value={newClub.position}
                      onChange={(e) => setNewClub(prev => ({ ...prev, position: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Data de Início *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newClub.start_date}
                      onChange={(e) => setNewClub(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Data de Fim</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newClub.end_date}
                      onChange={(e) => setNewClub(prev => ({ ...prev, end_date: e.target.value }))}
                      disabled={newClub.is_current}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_current"
                    checked={newClub.is_current}
                    onCheckedChange={(checked) => setNewClub(prev => ({ 
                      ...prev, 
                      is_current: !!checked,
                      end_date: checked ? '' : prev.end_date
                    }))}
                  />
                  <Label htmlFor="is_current">Clube atual</Label>
                </div>

                <Button onClick={handleAddClub} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Clube
                </Button>
              </CardContent>
            </Card>

            {/* Lista de clubes existentes */}
            {portfolio.club_history && portfolio.club_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Clubes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {portfolio.club_history.map((club) => (
                      <div key={club.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-semibold">{club.club_name}</p>
                          <p className="text-sm text-muted-foreground">{club.position}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeClubHistory(club.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          </Tabs>
        </div>

        {/* Botões de ação - fixos no rodapé com safe-area */}
        <div 
          className="flex flex-col sm:flex-row justify-end gap-2 p-4 sm:p-6 pt-4 border-t bg-background"
          style={{
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
