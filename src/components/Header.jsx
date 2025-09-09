export default function Header({ left, right, title = "Admin · Users" }) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-base" style={{ "--header-h": "64px" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {left}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
          </div>

          {/* Center Section - Mobile Title */}
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-app">{title}</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {right}
          </div>
        </div>
      </div>
    </header>
  );
}
