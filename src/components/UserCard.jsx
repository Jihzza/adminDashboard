import { Link } from "react-router-dom";
import { Mail, Calendar, ExternalLink } from "lucide-react";

export default function UserCard({ user, style }) {
  const to = `/u/${String(user.__source).toLowerCase()}/${user.id}`;

  const getSourceLabel = (s) => (s ? String(s) : "Unknown");

  return (
    <li className="group animate-slide-up" style={style}>
      <Link
        to={to}
        className="card p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 block"
      >
        <div className="flex items-start gap-4">
          {/* Avatar with Status */}
          <div className="relative">
            <img
              src={
                user.avatar_url ||
                `https://api.dicebear.com/9.x/identicon/svg?seed=${user.username || user.id}`
              }
              alt={user.full_name || "User"}
              className="w-14 h-14 rounded-2xl object-cover bg-gradient-to-br from-brand-50 to-white ring-2 ring-white dark:ring-transparent shadow-sm"
            />
            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[var(--surface)]"></div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-app truncate group-hover:text-brand-600 transition-colors">
                  {user.full_name || "Unknown User"}
                </h3>
                <p className="text-sm text-muted truncate">@{user.username || "unknown"}</p>
              </div>

              {/* Source Badge */}
              <span className="badge">{getSourceLabel(user.__source)}</span>
            </div>

            {/* Email */}
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-muted mb-2">
                <Mail className="w-4 h-4" />
                <span className="truncate">{user.email}</span>
              </div>
            )}

            {/* Last Updated */}
            {user.updated_at && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Calendar className="w-3 h-3" />
                <span>Updated {new Date(user.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* External Link Icon */}
          <ExternalLink className="w-4 h-4 text-muted group-hover:text-brand-500 transition-colors flex-shrink-0" />
        </div>
      </Link>
    </li>
  );
}
