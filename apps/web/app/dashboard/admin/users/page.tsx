"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";

// --- Type Definitions ---
interface User {
  id: number;
  name: string;
  email: string;
}

interface Dosen extends User {
  nidn: string;
}

interface Mahasiswa extends User {
  nim: string;
  prodi: string;
}

type UserType = 'dosen' | 'mahasiswa';

// --- Modal Component for Create/Edit ---
const UserModal = ({
  isOpen,
  onClose,
  onSave,
  user,
  userType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: Dosen | Mahasiswa | null;
  userType: UserType;
}) => {
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(user || {
        name: '',
        email: '',
        password: '',
        nidn: userType === 'dosen' ? '' : undefined,
        nim: userType === 'mahasiswa' ? '' : undefined,
        prodi: userType === 'mahasiswa' ? '' : undefined,
      });
      setError(null);
    }
  }, [user, userType, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const isEdit = !!user;
    const endpoint = isEdit
      ? `/users/${userType}/${user.id}`
      : `/users/${userType}`;
    const method = isEdit ? 'PATCH' : 'POST';

    // Don't send password on edit if it's not being changed
    const body = { ...formData };
    if (isEdit && !body.password) {
      delete body.password;
    }

    try {
      await api(endpoint, { method, body });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Gagal ${isEdit ? 'memperbarui' : 'membuat'} pengguna.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{user ? `Edit` : 'Buat'} {userType === 'dosen' ? 'Dosen' : 'Mahasiswa'}</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nama" required className="w-full p-2 border rounded" />
          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email" required className="w-full p-2 border rounded" />
          <input type="password" name="password" onChange={handleChange} placeholder={user ? "Password Baru (opsional)" : "Password"} required={!user} className="w-full p-2 border rounded" />

          {userType === 'dosen' && (
            <input type="text" name="nidn" value={formData.nidn || ''} onChange={handleChange} placeholder="NIDN" required className="w-full p-2 border rounded" />
          )}

          {userType === 'mahasiswa' && (
            <>
              <input type="text" name="nim" value={formData.nim || ''} onChange={handleChange} placeholder="NIM" required className="w-full p-2 border rounded" />
              <input type="text" name="prodi" value={formData.prodi || ''} onChange={handleChange} placeholder="Program Studi" required className="w-full p-2 border rounded" />
            </>
          )}

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Batal</button>
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-blue-300">
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main Page Component ---
export default function ManageUsersPage() {
  const [dosen, setDosen] = useState<Dosen[]>([]);
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Dosen | Mahasiswa | null>(null);
  const [currentUserType, setCurrentUserType] = useState<UserType>('dosen');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dosenRes, mahasiswaRes] = await Promise.all([
        api<{ data: { data: Dosen[] } }>('/users/dosen?limit=500'),
        api<{ data: { data: Mahasiswa[] } }>('/users/mahasiswa?limit=500')
      ]);
      setDosen(dosenRes.data.data || []);
      setMahasiswa(mahasiswaRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (user: Dosen | Mahasiswa | null, type: UserType) => {
    setSelectedUser(user);
    setCurrentUserType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat diurungkan.")) {
      try {
        await api(`/users/${id}`, { method: 'DELETE' });
        fetchData(); // Refresh data
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal menghapus pengguna.");
      }
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manajemen Pengguna</h1>
      
      {/* Dosen Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Dosen</h2>
          <button onClick={() => handleOpenModal(null, 'dosen')} className="bg-green-600 text-white py-2 px-4 rounded-lg">Buat Dosen Baru</button>
        </div>
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="py-3 px-6">Nama</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">NIDN</th>
                <th className="py-3 px-6">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dosen.map((d) => (
                <tr key={d.id} className="bg-white border-b">
                  <td className="py-4 px-6 font-medium">{d.name}</td>
                  <td className="py-4 px-6">{d.email}</td>
                  <td className="py-4 px-6">{d.nidn}</td>
                  <td className="py-4 px-6 space-x-2">
                    <button onClick={() => handleOpenModal(d, 'dosen')} className="font-medium text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mahasiswa Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mahasiswa</h2>
            {/* You might want a "Create Mahasiswa" button here if needed, linking to the public registration for now or a new modal */}
        </div>
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="py-3 px-6">Nama</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">NIM</th>
                <th className="py-3 px-6">Prodi</th>
                <th className="py-3 px-6">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mahasiswa.map((m) => (
                <tr key={m.id} className="bg-white border-b">
                  <td className="py-4 px-6 font-medium">{m.name}</td>
                  <td className="py-4 px-6">{m.email}</td>
                  <td className="py-4 px-6">{m.nim}</td>
                  <td className="py-4 px-6">{m.prodi}</td>
                  <td className="py-4 px-6 space-x-2">
                    <button onClick={() => handleOpenModal(m, 'mahasiswa')} className="font-medium text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={() => { fetchData(); handleCloseModal(); }}
        user={selectedUser}
        userType={currentUserType}
      />
    </div>
  );
}