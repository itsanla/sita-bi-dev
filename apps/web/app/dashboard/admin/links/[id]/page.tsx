"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

interface LinkDetail {
  id: number;
  title: string;
  url: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function LinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [link, setLink] = useState<LinkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchLink = async () => {
        try {
          setLoading(true);
          const response = await api<{ data: LinkDetail }>(`/links/${id}`);
          setLink(response.data);
        } catch (err) {
          setError("Gagal memuat data link. Mungkin link tidak ditemukan.");
        } finally {
          setLoading(false);
        }
      };
      fetchLink();
    }
  }, [id]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!link) return <div className="container mx-auto p-4">Link tidak ditemukan.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{link.title}</h1>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">URL</p>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {link.url}
            </a>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Deskripsi</p>
            <p className="text-gray-700">{link.description || "Tidak ada deskripsi."}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dibuat pada</p>
            <p className="text-gray-700">{new Date(link.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Diperbarui pada</p>
            <p className="text-gray-700">{new Date(link.updatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/dashboard/admin/links">
            <span className="text-blue-600 hover:underline">Kembali ke Daftar Links</span>
          </Link>
        </div>
      </div>
    </div>
  );
}