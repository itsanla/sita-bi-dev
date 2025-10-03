'use client';
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Header from './components/landing-page/Header';
import Footer from './components/landing-page/Footer';
import HomeContent from './components/landing-page/HomeContent';

export default function SitaBIHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrolled = (window.scrollY / documentHeight) * 100;
      setScrollProgress(scrolled);
      setShowScrollTop(window.scrollY > 300);

      const sections = ['hero', 'tawarantopik', 'jadwal', 'pengumuman', 'team'];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const teamMembers = [
    {
      name: 'Erland Agsya Agustian',
      role: 'Frontend Developer',
      id: '2311083007',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s',
    },
    {
      name: 'Nabil Achmad Khoir',
      role: 'Project Manager',
      id: '2311082032',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s',
    },
    {
      name: 'Kasih Ananda Nardi',
      role: 'Sistem Analis',
      id: '2311081021',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s',
    },
    {
      name: 'Gilang Dwi Yuwana',
      role: 'Backend Developer',
      id: '2311081016',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-red-900 to-yellow-600 z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      <Header
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      <HomeContent teamMembers={teamMembers} />

      <Footer scrollToSection={scrollToSection} />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-red-900 to-red-800 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-110 transition-all z-30"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
