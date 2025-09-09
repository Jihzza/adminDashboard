import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function BackHomeButton({ className = "", showArrow = false }) {
  const Icon = showArrow ? ArrowLeft : Home;

  return (
    <Link
      to="/"
      className={[
        "group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200",
        "surface border border-base text-app hover:shadow-md hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-2 ring-brand",
        className,
      ].join(" ")}
      aria-label="Go to main page"
      title="Go to main page"
    >
      <Icon className="w-4 h-4 text-muted group-hover:scale-110 transition-transform" />
      <span className="hidden sm:inline text-app">Home</span>
    </Link>
  );
}
