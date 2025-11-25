export default function MahasiswaDashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        {/* Placeholder for "Selamat Datang, [Nama]!" */}
        <div className="h-9 w-3/5 rounded-lg bg-gray-200"></div>
        {/* Placeholder for the description paragraph */}
        <div className="mt-3 h-4 w-4/5 rounded-lg bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create 3 skeleton cards */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              {/* Icon placeholder */}
              <div className="bg-gray-200 p-3 rounded-full h-12 w-12"></div>
              {/* Title placeholder */}
              <div className="h-6 w-3/4 rounded-lg bg-gray-200"></div>
            </div>
            {/* Description placeholder */}
            <div className="mt-4 h-4 w-full rounded-lg bg-gray-200"></div>
            <div className="mt-2 h-4 w-2/3 rounded-lg bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
