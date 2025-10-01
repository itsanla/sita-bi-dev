'use client';

import { useEffect, useState, FormEvent } from 'react';
import request from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';

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
  judul: string;
  status: string;
  pendaftaranSidang: PendaftaranSidang[];
}

function RegistrationForm({ onRegistrationSuccess, tugasAkhirId }: { onRegistrationSuccess: () => void; tugasAkhirId: number; }) {
  const [files, setFiles] = useState<{[key: string]: File | null}>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: inputFiles[0] || null }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('tugasAkhirId', String(tugasAkhirId)); // Include the ID

    let fileCount = 0;
    for (const key in files) {
      if (files[key]) {
        formData.append(key, files[key] as File);
        fileCount++;
      }
    }

    if (fileCount < 5) { // Check if all files are selected
      setError('Please upload all required documents.');
      setIsSubmitting(false);
      return;
    }

    try {
      await request('/pendaftaran-sidang', {
        method: 'POST',
        body: formData,
      });
      alert('Registration successful! Please wait for supervisor approval.');
      onRegistrationSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div><label>Naskah TA (.pdf, .docx): <input type="file" name="file_ta" onChange={handleFileChange} required /></label></div>
      <div><label>Sertifikat TOEIC (.pdf): <input type="file" name="file_toeic" onChange={handleFileChange} required /></label></div>
      <div><label>Transkrip Nilai (.pdf): <input type="file" name="file_rapor" onChange={handleFileChange} required /></label></div>
      <div><label>Ijazah SLTA (.pdf): <input type="file" name="file_ijazah" onChange={handleFileChange} required /></label></div>
      <div><label>Surat Bebas Jurusan (.pdf): <input type="file" name="file_bebas_jurusan" onChange={handleFileChange} required /></label></div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Registration'}
      </button>
    </form>
  )
}

// --- Main Page Component ---
export default function PendaftaranSidangPage() {
  const { user } = useAuth();
  const [tugasAkhir, setTugasAkhir] = useState<TugasAkhir | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await request<{ status: string, data: TugasAkhir | null }>('/bimbingan/sebagai-mahasiswa');
      setTugasAkhir(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const renderStatus = () => {
    if (!tugasAkhir || tugasAkhir.pendaftaranSidang.length === 0) {
      return <p>You have not registered for a defense yet.</p>;
    }
    const latestRegistration = tugasAkhir.pendaftaranSidang[tugasAkhir.pendaftaranSidang.length - 1];

    if (!latestRegistration) {
        return <p>You have not registered for a defense yet.</p>;
    }

    return (
      <div>
        <h4>Latest Registration Status (ID: {latestRegistration.id})</h4>
        <p><strong>Admin Verification:</strong> {latestRegistration.status_verifikasi}</p>
        <p><strong>Supervisor 1 Approval:</strong> {latestRegistration.status_pembimbing_1}</p>
        <p><strong>Supervisor 2 Approval:</strong> {latestRegistration.status_pembimbing_2}</p>
        {latestRegistration.catatan_admin && <p><strong>Admin Notes:</strong> {latestRegistration.catatan_admin}</p>}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!tugasAkhir) return <div>No active final project found.</div>;

  return (
    <div>
      <h2>Defense Registration</h2>
      {renderStatus()}
      
      <hr style={{ margin: '2rem 0' }} />

      {/* Registration form will be added here in the next step */}
      <h3>Register for a New Defense</h3>
      <RegistrationForm tugasAkhirId={tugasAkhir.id} onRegistrationSuccess={fetchData} />
    </div>
  );
}
