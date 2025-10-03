'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import request from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';
import { UploadCloud, File as FileIcon, CheckCircle, XCircle, Clock } from 'lucide-react';

// --- Interfaces ---
interface PendaftaranSidang {
  id: number;
  status_verifikasi: string;
  status_pembimbing_1: string;
  status_pembimbing_2: string;
  catatan_admin: string | null;
}

interface TugasAkhir {
  id: number;
}

interface Nilai {
  id: number;
  aspek: string;
  skor: number;
  komentar: string;
  dosen: { user: { name: string } };
}

const fileInputs = [
  { name: 'file_ta', label: 'Naskah TA', types: '.pdf, .doc, .docx' },
  { name: 'file_toeic', label: 'Sertifikat TOEIC', types: '.pdf' },
  { name: 'file_rapor', label: 'Transkrip Nilai', types: '.pdf' },
  { name: 'file_ijazah', label: 'Ijazah SLTA', types: '.pdf' },
  { name: 'file_bebas_jurusan', label: 'Surat Bebas Jurusan', types: '.pdf' },
];

// --- Components ---
function RegistrationForm({ onRegistrationSuccess, tugasAkhirId }: { onRegistrationSuccess: () => void; tugasAkhirId: number; }) {
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: inputFiles[0] || null }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (Object.values(files).filter(f => f).length < fileInputs.length) {
      setError('Please upload all required documents.');
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('tugasAkhirId', String(tugasAkhirId));
    for (const key in files) {
      if (files[key]) formData.append(key, files[key] as File);
    }

    try {
      await request('/pendaftaran-sidang', { method: 'POST', body: formData });
      alert('Registration successful! Please wait for approval.');
      onRegistrationSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Register for a New Defense</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-sm text-red-600 p-3 bg-red-50 rounded-lg">{error}</p>}
        <div className="space-y-4">
          {fileInputs.map(input => (
            <div key={input.name}>
              <label className="block text-sm font-medium text-gray-700">{input.label}</label>
              <div className="mt-1 flex items-center gap-4">
                <input type="file" name={input.name} onChange={handleFileChange} required accept={input.types} className="hidden" id={input.name} />
                <label htmlFor={input.name} className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <UploadCloud size={16} />
                  Choose File
                </label>
                {files[input.name] && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileIcon size={16} />
                    <span>{files[input.name]?.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 disabled:opacity-50">
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium";
  if (status === 'disetujui') {
    return <span className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle size={14} /> Approved</span>;
  }
  if (status === 'ditolak') {
    return <span className={`${baseClasses} bg-red-100 text-red-800`}><XCircle size={14} /> Rejected</span>;
  }
  return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><Clock size={14} /> Waiting</span>;
}

// --- Main Page Component ---
export default function PendaftaranSidangPage() {
  const { user } = useAuth();
  const [tugasAkhir, setTugasAkhir] = useState<TugasAkhir | null>(null);
  const [pendaftaran, setPendaftaran] = useState<PendaftaranSidang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const taResponse = await request<{ data: TugasAkhir | null }>('/bimbingan/sebagai-mahasiswa');
      setTugasAkhir(taResponse.data);
      if (taResponse.data) {
        try {
          const regResponse = await request<{ data: PendaftaranSidang | null }>('/pendaftaran-sidang/my-registration');
          setPendaftaran(regResponse.data);
        } catch { setPendaftaran(null); }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const renderStatus = () => {
    if (!pendaftaran) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Registration Status</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Admin Verification</span>
            <StatusPill status={pendaftaran.status_verifikasi} />
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Supervisor 1 Approval</span>
            <StatusPill status={pendaftaran.status_pembimbing_1} />
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Supervisor 2 Approval</span>
            <StatusPill status={pendaftaran.status_pembimbing_2} />
          </div>
          {pendaftaran.catatan_admin && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <p className="font-semibold text-yellow-800">Admin Notes:</p>
              <p className="text-yellow-700">{pendaftaran.catatan_admin}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  if (!tugasAkhir) return <div className="text-center p-8 bg-white rounded-lg shadow-md">No active final project found.</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Defense Registration</h1>
      {pendaftaran ? renderStatus() : <RegistrationForm tugasAkhirId={tugasAkhir.id} onRegistrationSuccess={fetchData} />}
    </div>
  );
}
