import { Suspense, ReactNode } from 'react';
import { PageHeaderSkeleton } from '../Suspense/StreamingSkeleton';

interface StreamingPageProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component untuk instant page transitions
 * Menggunakan Suspense untuk streaming UI
 */
export function StreamingPage({ children, fallback }: StreamingPageProps) {
  return (
    <Suspense fallback={fallback || <PageHeaderSkeleton />}>
      {children}
    </Suspense>
  );
}

/**
 * Layout untuk halaman dengan header + content
 */
interface PageLayoutProps {
  header: ReactNode;
  content: ReactNode;
  headerFallback?: ReactNode;
  contentFallback?: ReactNode;
}

export function StreamingPageLayout({
  header,
  content,
  headerFallback,
  contentFallback,
}: PageLayoutProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={headerFallback || <PageHeaderSkeleton />}>
        {header}
      </Suspense>

      <Suspense
        fallback={
          contentFallback || (
            <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />
          )
        }
      >
        {content}
      </Suspense>
    </div>
  );
}
