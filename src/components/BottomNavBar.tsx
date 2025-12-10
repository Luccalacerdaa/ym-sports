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
      className="fixed left-0 right-0 z-[999] bg-black border-t border-border safe-area-bottom fixed-bottom-bar bottom-nav-exception"
      style={{ 
        position: 'fixed',
        bottom: '0px',
        width: '100%',
        zIndex: 9999,
        transform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      <nav className="flex justify-around items-center h-28 sm:h-32 max-w-screen-xl mx-auto px-2 py-4" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors gap-1 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[11px] font-medium whitespace-nowrap leading-tight">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
