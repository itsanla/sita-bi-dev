'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import request from '@/lib/api';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Loader,
  Info,
} from 'lucide-react';

// --- Interfaces ---
interface Schedule {
  id: number;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  ruangan: { nama_ruangan: string };
  sidang: {
    tugasAkhir: {
      judul: string;
      mahasiswa: { user: { name: string } };
    };
  };
}

interface UnscheduledSidang {
  id: number;
  tugasAkhir: {
    judul: string;
    mahasiswa: { user: { name: string } };
  };
}

interface Room {
  id: number;
  nama_ruangan: string;
}

// --- Main Page Component ---
export default function JadwalSidangPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [unscheduled, setUnscheduled] = useState<UnscheduledSidang[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [sidangId, setSidangId] = useState('');
  const [ruanganId, setRuanganId] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [schedulesRes, unscheduledRes, roomsRes] = await Promise.all([
        request<{ data: Schedule[] }>('/jadwal-sidang'),
        request<{ data: UnscheduledSidang[] }>('/sidang/unscheduled'),
        request<{ data: Room[] }>('/ruangan'),
      ]);
      setSchedules(schedulesRes.data || []);
      setUnscheduled(unscheduledRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await request('/jadwal-sidang', {
        method: 'POST',
        body: {
          sidang_id: Number(sidangId),
          ruangan_id: Number(ruanganId),
          tanggal,
          waktu_mulai: waktuMulai,
          waktu_selesai: waktuSelesai,
        },
      });
      alert('Jadwal berhasil dibuat!');
      // Reset form and refetch data
      setSidangId('');
      setRuanganId('');
      setTanggal('');
      setWaktuMulai('');
      setWaktuSelesai('');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await request(`/jadwal-sidang/${id}`, { method: 'DELETE' });
      alert('Schedule deleted successfully');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Kelola Jadwal Sidang
      </h1>

      {/* Create Schedule Form */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Buat Jadwal Baru
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-3">
            <label
              htmlFor="sidangId"
              className="block text-sm font-medium text-gray-700"
            >
              Pilih Sidang
            </label>
            <select
              id="sidangId"
              value={sidangId}
              onChange={(e) => setSidangId(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>
                -- Pilih Mahasiswa & Judul --
              </option>
              {unscheduled.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tugasAkhir.mahasiswa.user.name} - {s.tugasAkhir.judul}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="tanggal"
              className="block text-sm font-medium text-gray-700"
            >
              Tanggal
            </label>
            <input
              type="date"
              id="tanggal"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="waktuMulai"
              className="block text-sm font-medium text-gray-700"
            >
              Waktu Mulai
            </label>
            <input
              type="time"
              id="waktuMulai"
              value={waktuMulai}
              onChange={(e) => setWaktuMulai(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="waktuSelesai"
              className="block text-sm font-medium text-gray-700"
            >
              Waktu Selesai
            </label>
            <input
              type="time"
              id="waktuSelesai"
              value={waktuSelesai}
              onChange={(e) => setWaktuSelesai(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="lg:col-span-2">
            <label
              htmlFor="ruanganId"
              className="block text-sm font-medium text-gray-700"
            >
              Ruangan
            </label>
            <select
              id="ruanganId"
              value={ruanganId}
              onChange={(e) => setRuanganId(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>
                -- Pilih Ruangan --
              </option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_ruangan}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              {isSubmitting ? 'Menyimpan...' : 'Tambah Jadwal'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Schedules List */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Jadwal Terpublikasi
        </h2>
        {loading ? (
          <div className="text-center p-8">
            <Loader className="animate-spin mx-auto text-red-800" />
          </div>
        ) : schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white p-5 rounded-lg shadow-sm border flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    {schedule.sidang.tugasAkhir.mahasiswa.user.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate max-w-lg">
                    {schedule.sidang.tugasAkhir.judul}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
                    <span className="inline-flex items-center gap-2">
                      <Calendar size={14} />{' '}
                      {new Date(schedule.tanggal).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock size={14} /> {schedule.waktu_mulai} -{' '}
                      {schedule.waktu_selesai}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={14} /> {schedule.ruangan.nama_ruangan}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 bg-white p-12 rounded-lg shadow-sm">
            <Info size={40} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold">Belum Ada Jadwal</h3>
            <p>Silakan buat jadwal sidang baru menggunakan formulir di atas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
