import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { ImageCropper } from "@/components/ImageCropper";
import { toast } from "sonner";
import { 
  User, 
  Ruler, 
  Weight, 
  MapPin, 
  Trophy, 
  Shield, 
  Calendar,
  Edit2,
  Save,
  X,
  LogOut,
  Camera,
  Phone,
  Building
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { profile, loading, error, updateProfile, createProfile } = useProfile();
  const { uploadPhoto, uploading: photoUploading } = usePhotoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado local para edição
  const [editData, setEditData] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    bio: "",
    current_team: "",
    position: "",
    phone: "",
    location: "",
    previous_teams: "",
    championships_won: "",
  });

  // Atualizar dados de edição quando o perfil carregar
  useEffect(() => {
    if (profile) {
      setEditData({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        bio: profile.bio || "",
        current_team: profile.current_team || "",
        position: profile.position || "",
        phone: profile.phone || "",
        location: profile.location || "",
        previous_teams: profile.previous_teams?.join(", ") || "",
        championships_won: profile.championships_won?.join(", ") || "",
      });
    }
  }, [profile]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Criar URL para a imagem selecionada
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsCropperOpen(true);
  };
  
  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      console.log("Recebendo imagem recortada:", croppedImageUrl.substring(0, 50) + "...");
      
      // Converter a URL de dados para um Blob
      // Usamos dataURLtoBlob em vez de fetch para garantir que a URL de dados seja processada corretamente
      const blob = dataURLtoBlob(croppedImageUrl);
      
      // Criar um arquivo a partir do Blob
      const file = new File([blob], "profile-image.jpg", { type: "image/jpeg" });
      console.log("Arquivo criado:", file.name, file.type, file.size);
      
      // Fazer upload do arquivo
      const photoUrl = await uploadPhoto(file);
      console.log("Upload concluído, URL:", photoUrl);
      
      if (photoUrl) {
        // Adicionar timestamp para evitar cache
        const uniqueUrl = `${photoUrl}?t=${new Date().getTime()}`;
        
        // Atualizar o perfil com a nova foto
        await updateProfile({ avatar_url: uniqueUrl });
        
        // Forçar atualização da página para mostrar a nova foto
        window.location.reload();
        
        toast.success("Foto atualizada com sucesso!");
      } else {
        throw new Error("Não foi possível obter a URL da foto após o upload");
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.error("Erro ao processar imagem");
    } finally {
      // Limpar a URL criada para evitar vazamentos de memória
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
      setSelectedImage(null);
    }
  };
  
  // Função auxiliar para converter URL de dados para Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    // Separar o tipo MIME e os dados
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  };

  const handleSave = async () => {
    try {
      const updates = {
        name: editData.name,
        age: editData.age ? parseInt(editData.age) : undefined,
        height: editData.height ? parseInt(editData.height) : undefined,
        weight: editData.weight ? parseInt(editData.weight) : undefined,
        bio: editData.bio,
        current_team: editData.current_team,
        position: editData.position,
        phone: editData.phone,
        location: editData.location,
        previous_teams: editData.previous_teams ? editData.previous_teams.split(", ").filter(t => t.trim()) : [],
        championships_won: editData.championships_won ? editData.championships_won.split(", ").filter(c => c.trim()) : [],
      };

      const { error } = await updateProfile(updates);
      
      if (error) {
        toast.error("Erro ao salvar perfil: " + error.message);
      } else {
        toast.success("Perfil atualizado com sucesso!");
        setIsEditing(false);
      }
    } catch (err) {
      toast.error("Erro inesperado ao salvar perfil");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditData({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        bio: profile.bio || "",
        current_team: profile.current_team || "",
        position: profile.position || "",
        phone: profile.phone || "",
        location: profile.location || "",
        previous_teams: profile.previous_teams?.join(", ") || "",
        championships_won: profile.championships_won?.join(", ") || "",
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar perfil: {error}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Image Cropper */}
        {selectedImage && (
          <ImageCropper
            open={isCropperOpen}
            onClose={() => {
              setIsCropperOpen(false);
              if (selectedImage) {
                URL.revokeObjectURL(selectedImage);
              }
              setSelectedImage(null);
            }}
            onCropComplete={handleCropComplete}
            imageSrc={selectedImage}
          />
        )}
        
        {/* Header Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
          <CardContent className="relative pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.name || "Usuário"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {(profile?.name || user?.email || "U").split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                >
                  {photoUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                {isEditing ? (
                  <Input 
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="text-2xl font-bold max-w-md"
                    placeholder="Seu nome"
                  />
                ) : (
                  <h1 className="text-3xl font-bold">{profile?.name || "Usuário"}</h1>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {profile?.age ? `${profile.age} anos` : "Idade não informada"}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {user?.email || "Email não disponível"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="gap-2">
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                      <Edit2 className="h-4 w-4" />
                      Editar Perfil
                    </Button>
                    <Button onClick={handleLogout} variant="outline" className="gap-2">
                      <LogOut className="h-4 w-4" />
                      Sair
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Idade
                  </Label>
                  {isEditing ? (
                    <Input 
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData({...editData, age: e.target.value})}
                      placeholder="Idade"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{profile?.age || "Não informado"} anos</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-lg font-semibold break-words break-all">{user?.email || "Email não disponível"}</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    Altura
                  </Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        value={editData.height}
                        onChange={(e) => setEditData({...editData, height: e.target.value})}
                        placeholder="Altura em cm"
                      />
                      <span className="text-sm text-muted-foreground">cm</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-primary">{profile?.height || "Não informado"}cm</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Weight className="h-4 w-4" />
                    Peso
                  </Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        value={editData.weight}
                        onChange={(e) => setEditData({...editData, weight: e.target.value})}
                        placeholder="Peso em kg"
                      />
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-primary">{profile?.weight || "Não informado"}kg</p>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle>Sobre Mim</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  rows={6}
                  placeholder="Conte um pouco sobre você..."
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {profile?.bio || "Nenhuma biografia adicionada ainda. Clique em 'Editar Perfil' para adicionar uma."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Informações do Futebol */}
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Carreira no Futebol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    Time Atual
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={editData.current_team}
                      onChange={(e) => setEditData({...editData, current_team: e.target.value})}
                      placeholder="Nome do seu time atual"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{profile?.current_team || "Não informado"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    Posição
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={editData.position}
                      onChange={(e) => setEditData({...editData, position: e.target.value})}
                      placeholder="Sua posição no campo"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{profile?.position || "Não informado"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    Times Anteriores
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={editData.previous_teams}
                      onChange={(e) => setEditData({...editData, previous_teams: e.target.value})}
                      placeholder="Separados por vírgula"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.previous_teams && profile.previous_teams.length > 0 ? (
                        profile.previous_teams.map((team, index) => (
                          <Badge key={index} variant="secondary">{team}</Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Nenhum time anterior</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    Campeonatos Ganhos
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={editData.championships_won}
                      onChange={(e) => setEditData({...editData, championships_won: e.target.value})}
                      placeholder="Separados por vírgula"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.championships_won && profile.championships_won.length > 0 ? (
                        profile.championships_won.map((championship, index) => (
                          <Badge key={index} variant="default" className="bg-yellow-600">
                            {championship}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Nenhum campeonato</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      placeholder="Seu telefone"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{profile?.phone || "Não informado"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Localização
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      placeholder="Sua cidade/estado"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{profile?.location || "Não informado"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Conta */}
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg font-semibold break-words break-all">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Membro desde</Label>
                <p className="text-lg font-semibold">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Não disponível'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
