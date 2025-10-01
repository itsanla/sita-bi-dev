'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import request from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    prodi: 'D3', // Default value
    angkatan: '', // Tambahkan field angkatan
    kelas: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Hapus password_confirmation sebelum mengirim
    const { password_confirmation, ...payload } = formData;

    try {
      const response = await request<{ message: string }>('/auth/register', {
        method: 'POST',
        body: payload, // Kirim sebagai objek mentah
      });
      alert(response.message);
      // Redirect to OTP verification page, passing email along
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Register for a Student Account</h1>
      <form onSubmit={handleSubmit}>
        <div><label>Name: <input name="name" type="text" value={formData.name} onChange={handleChange} required /></label></div>
        <div><label>Email: <input name="email" type="email" value={formData.email} onChange={handleChange} required /></label></div>
        <div><label>NIM: <input name="nim" type="text" value={formData.nim} onChange={handleChange} required /></label></div>
        <div><label>Angkatan: <input name="angkatan" type="text" value={formData.angkatan} onChange={handleChange} required /></label></div>
        <div>
          <label>Prodi: 
            <select name="prodi" value={formData.prodi} onChange={handleChange}>
              <option value="D3">D3</option>
              <option value="D4">D4</option>
            </select>
          </label>
        </div>
        <div><label>Kelas: <input name="kelas" type="text" value={formData.kelas} onChange={handleChange} required /></label></div>
        <div><label>Password: <input name="password" type="password" value={formData.password} onChange={handleChange} required /></label></div>
        <div><label>Confirm Password: <input name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} required /></label></div>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  );
}