export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-100 p-4 border-b">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-300 rounded flex-1" />
            <div className="h-4 bg-gray-300 rounded flex-1" />
            <div className="h-4 bg-gray-300 rounded flex-1" />
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border-b">
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
