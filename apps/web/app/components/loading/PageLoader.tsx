export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-red-200 rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600 rounded-full animate-spin border-t-transparent" />
        </div>
        <p className="text-gray-600 font-medium">Memuat...</p>
      </div>
    </div>
  );
}
