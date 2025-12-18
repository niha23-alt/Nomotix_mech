import { Calendar, AlertTriangle, Wrench, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Calendar, label: "Requests", path: "/bookings" },
  { icon: AlertTriangle, label: "Emergency", path: "/emergency" },
  { icon: Wrench, label: "Active", path: "/active" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 text-muted-foreground hover:text-primary"
            activeClassName="text-primary bg-primary/10"
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
