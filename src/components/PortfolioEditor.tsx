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
import { Slider } from "@/components/ui/slider";
import { PlayerPortfolio, ClubHistory } from "@/types/portfolio";
import { usePortfolio } from "@/hooks/usePortfolio";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";

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
    twitter: portfolio.social_media?.twitter || '',
    youtube: portfolio.social_media?.youtube || ''
  });

  const [careerStats, setCareerStats] = useState(portfolio.career_stats || {
    total_games: 0,
    total_goals: 0,
    total_assists: 0,
    yellow_cards: 0,
    red_cards: 0
  });

  const [skills, setSkills] = useState(portfolio.skills || {
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
      await updatePortfolio({
        ...basicInfo,
        social_media: socialMedia,
        career_stats: careerStats,
        skills: skills,
        ...settings
      });
      
      toast.success('Portfólio atualizado com sucesso!');
      onSave();
    } catch (error) {
      console.error('Erro ao salvar:', error);
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

  // Renderizar seção de habilidades
  const renderSkillSlider = (skillKey: keyof typeof skills, label: string) => (
    <div key={skillKey} className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm text-muted-foreground">{skills[skillKey]}/10</span>
      </div>
      <Slider
        value={[skills[skillKey]]}
        onValueChange={([value]) => setSkills(prev => ({ ...prev, [skillKey]: value }))}
        max={10}
        min={1}
        step={1}
        className="w-full"
      />
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Portfólio</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="skills">Habilidades</TabsTrigger>
            <TabsTrigger value="clubs">Clubes</TabsTrigger>
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
            <Card>
              <CardHeader>
                <CardTitle>Fotos e Vídeos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profile_photo">Foto de Perfil (URL)</Label>
                  <Input
                    id="profile_photo"
                    value={basicInfo.profile_photo || ''}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, profile_photo: e.target.value }))}
                    placeholder="https://exemplo.com/foto-perfil.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="highlight_video">Vídeo de Destaque (URL)</Label>
                  <Input
                    id="highlight_video"
                    value={basicInfo.highlight_video || ''}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, highlight_video: e.target.value }))}
                    placeholder="https://exemplo.com/video-destaque.mp4"
                  />
                </div>

                <div>
                  <Label htmlFor="gallery_photos">Galeria de Fotos (URLs separadas por vírgula)</Label>
                  <Textarea
                    id="gallery_photos"
                    value={basicInfo.gallery_photos?.join(', ') || ''}
                    onChange={(e) => setBasicInfo(prev => ({ 
                      ...prev, 
                      gallery_photos: e.target.value.split(',').map(url => url.trim()).filter(url => url)
                    }))}
                    placeholder="https://exemplo.com/foto1.jpg, https://exemplo.com/foto2.jpg"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole as URLs das fotos separadas por vírgula
                  </p>
                </div>

                <div>
                  <Label htmlFor="skill_videos">Vídeos de Habilidades (URLs separadas por vírgula)</Label>
                  <Textarea
                    id="skill_videos"
                    value={basicInfo.skill_videos?.join(', ') || ''}
                    onChange={(e) => setBasicInfo(prev => ({ 
                      ...prev, 
                      skill_videos: e.target.value.split(',').map(url => url.trim()).filter(url => url)
                    }))}
                    placeholder="https://exemplo.com/video1.mp4, https://exemplo.com/video2.mp4"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole as URLs dos vídeos separadas por vírgula
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">💡 Dicas para Mídia</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Use serviços como Imgur, Google Drive ou Dropbox para hospedar fotos</li>
                    <li>• Para vídeos, use YouTube, Vimeo ou Google Drive</li>
                    <li>• Certifique-se de que os links são públicos e acessíveis</li>
                    <li>• Fotos devem estar em formato JPG, PNG ou WebP</li>
                    <li>• Vídeos devem estar em formato MP4 para melhor compatibilidade</li>
                  </ul>
                </div>
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
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={socialMedia.twitter}
                        onChange={(e) => setSocialMedia(prev => ({ ...prev, twitter: e.target.value }))}
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

          {/* Habilidades */}
          <TabsContent value="skills" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Habilidades Técnicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderSkillSlider('ball_control', 'Controle de Bola')}
                  {renderSkillSlider('passing', 'Passe')}
                  {renderSkillSlider('shooting', 'Finalização')}
                  {renderSkillSlider('dribbling', 'Drible')}
                  {renderSkillSlider('crossing', 'Cruzamento')}
                  {renderSkillSlider('finishing', 'Definição')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Habilidades Físicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderSkillSlider('speed', 'Velocidade')}
                  {renderSkillSlider('acceleration', 'Aceleração')}
                  {renderSkillSlider('strength', 'Força')}
                  {renderSkillSlider('jumping', 'Salto')}
                  {renderSkillSlider('stamina', 'Resistência')}
                  {renderSkillSlider('agility', 'Agilidade')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Habilidades Mentais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderSkillSlider('vision', 'Visão de Jogo')}
                  {renderSkillSlider('decision_making', 'Tomada de Decisão')}
                  {renderSkillSlider('concentration', 'Concentração')}
                  {renderSkillSlider('leadership', 'Liderança')}
                  {renderSkillSlider('teamwork', 'Trabalho em Equipe')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Habilidades Defensivas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderSkillSlider('marking', 'Marcação')}
                  {renderSkillSlider('tackling', 'Desarme')}
                  {renderSkillSlider('interceptions', 'Interceptação')}
                  {renderSkillSlider('heading', 'Jogo Aéreo')}
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

        {/* Botões de ação */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
