import dynamic, { DynamicOptionsLoadingProps } from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

/**
 * Utility untuk lazy load components dengan loading state
 * Mengurangi bundle size dan mempercepat initial load
 */

interface DynamicOptions {
  loading?: (_loadingProps: DynamicOptionsLoadingProps) => ReactNode;
  ssr?: boolean;
}

const DefaultLoader = () => {
  return <div className="animate-pulse bg-gray-200 h-32 rounded" />;
};

/**
 * Load component secara dynamic dengan skeleton loader
 */
export function lazyLoad<P = Record<string, never>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: DynamicOptions = {},
) {
  return dynamic(importFn, {
    loading: options.loading || DefaultLoader,
    ssr: options.ssr !== false, // SSR by default
  });
}

/**
 * Load component tanpa SSR (client-side only)
 * Gunakan untuk components yang depend on browser APIs
 */
export function lazyLoadClient<P = Record<string, never>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: DynamicOptions = {},
) {
  return dynamic(importFn, {
    loading: options.loading || DefaultLoader,
    ssr: false,
  });
}
