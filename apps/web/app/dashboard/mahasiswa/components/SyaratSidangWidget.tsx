'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SyaratSidangWidget() {
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        // const userId = localStorage.getItem('userId') || localStorage.getItem('token'); // Simplification
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/pendaftaran-sidang/check-eligibility`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`, // Use token if available
              // Or custom header if that's how it's handled
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setEligibility(result.data);
        }
      } catch (error) {
        console.error('Error fetching eligibility:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!eligibility) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Syarat Pendaftaran Sidang</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            eligibility.isEligible
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
            {eligibility.isEligible ? 'Memenuhi Syarat' : 'Belum Memenuhi'}
        </span>
      </div>

      <div className="space-y-4">
        {/* Tugas Akhir Status */}
        <div className="flex items-center gap-3">
          {eligibility.details.tugasAkhirApproved ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
          <span className={eligibility.details.tugasAkhirApproved ? 'text-gray-700' : 'text-gray-500'}>
            Judul TA Disetujui
          </span>
        </div>

        {/* Bimbingan Count */}
        <div className="flex items-center gap-3">
          {eligibility.details.bimbinganCount >= eligibility.details.minBimbingan ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          )}
          <div className="flex-1">
             <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Bimbingan Terkonfirmasi</span>
                <span className="font-medium">{eligibility.details.bimbinganCount}/{eligibility.details.minBimbingan}</span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                    className={`h-1.5 rounded-full ${
                        eligibility.details.bimbinganCount >= eligibility.details.minBimbingan ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min((eligibility.details.bimbinganCount / eligibility.details.minBimbingan) * 100, 100)}%` }}
                ></div>
             </div>
          </div>
        </div>

        {/* Additional Checks could go here */}
      </div>

      {!eligibility.isEligible && eligibility.reason.length > 0 && (
         <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
            <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide mb-2">Belum Terpenuhi:</h4>
            <ul className="space-y-1">
                {eligibility.reason.map((reason: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-xs text-red-700">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                    </li>
                ))}
            </ul>
         </div>
      )}

      <button
        onClick={() => router.push('/dashboard/mahasiswa/sidang')}
        disabled={!eligibility.isEligible}
        className={`mt-6 w-full py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            eligibility.isEligible
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Daftar Sidang Sekarang
      </button>
    </div>
  );
}
