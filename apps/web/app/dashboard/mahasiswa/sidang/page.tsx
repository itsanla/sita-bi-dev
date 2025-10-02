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
  // pendaftaranSidang is fetched separately
}

interface Nilai {
  id: number;
  aspek: string;
  skor: number;
  komentar: string;
  dosen: {
    user: {
      name: string;
    };
  };
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
  const [pendaftaran, setPendaftaran] = useState<PendaftaranSidang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nilaiSidang, setNilaiSidang] = useState<Nilai[] | null>(null);
  const [viewingNilaiFor, setViewingNilaiFor] = useState<number | null>(null);

  const fetchNilai = async (sidangId: number) => {
    try {
      setViewingNilaiFor(sidangId); // Show loading state for this specific one
      const response = await request<{ data: Nilai[] }>(`/penilaian/sidang/${sidangId}`);
      setNilaiSidang(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assessment scores');
      setNilaiSidang(null); // Clear previous scores on error
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const taResponse = await request<{ status: string, data: TugasAkhir | null }>('/bimbingan/sebagai-mahasiswa');
      setTugasAkhir(taResponse.data);

      // If TA exists, try to fetch their registration
      if (taResponse.data) {
        try {
          const regResponse = await request<{ data: PendaftaranSidang | null }>('/pendaftaran-sidang/my-registration');
          setPendaftaran(regResponse.data);
        } catch (regError) {
          // This is okay, it just means they haven't registered yet.
          setPendaftaran(null);
        }
      }
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
    const reg = pendaftaran;

    if (!reg) {
      return <p>You have not registered for a defense yet.</p>;
    }

    return (
      <div>
          <div key={reg.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
            <h4>Registration Status (ID: {reg.id})</h4>
            <p><strong>Admin Verification:</strong> {reg.status_verifikasi}</p>
            <p><strong>Supervisor 1 Approval:</strong> {reg.status_pembimbing_1}</p>
            <p><strong>Supervisor 2 Approval:</strong> {reg.status_pembimbing_2}</p>
            {reg.catatan_admin && <p><strong>Admin Notes:</strong> {reg.catatan_admin}</p>}

            {/* Show button only if verified */}
            {reg.status_verifikasi === 'terverifikasi' && (
              <button onClick={() => fetchNilai(reg.id)} disabled={viewingNilaiFor === reg.id}>
                {viewingNilaiFor === reg.id ? 'Loading Scores...' : 'View Assessment Scores'}
              </button>
            )}

            {/* Display scores if they are being viewed for this registration */}
            {viewingNilaiFor === reg.id && nilaiSidang && (
              <div style={{ marginTop: '1rem' }}>
                <h5>Assessment Scores:</h5>
                {nilaiSidang.length > 0 ? (
                  <ul>
                    {nilaiSidang.map(n => (
                      <li key={n.id}>
                        <strong>{n.aspek}</strong> by {n.dosen.user.name}: {n.skor} - <em>{n.komentar}</em>
                      </li>
                    ))}
                  </ul>
                ) : <p>No scores have been submitted yet.</p>}
              </div>
            )}
          </div>
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
      
      {/* Show registration form only if there is no existing registration and TA exists */}
      {!pendaftaran && tugasAkhir && (
        <>
          <hr style={{ margin: '2rem 0' }} />
          <h3>Register for a New Defense</h3>
          <RegistrationForm tugasAkhirId={tugasAkhir.id} onRegistrationSuccess={fetchData} />
        </>
      )}
    </div>
  );
}
