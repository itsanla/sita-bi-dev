'use client';

import { useEffect, useState, FormEvent } from 'react';
import request from '@/lib/api';

// Define interfaces for the data shapes
interface Dosen {
  id: number;
  name: string;
  email: string;
  nidn: string;
}

interface Mahasiswa {
  id: number;
  name: string;
  email: string;
  nim: string;
  prodi: string;
}

function CreateDosenForm({ onDosenCreated }: { onDosenCreated: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nidn, setNidn] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await request('/users/dosen', {
        method: 'POST',
        body: { name, email, nidn, password }, // Kirim sebagai objek mentah
      });
      alert('Dosen created successfully!');
      // Reset form
      setName('');
      setEmail('');
      setNidn('');
      setPassword('');
      // Trigger data refresh in parent
      onDosenCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dosen');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h4>Create New Dosen</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Name: </label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Email: </label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>NIDN: </label>
        <input type="text" value={nidn} onChange={e => setNidn(e.target.value)} required />
      </div>
      <div>
        <label>Password: </label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Create Dosen</button>
    </form>
  );
}

export default function ManageUsersPage() {
  const [dosen, setDosen] = useState<Dosen[]>([]);
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dosenRes, mahasiswaRes] = await Promise.all([
        request<{ data: { data: Dosen[] } }>('/users/dosen?limit=500'),
        request<{ data: { data: Mahasiswa[] } }>('/users/mahasiswa?limit=500')
      ]);
      setDosen(dosenRes.data.data);
      setMahasiswa(mahasiswaRes.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2>Manage Users</h2>
      
      <h3>Dosen</h3>
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create New Dosen'}
      </button>
      {showCreateForm && <CreateDosenForm onDosenCreated={() => { fetchData(); setShowCreateForm(false); }} />}
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>NIDN</th>
          </tr>
        </thead>
        <tbody>
          {dosen.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.name}</td>
              <td>{d.email}</td>
              <td>{d.nidn}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '2rem' }}>Mahasiswa</h3>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>NIM</th>
            <th>Prodi</th>
          </tr>
        </thead>
        <tbody>
          {mahasiswa.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.nim}</td>
              <td>{m.prodi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
