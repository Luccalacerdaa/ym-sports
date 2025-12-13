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
      <nav 
        className="flex justify-around items-start h-24 sm:h-28 max-w-screen-xl mx-auto px-2 pt-3"
        style={{ paddingBottom: 'max(28px, calc(env(safe-area-inset-bottom) + 8px))' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-start flex-1 h-full transition-colors gap-1.5 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-7 w-7" />
            <span className="text-[10px] font-medium whitespace-nowrap leading-none">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
