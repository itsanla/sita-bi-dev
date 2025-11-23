import {
  PageHeaderSkeleton,
  TableSkeleton,
} from '@/app/components/Suspense/StreamingSkeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} />
    </div>
  );
}
