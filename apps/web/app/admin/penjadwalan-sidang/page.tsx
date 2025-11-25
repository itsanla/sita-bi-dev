'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function PenjadwalanSidangPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    sidangId: 0,
    tanggal: '',
    waktu_mulai: '',
    waktu_selesai: '',
    ruangan_id: 0,
    pengujiIds: [] as number[],
  });

  const [conflictResult, setConflictResult] = useState<{ hasConflict: boolean; messages: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock lists for dropdowns (In real app, fetch from API)
  const [sidangList, setSidangList] = useState<any[]>([]); // Sidang ready to schedule
  const [ruanganList, setRuanganList] = useState<any[]>([]);
  const [dosenList, setDosenList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch data for dropdowns
    // Placeholder logic
    // fetch('/api/sidang/ready')
    // fetch('/api/ruangan')
    // fetch('/api/dosen')
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckConflict = async () => {
    // Validate required fields first
    if (!formData.sidangId || !formData.tanggal || !formData.waktu_mulai || !formData.waktu_selesai || !formData.ruangan_id) {
        alert('Mohon lengkapi data jadwal terlebih dahulu');
        return;
    }

    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
        const res = await fetch(`${API_URL}/api/jadwal-sidang/check-conflict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ...formData,
                sidangId: Number(formData.sidangId),
                ruangan_id: Number(formData.ruangan_id),
                // pengujiIds logic handling needed
            })
        });
        const data = await res.json();
        if (data.status === 'sukses') {
            setConflictResult(data.data);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Logic submit jadwal
  };

  return (
      <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Penjadwalan Sidang</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
                  {/* Form Fields Placeholder */}
                  <div>
                      <label className="block text-sm font-medium mb-1">Sidang Mahasiswa</label>
                      <select name="sidangId" onChange={handleChange} className="w-full border p-2 rounded">
                          <option value="">Pilih Sidang...</option>
                          {/* Options */}
                      </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tanggal</label>
                        <input type="date" name="tanggal" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ruangan</label>
                        <select name="ruangan_id" onChange={handleChange} className="w-full border p-2 rounded">
                            <option value="">Pilih Ruangan...</option>
                             {/* Options */}
                        </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Jam Mulai</label>
                        <input type="time" name="waktu_mulai" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Jam Selesai</label>
                        <input type="time" name="waktu_selesai" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckConflict}
                    className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 mb-4"
                  >
                      {loading ? 'Checking...' : 'Check Conflict'}
                  </button>

                  {conflictResult && conflictResult.hasConflict && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-700">
                          <p className="font-bold">Konflik Terdeteksi:</p>
                          <ul className="list-disc pl-5">
                              {conflictResult.messages.map((m, i) => <li key={i}>{m}</li>)}
                          </ul>
                      </div>
                  )}

                  {conflictResult && !conflictResult.hasConflict && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded text-sm text-green-700">
                          Jadwal Aman. Tidak ada konflik.
                      </div>
                  )}

                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={conflictResult?.hasConflict}>
                      Simpan Jadwal
                  </button>
              </form>
          </div>
      </div>
  );
}
