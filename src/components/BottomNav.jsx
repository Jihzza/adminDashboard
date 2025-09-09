import { NavLink } from "react-router-dom";
import { Bug, Star, Calendar as CalendarIcon, Presentation, Home } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Users", color: "blue" },
  { to: "/bugs", icon: Bug, label: "Bugs", color: "red" },
  { to: "/testimonials", icon: Star, label: "Reviews", color: "yellow" },
  { to: "/calendar", icon: CalendarIcon, label: "Calendar", color: "green" },
  { to: "/pitchdecks", icon: Presentation, label: "Pitch Decks", color: "purple" }
];

export default function BottomNav() {
  const getItemStyles = (isActive, color) => {
    const baseStyles = "group relative flex flex-col items-center justify-center gap-1 px-4 py-3 text-xs font-medium transition-all duration-200 h-14";

    if (isActive) {
      switch (color) {
        case 'red':
          return `${baseStyles} text-red-400 after:absolute after:top-0 after:inset-x-6 after:h-0.5 after:rounded-full after:bg-current`;
        case 'yellow':
          return `${baseStyles} text-yellow-400 after:absolute after:top-0 after:inset-x-6 after:h-0.5 after:rounded-full after:bg-current`;
        case 'green':
          return `${baseStyles} text-green-400 after:absolute after:top-0 after:inset-x-6 after:h-0.5 after:rounded-full after:bg-current`;
        case 'purple':
          return `${baseStyles} text-purple-400 after:absolute after:top-0 after:inset-x-6 after:h-0.5 after:rounded-full after:bg-current`;
        default:
          return `${baseStyles} text-blue-400 after:absolute after:top-0 after:inset-x-6 after:h-0.5 after:rounded-full after:bg-current`;
      }
    }

    return `${baseStyles} text-muted hover:text-app`;
  };

  const getIconStyles = (isActive, color) => {
    const baseStyles = "w-5 h-5 transition-all duration-200";

    if (isActive) {
      switch (color) {
        case 'red':
          return `${baseStyles} scale-110 text-red-400`;
        case 'yellow':
          return `${baseStyles} scale-110 text-yellow-400`;
        case 'green':
          return `${baseStyles} scale-110 text-green-400`;
        case 'purple':
          return `${baseStyles} scale-110 text-purple-400`;
        default:
          return `${baseStyles} scale-110 text-blue-400`;
      }
    }

    return `${baseStyles} group-hover:scale-105 text-muted group-hover:text-app`;
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 glass border-t border-base z-50" role="navigation" aria-label="Primary" style={{ "--nav-h": "56px" }}>
      <div className="mx-auto max-w-7xl bg-transparent">
        <ul className="grid grid-cols-5">
          {navItems.map(({ to, icon: Icon, label, color }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => getItemStyles(isActive, color)}
                end={to === "/"}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={getIconStyles(isActive, color)} />
                    <span className="truncate text-app">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
