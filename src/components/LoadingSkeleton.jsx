export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card p-6 animate-pulse">
          <div className="flex items-start gap-4">
            {/* Avatar skeleton */}
            <div className="w-14 h-14 rounded-2xl bg-black/10 dark:bg-white/10"></div>
            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 rounded w-32 bg-black/10 dark:bg-white/10"></div>
                  <div className="h-3 rounded w-24 bg-black/10 dark:bg-white/10"></div>
                </div>
                <div className="h-6 rounded-full w-16 bg-black/10 dark:bg-white/10"></div>
              </div>

              <div className="space-y-2">
                <div className="h-3 rounded w-full bg-black/10 dark:bg-white/10"></div>
                <div className="h-3 rounded w-20 bg-black/10 dark:bg-white/10"></div>
              </div>
            </div>

            {/* External link skeleton */}
            <div className="w-4 h-4 rounded bg-black/10 dark:bg-white/10"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
