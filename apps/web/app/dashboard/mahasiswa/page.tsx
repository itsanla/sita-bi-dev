'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DashboardCardSkeleton } from '../../components/Suspense/LoadingFallback';

// Dynamically import client components
const WelcomeSection = dynamic(() => import('./components/WelcomeSection'), {
  ssr: false,
});

const DashboardStats = dynamic(() => import('./components/DashboardStats'));
const SubmissionChart = dynamic(() => import('./components/SubmissionChart'));
const ProgressTimeline = dynamic(() => import('./components/ProgressTimeline'));
const QuickActions = dynamic(() => import('./components/QuickActions'));
const UpcomingSchedule = dynamic(() => import('./components/UpcomingSchedule'));

export default function MahasiswaDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = localStorage.getItem('userId') || localStorage.getItem('token');
        
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3002/api/dashboard/mahasiswa/stats', {
          headers: {
            'x-user-id': userId,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleStatsUpdate = (newStats: any) => {
    setStats(newStats);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <Suspense
        fallback={
          <div className="h-32 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
        }
      >
        <WelcomeSection />
      </Suspense>

      {/* Stats Cards */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <DashboardCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DashboardStats stats={stats} loading={loading} />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Chart */}
          <Suspense fallback={<DashboardCardSkeleton />}>
            <SubmissionChart stats={stats} loading={loading} />
          </Suspense>

          {/* Progress Timeline */}
          <Suspense fallback={<DashboardCardSkeleton />}>
            <ProgressTimeline stats={stats} loading={loading} />
          </Suspense>

          {/* System Statistics */}
          <Suspense fallback={<DashboardCardSkeleton />}>
            <QuickActions />
          </Suspense>
        </div>

        {/* Right Column - Schedule only */}
        <div className="space-y-6">
          {/* Upcoming Schedule */}
          <Suspense fallback={<DashboardCardSkeleton />}>
            <UpcomingSchedule />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
