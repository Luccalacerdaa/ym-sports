import { User, Settings, LogOut, Apple, TrendingUp, Dumbbell, Trophy, FileUser, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopNavBar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Usuário';
  const avatarInitials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="sticky top-0 z-40 w-full bg-black/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">YM SPORTS</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-9 w-9 border-2 border-primary/50 hover:border-primary transition-colors">
              <AvatarImage src={profile?.avatar_url} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/height-projection")}>
              <TrendingUp className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Altura e Projeção</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/exercises")}>
              <Dumbbell className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Biblioteca de Exercícios</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/achievements")}>
              <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Conquistas</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/nutrition")}>
              <Apple className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Nutrição</span>
            </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard/portfolio")}>
          <FileUser className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Portfólio</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard/design")}>
          <Palette className="mr-2 h-4 w-4 text-yellow-500" />
          <span>YM Design</span>
        </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
