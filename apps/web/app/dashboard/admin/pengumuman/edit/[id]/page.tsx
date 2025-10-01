"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";

const AudiensOptions = [
  { value: "all_users", label: "Semua Pengguna" },
  { value: "registered_users", label: "Pengguna Terdaftar" },
  { value: "dosen", label: "Dosen" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "guest", label: "Tamu" },
];

export default function EditPengumumanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [audiens, setAudiens] = useState("all_users");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPengumuman = async () => {
      try {
        const response = await api<{ data: { data: { judul: string, isi: string, audiens: string } } }>(`/pengumuman/${id}`);
        const data = response.data.data;
        setJudul(data.judul);
        setIsi(data.isi);
        setAudiens(data.audiens);
      } catch {
        setError("Gagal memuat data pengumuman.");
      } finally {
        setLoading(false);
      }
    };

    fetchPengumuman();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api(`/pengumuman/${id}`, { method: 'PATCH', body: { judul, isi, audiens } });
      router.push("/dashboard/admin/pengumuman");
    } catch {
      setError("Gagal memperbarui pengumuman. Pastikan semua field terisi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error && !judul) return <div className="container mx-auto p-4 text-red-500">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Pengumuman</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        <div className="mb-4">
          <label htmlFor="judul" className="block text-gray-700 font-bold mb-2">Judul</label>
          <input
            type="text"
            id="judul"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="isi" className="block text-gray-700 font-bold mb-2">Isi Pengumuman</label>
          <textarea
            id="isi"
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            required
          ></textarea>
        </div>
        <div className="mb-6">
          <label htmlFor="audiens" className="block text-gray-700 font-bold mb-2">Audiens</label>
          <select
            id="audiens"
            value={audiens}
            onChange={(e) => setAudiens(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {AudiensOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
