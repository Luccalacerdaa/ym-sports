import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  X
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "João Silva",
    age: "22",
    height: "1.78",
    weight: "75",
    position: "Atacante",
    currentTeam: "FC São Paulo",
    previousTeams: ["Juventus SP", "Palmeiras Sub-20"],
    achievements: [
      "Campeão Paulista Sub-20 (2022)",
      "Artilheiro da Copa Regional (2023)",
      "Melhor Jogador do Mês - Agosto 2023"
    ],
    bio: "Apaixonado por futebol desde criança. Busco sempre evoluir e alcançar novos objetivos.",
    avatar: "/placeholder.svg"
  });

  const handleSave = () => {
    // Aqui salvaria no backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
          <CardContent className="relative pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {profile.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="icon" 
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                {isEditing ? (
                  <Input 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="text-2xl font-bold max-w-md"
                  />
                ) : (
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {profile.position}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.currentTeam}
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
                  <Button onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Editar Perfil
                  </Button>
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
                      value={profile.age}
                      onChange={(e) => setProfile({...profile, age: e.target.value})}
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{profile.age} anos</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Posição
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={profile.position}
                      onChange={(e) => setProfile({...profile, position: e.target.value})}
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{profile.position}</p>
                  )}
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
                        step="0.01"
                        value={profile.height}
                        onChange={(e) => setProfile({...profile, height: e.target.value})}
                      />
                      <span className="text-sm text-muted-foreground">m</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-primary">{profile.height}m</p>
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
                        value={profile.weight}
                        onChange={(e) => setProfile({...profile, weight: e.target.value})}
                      />
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-primary">{profile.weight}kg</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Time Atual
                </Label>
                {isEditing ? (
                  <Input 
                    value={profile.currentTeam}
                    onChange={(e) => setProfile({...profile, currentTeam: e.target.value})}
                  />
                ) : (
                  <p className="text-lg font-semibold">{profile.currentTeam}</p>
                )}
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
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={6}
                  placeholder="Conte um pouco sobre você..."
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Times Anteriores */}
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Times Anteriores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.previousTeams.map((team, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-medium">{team}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conquistas */}
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Conquistas e Títulos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Trophy className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium leading-relaxed">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
