import { NavLink, useSearchParams } from "react-router-dom";
import { Home, Users, Bot, Calendar as CalendarIcon, User as UserIcon } from "lucide-react";

const itemBase = "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs";
const active = "text-white";
const inactive = "text-white/60";

export default function BottomNav() {
  // preserve ?source=dagalow|perspectiv when navigating
  const [sp] = useSearchParams();
  const source = sp.get("source");
  const w = (path) => (source ? `${path}?source=${source}` : path);

  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-white/10 bg-black/60 backdrop-blur z-50">
      <ul className="mx-auto max-w-6xl grid grid-cols-5">
        <li>
          <NavLink to="/" className={({ isActive }) => `${itemBase} ${isActive ? active : inactive}`} end>
            <Home className="w-6 h-6" />
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to={w("/users")} className={({ isActive }) => `${itemBase} ${isActive ? active : inactive}`} end>
            <Users className="w-6 h-6" />
            <span>Users</span>
          </NavLink>
        </li>
        <li>
          <NavLink to={w("/chatbot")} className={({ isActive }) => `${itemBase} ${isActive ? active : inactive}`} end>
            <Bot className="w-6 h-6" />
            <span>Chatbot</span>
          </NavLink>
        </li>
        <li>
          <NavLink to={w("/calendar")} className={({ isActive }) => `${itemBase} ${isActive ? active : inactive}`} end>
            <CalendarIcon className="w-6 h-6" />
            <span>Calendar</span>
          </NavLink>
        </li>
        <li>
          <NavLink to={w("/profile")} className={({ isActive }) => `${itemBase} ${isActive ? active : inactive}`} end>
            <UserIcon className="w-6 h-6" />
            <span>Profile</span>
          </NavLink>
        </li>
      </ul>
      {/* iOS safe-area padding to stay above the home bar */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
