'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, UserCircle, BookOpenCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900 to-red-950"></div>
      
      {/* Content */}
      <div className="relative px-8 max-w-full mx-auto">
        <div className="flex items-center justify-between h-20 py-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link 
              href="/dashboard/mahasiswa" 
              className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <BookOpenCheck className="h-7 w-7 text-white group-hover:text-white/90 transition-colors" />
                <Sparkles className="h-3 w-3 text-white absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-white">
                SITA-BI
              </span>
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-6">
            
            {/* User Info Card */}
            <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
                <UserCircle className="relative h-10 w-10 text-white" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-white tracking-wide">
                  {user?.name || 'Student'}
                </span>
                <span className="text-xs text-white/80 font-medium capitalize flex items-center justify-end gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  {user?.roles?.[0]?.name || 'Mahasiswa'}
                </span>
              </div>
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={logout}
              className="group relative flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-white/90 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/30 overflow-hidden"
              title="Sign Out"
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <LogOut className="relative h-4 w-4 text-red-900 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative text-sm font-bold text-red-900 tracking-wide">
                Sign Out
              </span>
            </button>
            
          </div>
        </div>
      </div>
    </header>
  );
}