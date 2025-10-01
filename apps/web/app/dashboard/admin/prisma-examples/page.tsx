"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function PrismaExamplesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api<{ data: { data: User[] } }>('/contoh-prisma');
        setUsers(response.data.data);
      } catch (err) {
        setError('Gagal memuat data contoh prisma.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Prisma Examples</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <ul>
          {users.map(user => (
            <li key={user.id} className="border-b py-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}