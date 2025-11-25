'use client';

import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

interface TimelineItem {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
  isError?: boolean;
}

interface ProgressTimelineProps {
  stats: any;
  loading: boolean;
}

export default function ProgressTimeline({
  stats,
  loading,
}: ProgressTimelineProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate progress and steps based on real stats
  // We assume stats contains relevant data (needs to be updated in backend or fetched here)
  // For now using safe accessors
  const statusTA = stats?.tugasAkhir?.status; // e.g., 'DISETUJUI', 'BIMBINGAN', etc.
  const bimbinganCount = stats?.bimbingan?.confirmed || 0;
  const minBimbingan = 9;

  // Logic to determine steps
  const steps: TimelineItem[] = [
    {
      title: 'Pengajuan Judul',
      description: statusTA === 'DISETUJUI' || ['BIMBINGAN', 'LULUS_TANPA_REVISI', 'LULUS_DENGAN_REVISI', 'SELESAI'].includes(statusTA)
        ? `Judul disetujui`
        : 'Menunggu persetujuan judul',
      status: ['DISETUJUI', 'BIMBINGAN', 'LULUS_TANPA_REVISI', 'LULUS_DENGAN_REVISI', 'SELESAI'].includes(statusTA) ? 'completed' : 'current',
      date: stats?.tugasAkhir?.tanggal_disetujui, // Assuming this exists
    },
    {
      title: 'Bimbingan',
      description: `Bimbingan: ${bimbinganCount}/${minBimbingan} sesi terkonfirmasi`,
      status: bimbinganCount >= minBimbingan ? 'completed' : (statusTA === 'DISETUJUI' || statusTA === 'BIMBINGAN' ? 'current' : 'upcoming'),
      isError: bimbinganCount < minBimbingan && (statusTA === 'DISETUJUI' || statusTA === 'BIMBINGAN'),
    },
    {
      title: 'Sidang Proposal',
      description: 'Menunggu jadwal sidang proposal',
      status: 'upcoming', // Simplified for now
    },
    {
      title: 'Bimbingan Lanjut',
      description: 'Lanjutkan bimbingan setelah proposal',
      status: 'upcoming',
    },
    {
      title: 'Sidang Akhir',
      description: 'Sidang Tugas Akhir',
      status: 'upcoming',
    },
    {
      title: 'Selesai',
      description: 'Tugas Akhir Selesai',
      status: 'upcoming',
    },
  ];

  // Logic to update status dynamically based on progress (simplified for this iteration)
  // Ideally this logic should be more robust mapping strict states

  // Calculate percentage
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const percentage = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">My Thesis Journey</h3>
        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {percentage}% Complete
        </div>
      </div>

       {/* Progress bar */}
       <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-right">
          Step {completedSteps + 1} of {steps.length}
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((item, index) => (
          <div
            key={item.title}
            className="group relative flex gap-4 hover:bg-gray-50 p-3 rounded-xl transition-all duration-300"
          >
            {/* Timeline line */}
            {index < steps.length - 1 && (
              <div className="absolute left-7 top-12 bottom-0 w-0.5 bg-gray-200 group-hover:bg-blue-300 transition-colors duration-300"></div>
            )}

            {/* Status icon */}
            <div className="relative flex-shrink-0">
              {item.status === 'completed' ? (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              ) : item.status === 'current' ? (
                 item.isError ? (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center ring-4 ring-yellow-50">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                 ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ring-4 ring-blue-50">
                        <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                 )
              ) : (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Circle className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4
                  className={`font-semibold ${
                    item.status === 'completed'
                      ? 'text-gray-900'
                      : item.status === 'current'
                        ? 'text-blue-900'
                        : 'text-gray-500'
                  }`}
                >
                  {item.title}
                </h4>
                {item.date && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {item.date}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>

              {item.status === 'current' && item.isError && (
                 <div className="mt-2 flex items-center text-xs font-medium text-blue-600">
                    <span className="mr-1">NEXT: Lanjutkan bimbingan</span>
                    <ChevronRight className="h-3 w-3" />
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
