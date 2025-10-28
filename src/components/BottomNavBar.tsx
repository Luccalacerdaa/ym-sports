import { Home, Calendar, Trophy, Dumbbell } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { title: "Calendário", url: "/dashboard/calendar", icon: Calendar },
  { title: "Ranking", url: "/dashboard/ranking", icon: Trophy },
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Treinos", url: "/dashboard/training", icon: Dumbbell },
];

export function BottomNavBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black border-t border-border safe-area-bottom">
      <nav className="flex justify-around items-center h-16 sm:h-20 max-w-screen-xl mx-auto">
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
