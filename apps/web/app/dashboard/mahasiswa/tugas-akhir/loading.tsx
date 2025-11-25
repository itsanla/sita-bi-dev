import SkeletonCard from '@/app/components/loading/SkeletonCard';

export default function TugasAkhirLoading() {
  return (
    <div className="space-y-8 p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
      </div>

      <div className="grid gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
