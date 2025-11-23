'use client';

import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TimelineItem {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

interface ProgressTimelineProps {
  stats: any;
  loading: boolean;
}

export default function ProgressTimeline({ stats, loading }: ProgressTimelineProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(4)].map((_, i) => (
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

  const timeline: TimelineItem[] = [
    {
      title: 'Pengajuan Judul',
      description: stats?.tugasAkhir?.disetujui > 0 ? 'Judul tugas akhir telah disetujui' : 'Belum mengajukan judul',
      status: stats?.tugasAkhir?.disetujui > 0 ? 'completed' : stats?.tugasAkhir?.pending > 0 ? 'current' : 'upcoming',
      date: stats?.tugasAkhir?.disetujui > 0 || stats?.tugasAkhir?.pending > 0 ? 'Telah diajukan' : undefined,
    },
    {
      title: 'Bimbingan',
      description: `${stats?.bimbingan?.total || 0} sesi bimbingan telah dilakukan`,
      status: stats?.bimbingan?.total > 0 ? 'current' : 'upcoming',
      date: stats?.bimbingan?.total > 0 ? 'Sedang berlangsung' : undefined,
    },
    {
      title: 'Pendaftaran Sidang',
      description: stats?.sidang?.status === 'Terdaftar' ? 'Terdaftar untuk sidang' : 'Menunggu kelengkapan berkas',
      status: stats?.sidang?.status === 'Terdaftar' ? 'completed' : stats?.bimbingan?.total > 5 ? 'current' : 'upcoming',
    },
    {
      title: 'Sidang Tugas Akhir',
      description: stats?.sidang?.tanggal ? `Dijadwalkan` : 'Belum dijadwalkan',
      status: 'upcoming',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Timeline Progress</h3>
        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Tahap 2/4
        </div>
      </div>

      <div className="space-y-6">
        {timeline.map((item, index) => (
          <div
            key={item.title}
            className="group relative flex gap-4 hover:bg-gray-50 p-3 rounded-xl transition-all duration-300"
          >
            {/* Timeline line */}
            {index < timeline.length - 1 && (
              <div className="absolute left-7 top-12 bottom-0 w-0.5 bg-gray-200 group-hover:bg-blue-300 transition-colors duration-300"></div>
            )}

            {/* Status icon */}
            <div className="relative flex-shrink-0">
              {item.status === 'completed' && (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              )}
              {item.status === 'current' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-4 ring-blue-50">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              )}
              {item.status === 'upcoming' && (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                  } group-hover:text-blue-600 transition-colors duration-300`}
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
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Progress Keseluruhan
          </span>
          <span className="text-sm font-bold text-blue-600">{stats?.progress?.percentage || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out hover:from-blue-600 hover:to-purple-600"
            style={{ width: `${stats?.progress?.percentage || 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
