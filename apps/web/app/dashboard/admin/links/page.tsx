"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";

// --- Type Definitions ---
interface Link {
  id: number;
  title: string;
  url: string;
  description: string | null;
}

// --- Modal Component ---
const LinkModal = ({
  isOpen,
  onClose,
  onSave,
  link,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  link: Link | null;
}) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (link) {
      setTitle(link.title);
      setUrl(link.url);
      setDescription(link.description || "");
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
    }
    setError(null);
  }, [link, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const linkData = { title, url, description };

    try {
      if (link) {
        await api(`/links/${link.id}`, { method: 'PATCH', body: linkData });
      } else {
        await api("/links", { method: 'POST', body: linkData });
      }
      onSave();
      onClose();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Gagal menyimpan link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{link ? "Edit Link" : "Buat Link Baru"}</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Judul</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
          </div>
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
export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await api<{ data: { data: Link[] } }>("/links");
      setLinks(response.data.data || []);
    } catch {
      setError("Gagal memuat data links.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleOpenModal = (link: Link | null) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLink(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    fetchLinks();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus link ini?")) {
      try {
        await api(`/links/${id}`, { method: 'DELETE' });
        fetchLinks();
      } catch {
        alert("Gagal menghapus link.");
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Links</h1>
        <button onClick={() => handleOpenModal(null)} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Buat Link Baru</button>
      </div>
      
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">Judul</th>
              <th scope="col" className="py-3 px-6">URL</th>
              <th scope="col" className="py-3 px-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {links.length > 0 ? (
              links.map((link) => (
                <tr key={link.id} className="bg-white border-b">
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {link.title}
                    <p className="text-xs text-gray-500">{link.description}</p>
                  </td>
                  <td className="py-4 px-6"><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.url}</a></td>
                  <td className="py-4 px-6">
                    <button onClick={() => handleOpenModal(link)} className="font-medium text-blue-600 hover:underline mr-4">Edit</button>
                    <button onClick={() => handleDelete(link.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 px-6 text-center text-gray-500">Tidak ada link yang tersedia.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LinkModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        link={selectedLink}
      />
    </div>
  );
}
