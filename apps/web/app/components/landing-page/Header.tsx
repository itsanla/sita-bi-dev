'use client';
import React from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  activeSection: string;
  scrollToSection: (id: string) => void;
}

export default function Header({
  isMenuOpen,
  setIsMenuOpen,
  activeSection,
  scrollToSection,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-5">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('hero');
            }}
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s"
              alt="Logo"
              width={48}
              height={48}
              className="rounded-xl shadow-md"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">
              SITA-BI
            </h1>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {['hero', 'tawarantopik', 'jadwal', 'pengumuman', 'team'].map(
              (section) => (
                <a
                  key={section}
                  href={`#${section}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section);
                  }}
                  className={`relative font-medium transition-colors ${
                    activeSection === section
                      ? 'text-red-900'
                      : 'text-gray-800 hover:text-red-900'
                  }`}
                >
                  {section === 'hero'
                    ? 'Home'
                    : section.charAt(0).toUpperCase() +
                      section.slice(1).replace('topik', ' Topik')}
                  {activeSection === section && (
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-red-900" />
                  )}
                </a>
              ),
            )}
            <a
              href="/login"
              className="bg-gradient-to-r from-red-900 to-red-800 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Login
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-red-900"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-6 border-t border-red-900/10">
            {['hero', 'tawarantopik', 'jadwal', 'pengumuman', 'team'].map(
              (section) => (
                <a
                  key={section}
                  href={`#${section}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section);
                  }}
                  className="block py-3 text-gray-800 hover:text-red-900 font-medium"
                >
                  {section === 'hero'
                    ? 'Home'
                    : section.charAt(0).toUpperCase() +
                      section.slice(1).replace('topik', ' Topik')}
                </a>
              ),
            )}
            <a
              href="/login"
              className="block text-center bg-gradient-to-r from-red-900 to-red-800 text-white px-8 py-3 rounded-full font-semibold mt-4"
            >
              Login
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
