import { User, Settings, LogOut, Apple, TrendingUp, Dumbbell, Trophy, FileUser, Palette, BookOpen } from "lucide-react";
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
    <div className="sticky top-0 z-40 w-full bg-black/95 backdrop-blur-sm border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
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
          <DropdownMenuContent align="end" className="w-72 p-2">
            <DropdownMenuLabel className="text-lg font-semibold py-3">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="py-3 px-4 text-base">
              <User className="mr-3 h-5 w-5 text-yellow-500" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/height-projection")} className="py-3 px-4 text-base">
              <TrendingUp className="mr-3 h-5 w-5 text-yellow-500" />
              <span>Altura e Projeção</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/exercises")} className="py-3 px-4 text-base">
              <Dumbbell className="mr-3 h-5 w-5 text-yellow-500" />
              <span>Biblioteca de Exercícios</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/achievements")} className="py-3 px-4 text-base">
              <Trophy className="mr-3 h-5 w-5 text-yellow-500" />
              <span>Conquistas</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/nutrition")} className="py-3 px-4 text-base">
              <Apple className="mr-3 h-5 w-5 text-yellow-500" />
              <span>Nutrição</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/portfolio")} className="py-3 px-4 text-base">
              <FileUser className="mr-3 h-5 w-5 text-yellow-500" />
              <span>Portfólio</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/design")} className="py-3 px-4 text-base">
              <Palette className="mr-3 h-5 w-5 text-yellow-500" />
              <span>YM Design</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/tutorials")} className="py-3 px-4 text-base">
              <BookOpen className="mr-3 h-5 w-5 text-yellow-500" />
              <span>Tutoriais</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="py-3 px-4 text-base">
              <Settings className="mr-3 h-5 w-5 text-yellow-500" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="py-3 px-4 text-base">
              <LogOut className="mr-3 h-5 w-5 text-yellow-500" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
