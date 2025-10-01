"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUp, Megaphone, GraduationCap, BookOpen, Mail, Phone, MapPin, Github, Linkedin, Instagram, Twitter } from 'lucide-react';

export default function SitaBIHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = (window.scrollY / documentHeight) * 100;
      setScrollProgress(scrolled);
      setShowScrollTop(window.scrollY > 300);

      const sections = ['hero', 'tawarantopik', 'jadwal', 'pengumuman', 'team'];
      const current = sections.find(section => {
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

  const scrollToSection = (id) => {
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
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s'
    },
    {
      name: 'Nabil Achmad Khoir',
      role: 'Project Manager',
      id: '2311082032',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s'
    },
    {
      name: 'Kasih Ananda Nardi',
      role: 'Sistem Analis',
      id: '2311081021',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s'
    },
    {
      name: 'Gilang Dwi Yuwana',
      role: 'Backend Developer',
      id: '2311081016',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-red-900 to-yellow-600 z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            <a 
              href="#hero" 
              onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
              className="flex items-center gap-3 transition-transform hover:scale-105"
            >
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s" 
                alt="Logo" 
                className="w-12 h-12 rounded-xl shadow-md"
              />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">
                SITA-BI
              </h1>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {['hero', 'tawarantopik', 'jadwal', 'pengumuman', 'team'].map((section) => (
                <a
                  key={section}
                  href={`#${section}`}
                  onClick={(e) => { e.preventDefault(); scrollToSection(section); }}
                  className={`relative font-medium transition-colors ${
                    activeSection === section ? 'text-red-900' : 'text-gray-800 hover:text-red-900'
                  }`}
                >
                  {section === 'hero' ? 'Home' : section.charAt(0).toUpperCase() + section.slice(1).replace('topik', ' Topik')}
                  {activeSection === section && (
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-red-900" />
                  )}
                </a>
              ))}
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
              {['hero', 'tawarantopik', 'jadwal', 'pengumuman', 'team'].map((section) => (
                <a
                  key={section}
                  href={`#${section}`}
                  onClick={(e) => { e.preventDefault(); scrollToSection(section); }}
                  className="block py-3 text-gray-800 hover:text-red-900 font-medium"
                >
                  {section === 'hero' ? 'Home' : section.charAt(0).toUpperCase() + section.slice(1).replace('topik', ' Topik')}
                </a>
              ))}
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

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-gradient-to-r from-red-900 to-red-700 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                ✨ Welcome to SITA-BI
              </span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
                Your <span className="bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">Ultimate Solution</span> for Managing Thesis Projects
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Stay organized, stay on track, and achieve your academic goals with ease. Transform your thesis journey into a seamless experience.
              </p>
              <div className="flex flex-wrap gap-5">
                <a 
                  href="#" 
                  className="bg-gradient-to-r from-red-900 to-red-800 text-white px-10 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  Get Started
                </a>
                <a 
                  href="#" 
                  className="border-2 border-red-900 text-red-900 px-10 py-4 rounded-full font-semibold bg-white hover:bg-red-900 hover:text-white hover:-translate-y-1 transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative p-5">
              <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-yellow-600 rounded-3xl transform -rotate-6" />
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s" 
                alt="Illustration" 
                className="relative w-full max-w-lg rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tawaran Topik Section */}
      <section id="tawarantopik" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-red-900 font-semibold text-sm uppercase tracking-widest mb-4">Explore Topics</p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Tawaran Topik</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Temukan topik penelitian yang sesuai dengan minat dan kebutuhan Anda
            </p>
          </div>
          <div className="text-center p-16 bg-white rounded-3xl border-2 border-dashed border-red-900/20 hover:border-red-900 hover:shadow-2xl transition-all">
            <BookOpen size={80} className="mx-auto mb-6 text-red-900" />
            <p className="text-xl text-gray-600">Belum ada tawaran topik yang tersedia saat ini.</p>
          </div>
        </div>
      </section>

      {/* Jadwal Section */}
      <section id="jadwal" className="py-24 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-red-900 font-semibold text-sm uppercase tracking-widest mb-4">Schedule</p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Jadwal Sidang</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pantau jadwal sidang Anda dengan mudah dan tetap terorganisir
            </p>
          </div>
          <div className="text-center p-16 bg-white rounded-3xl border-2 border-dashed border-red-900/20 hover:border-red-900 hover:shadow-2xl transition-all">
            <GraduationCap size={80} className="mx-auto mb-6 text-red-900" />
            <p className="text-xl text-gray-600">Belum ada jadwal untuk ditampilkan.</p>
          </div>
        </div>
      </section>

      {/* Pengumuman Section */}
      <section id="pengumuman" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-red-900 font-semibold text-sm uppercase tracking-widest mb-4">Announcements</p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Pengumuman</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dapatkan informasi terbaru dan penting seputar kegiatan akademik
            </p>
          </div>
          <div className="text-center p-16 bg-white rounded-3xl border-2 border-dashed border-red-900/20 hover:border-red-900 hover:shadow-2xl transition-all">
            <Megaphone size={80} className="mx-auto mb-6 text-red-900" />
            <p className="text-xl text-gray-600">Belum ada pengumuman untuk ditampilkan.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-red-900 font-semibold text-sm uppercase tracking-widest mb-4">Meet Our Team</p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Team 7</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tim pengembang yang berdedikasi untuk menciptakan solusi terbaik
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300">
                <div className="relative aspect-square overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-900 to-yellow-600 scale-x-0 group-hover:scale-x-100 transition-transform" />
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 opacity-0 translate-y-5 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors">
                      <Twitter size={18} />
                    </a>
                    <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors">
                      <Github size={18} />
                    </a>
                    <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors">
                      <Instagram size={18} />
                    </a>
                    <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors">
                      <Linkedin size={18} />
                    </a>
                  </div>
                </div>
                <div className="p-8 text-center">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h4>
                  <p className="text-red-900 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm bg-gray-100 px-4 py-2 rounded-full inline-block">{member.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-red-950 to-gray-900 text-white/80 py-16 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-900 to-yellow-600" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">SITA-BI</h3>
              <p className="flex items-center gap-2 mb-2">
                <MapPin size={18} />Jalan Limau Manis
              </p>
              <p className="mb-4">Limau Manis, Kecamatan Pauh, Kota Padang, 25164</p>
              <p className="flex items-center gap-2 mb-2">
                <Phone size={18} /><strong>Phone:</strong> 0751-72590
              </p>
              <p className="flex items-center gap-2">
                <Mail size={18} /><strong>Email:</strong> info@pnp.ac.id
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-white mb-6">Useful Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="hover:text-yellow-600 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#pengumuman" onClick={(e) => { e.preventDefault(); scrollToSection('pengumuman'); }} className="hover:text-yellow-600 transition-colors">
                    Pengumuman
                  </a>
                </li>
                <li>
                  <a href="#jadwal" onClick={(e) => { e.preventDefault(); scrollToSection('jadwal'); }} className="hover:text-yellow-600 transition-colors">
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