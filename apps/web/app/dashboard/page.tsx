'use client';

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardRedirector() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // DEBUG: Log the user object to see its actual structure in the browser console
    console.log('User object from AuthContext:', user);

    if (!loading && user) {
      // Defensive check to prevent crash if role property is missing
      if (user.roles && user.roles.length > 0) {
        const role = user.roles[0].name;
        if (role === 'admin') {
          router.replace('/dashboard/admin');
        } else if (role === 'dosen') {
          router.replace('/dashboard/dosen');
        } else if (role === 'mahasiswa') {
          router.replace('/dashboard/mahasiswa');
        } else {
          // Fallback for users with no recognized role
          console.error('User has no recognized role, logging out.');
          router.replace('/login');
        }
      } else {
        // Handle case where user object exists but has no role
        console.error(
          'User object is missing role property, logging out.',
          user,
        );
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return <div>Loading...</div>; // Or a proper loading spinner
}
