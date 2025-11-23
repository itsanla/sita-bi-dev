import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';

const reportTypes = [
  {
    title: 'Laporan Kemajuan Mahasiswa',
    description:
      'Unduh rekapitulasi kemajuan tugas akhir semua mahasiswa aktif.',
  },
  {
    title: 'Laporan Penilaian Sidang',
    description:
      'Unduh rekapitulasi hasil penilaian sidang dalam periode tertentu.',
  },
  {
    title: 'Laporan Kinerja Dosen Pembimbing',
    description:
      'Unduh statistik jumlah bimbingan dan tingkat kelulusan per dosen.',
  },
  {
    title: 'Laporan Pendaftaran Sidang',
    description: 'Unduh daftar mahasiswa yang telah mendaftar sidang.',
  },
];

export default function LaporanPage() {
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-maroon-800">Pusat Laporan</h1>
      </div>

      <p className="text-gray-600 mb-10">
        Pilih dan unduh laporan yang Anda butuhkan dalam format PDF atau Excel.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              {report.title}
            </h2>
            <p className="text-gray-600 mb-6 h-12">{report.description}</p>
            <div className="flex items-center space-x-4">
              <button className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200">
                <FileText className="w-5 h-5 mr-2" />
                Unduh PDF
              </button>
              <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Unduh Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
