'use client';
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  scrollToSection: (id: string) => void;
}

export default function Footer({ scrollToSection }: FooterProps) {
  return (
    <footer className="bg-gradient-to-br from-red-950 to-gray-900 text-white/80 py-16 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-900 to-yellow-600" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-3xl font-bold text-white mb-6">SITA-BI</h3>
            <p className="flex items-center gap-2 mb-2">
              <MapPin size={18} />
              Jalan Limau Manis
            </p>
            <p className="mb-4">
              Limau Manis, Kecamatan Pauh, Kota Padang, 25164
            </p>
            <p className="flex items-center gap-2 mb-2">
              <Phone size={18} />
              <strong>Phone:</strong> 0751-72590
            </p>
            <p className="flex items-center gap-2">
              <Mail size={18} />
              <strong>Email:</strong> info@pnp.ac.id
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">
              Useful Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('hero');
                  }}
                  className="hover:text-yellow-600 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#pengumuman"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('pengumuman');
                  }}
                  className="hover:text-yellow-600 transition-colors"
                >
                  Pengumuman
                </a>
              </li>
              <li>
                <a
                  href="#jadwal"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('jadwal');
                  }}
                  className="hover:text-yellow-600 transition-colors"
                >
                  Jadwal
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center">
          <p>© 2024 SITA-BI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
