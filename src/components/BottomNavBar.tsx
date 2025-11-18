import { Home, Calendar, Trophy, Dumbbell, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { title: "Calendário", url: "/dashboard/calendar", icon: Calendar },
  { title: "Ranking", url: "/dashboard/ranking", icon: Trophy },
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Treinos", url: "/dashboard/training", icon: Dumbbell },
  { title: "Motivação", url: "/dashboard/motivational", icon: Zap },
];

export function BottomNavBar() {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[999] bg-black border-t border-border safe-area-bottom fixed-bottom-bar bottom-nav-exception"
      style={{ 
        position: 'fixed',
        bottom: 0,
        width: '100%',
        zIndex: 9999,
        transform: 'translateZ(0)', // Força aceleração de hardware
        willChange: 'transform', // Melhora performance
        backfaceVisibility: 'hidden' // Evita problemas de renderização
      }}
    >
      <nav className="flex justify-around items-center h-20 sm:h-24 max-w-screen-xl mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-7 w-7 mb-1" />
            <span className="text-sm font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
