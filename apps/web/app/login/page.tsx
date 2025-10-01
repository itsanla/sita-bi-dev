'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import request from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // `request` sekarang menangani stringify secara otomatis
      const response = await request<{ data: { token: string } }>('/auth/login', {
        method: 'POST',
        body: { email, password }, // Kirim sebagai objek mentah
      });

      // Sesuaikan dengan struktur respons baru dari backend
      if (response.data.token) {
        Cookies.set('token', response.data.token, { expires: 7 }); // Simpan token selama 7 hari
        router.push('/dashboard');
      } else {
        setError('Login gagal: Token tidak diterima.');
      }
    } catch (err: any) {
      // Tangani error dari FetchError atau error lainnya
      const errorMessage = err.data?.message || err.message || 'Terjadi kesalahan tidak diketahui.';
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <a href="http://localhost:3000/auth/google" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', border: '1px solid #ccc', textDecoration: 'none', color: 'black' }}>
        Sign in with Google
      </a>
      <div style={{ marginTop: '1rem' }}>
        <p>Don&apos;t have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
}