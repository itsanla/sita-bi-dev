'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if loading is finished and there is no user
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While loading or before the redirect happens, show a loading indicator.
  if (loading || !user) {
    return <div>Loading...</div>;
  }

  // If the user is authenticated, render the actual dashboard content.
  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
