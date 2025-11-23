import {
  PageHeaderSkeleton,
  CardGridSkeleton,
  TableSkeleton,
} from '@/app/components/Suspense/StreamingSkeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={2} />
      <TableSkeleton rows={4} />
    </div>
  );
}
