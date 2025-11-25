'use client';
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FileDown } from 'lucide-react';

export default function ReportsPage() {
    const { user } = useAuth();

    if (!user || !user.roles?.some(r => r.name === 'admin')) {
        return <div className="p-8">Access Denied</div>;
    }

    const handleDownload = async (url: string, filename: string) => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
            const res = await fetch(`${API_URL}${url}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        } catch (e) {
            alert('Gagal mengunduh file');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Pusat Laporan & Export Data</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Jadwal Sidang */}
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-4">Jadwal Sidang</h2>
                    <p className="text-gray-600 mb-4">Export jadwal sidang tugas akhir.</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleDownload('/api/reports/export/jadwal-sidang/pdf', 'jadwal-sidang.pdf')}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            <FileDown size={18} /> PDF
                        </button>
                        <button
                             onClick={() => handleDownload('/api/reports/export/jadwal-sidang/excel', 'jadwal-sidang.xlsx')}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            <FileDown size={18} /> Excel
                        </button>
                    </div>
                </div>

                {/* Rekap Nilai */}
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <h2 className="text-xl font-bold mb-4">Rekap Nilai Sidang</h2>
                    <p className="text-gray-600 mb-4">Export rekapitulasi nilai sidang mahasiswa.</p>
                    <div className="flex gap-4">
                        <button
                             onClick={() => handleDownload('/api/reports/export/nilai-sidang/excel', 'rekap-nilai.xlsx')}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            <FileDown size={18} /> Excel
                        </button>
                    </div>
                </div>

                 {/* Data User */}
                 <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <h2 className="text-xl font-bold mb-4">Data User Master</h2>
                    <p className="text-gray-600 mb-4">Export data mahasiswa dan dosen.</p>
                    <div className="flex gap-4">
                        <button
                             onClick={() => handleDownload('/api/reports/export/users/excel', 'users.xlsx')}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            <FileDown size={18} /> Excel
                        </button>
                    </div>
                </div>

                {/* Berita Acara */}
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                    <h2 className="text-xl font-bold mb-4">Cetak Berita Acara</h2>
                    <p className="text-gray-600 mb-4">Cetak berita acara sidang (PDF) per Sidang ID.</p>
                    <div className="flex gap-4 items-center">
                        <input
                            type="number"
                            placeholder="Sidang ID"
                            className="border p-2 rounded w-24"
                            id="sidangIdInput"
                        />
                        <button
                            onClick={() => {
                                const id = (document.getElementById('sidangIdInput') as HTMLInputElement).value;
                                if(id) handleDownload(`/api/reports/export/berita-acara/${id}`, `berita-acara-${id}.pdf`);
                                else alert('Masukkan Sidang ID');
                            }}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            <FileDown size={18} /> PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
