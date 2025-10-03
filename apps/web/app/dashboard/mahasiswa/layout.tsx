'use client';

import { ReactNode } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

export default function MahasiswaLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  const isMahasiswa = user?.roles?.some((role) => role.name === 'mahasiswa');

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-gray-700">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isMahasiswa) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Unauthorized Access
          </h2>
          <p className="text-gray-600">This dashboard is for students only.</p>
        </div>
      </div>
    );
  }

  const scrollToSection = (id: string) => {
    // Dummy function for footer prop
    console.log(
      `Scroll to ${id} requested, but not implemented in this layout.`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
}
