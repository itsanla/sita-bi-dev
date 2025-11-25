export function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 animate-pulse">
      <div className="h-64 bg-gray-200 rounded-2xl mb-4" />
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-8 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        <div className="h-8 bg-gray-200 rounded-full w-24 mx-auto" />
      </div>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
      <div className="flex items-center gap-4 mb-3">
        <div className="bg-gray-200 p-3 rounded-full w-12 h-12" />
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-full" />
    </div>
  );
}
