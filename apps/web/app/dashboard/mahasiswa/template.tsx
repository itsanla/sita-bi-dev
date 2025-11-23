import { ReactNode } from 'react';

/**
 * Template untuk instant transitions
 * Template tidak reset state saat navigation
 */
export default function MahasiswaTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen transition-opacity duration-200">
      {children}
    </div>
  );
}
