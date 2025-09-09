import { Search, Users, AlertCircle } from "lucide-react";

export default function EmptyState({ 
  title = "No users found", 
  subtitle, 
  icon = "users",
  action 
}) {
  const getIcon = () => {
    switch (icon) {
      case "search":
        return <Search className="w-16 h-16 text-muted" />;
      case "alert":
        return <AlertCircle className="w-16 h-16 text-muted" />;
      default:
        return <Users className="w-16 h-16 text-gray-300" />;
    }
  };

  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          {getIcon()}
        </div>
        
        <h3 className="text-xl font-semibold text-app mb-2">{title}</h3>
        
        {subtitle && (
          <p className="text-gray-500 mb-6 leading-relaxed">{subtitle}</p>
        )}
        
        {action && (
          <div className="mt-6">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
