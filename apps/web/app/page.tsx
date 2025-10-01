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
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          overflow-x: hidden;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #8B1538, #D4AF37);
          z-index: 9999;
          transition: width 0.1s ease;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 24px rgba(139, 21, 56, 0.08);
          z-index: 1000;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo img {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(139, 21, 56, 0.2);
        }

        .logo h1 {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #8B1538, #B71C4A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-family: 'Playfair Display', serif;
        }

        .nav-desktop {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .nav-link {
          color: #1a1a1a;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          position: relative;
          transition: color 0.3s;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          width: 0;
          height: 2px;
          background: #8B1538;
          transition: width 0.3s ease;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #8B1538;
        }

        .nav-link.active::after {
          width: 100%;
        }

        .btn-login {
          background: linear-gradient(135deg, #8B1538, #5D0E26);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(139, 21, 56, 0.3);
          transition: all 0.3s ease;
        }

        .btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(139, 21, 56, 0.4);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #8B1538;
        }

        .nav-mobile {
          display: none;
          padding: 1.5rem 0;
          border-top: 1px solid rgba(139, 21, 56, 0.1);
        }

        .nav-mobile.open {
          display: block;
        }

        .nav-mobile .nav-link {
          display: block;
          padding: 0.75rem 0;
        }

        .nav-mobile .btn-login {
          display: block;
          text-align: center;
          margin-top: 1rem;
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #FFF8F0 0%, #fff 50%, #FFF8F0 100%);
          position: relative;
          overflow: hidden;
          padding-top: 100px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8B1538, #B71C4A);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
          font-family: 'Playfair Display', serif;
        }

        .hero-gradient-text {
          background: linear-gradient(135deg, #8B1538, #B71C4A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-highlight {
          font-size: 1.25rem;
          color: #6B7280;
          margin-bottom: 2.5rem;
          line-height: 1.8;
        }

        .hero-buttons {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #8B1538, #5D0E26);
          color: white;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(139, 21, 56, 0.3);
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(139, 21, 56, 0.4);
        }

        .btn-outline {
          border: 2px solid #8B1538;
          color: #8B1538;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          background: white;
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background: #8B1538;
          color: white;
          transform: translateY(-3px);
        }

        .hero-image-wrapper {
          position: relative;
          padding: 20px;
        }

        .hero-image-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #8B1538, #D4AF37);
          border-radius: 30px;
          transform: rotate(-6deg);
          z-index: -1;
        }

        .hero-image img {
          width: 100%;
          max-width: 550px;
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .section {
          padding: 6rem 0;
        }

        .section-bg {
          background: linear-gradient(180deg, #fff 0%, #FFF8F0 100%);
        }

        .section-title-wrapper {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-subtitle {
          color: #8B1538;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 800;
          color: #1a1a1a;
          font-family: 'Playfair Display', serif;
          margin-bottom: 1rem;
        }

        .section-description {
          color: #6B7280;
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 30px;
          border: 2px dashed rgba(139, 21, 56, 0.2);
          transition: all 0.3s ease;
        }

        .empty-state:hover {
          border-color: #8B1538;
          box-shadow: 0 8px 32px rgba(139, 21, 56, 0.1);
        }

        .empty-icon {
          margin: 0 auto 1.5rem;
          color: #8B1538;
        }

        .empty-state p {
          color: #6B7280;
          font-size: 1.125rem;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
        }

        .team-card {
          background: white;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(139, 21, 56, 0.08);
          transition: all 0.4s ease;
          position: relative;
        }

        .team-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #8B1538, #D4AF37);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .team-card:hover::before {
          transform: scaleX(1);
        }

        .team-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 60px rgba(139, 21, 56, 0.2);
        }

        .team-image-wrapper {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1;
        }

        .team-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .team-card:hover .team-image {
          transform: scale(1.1);
        }

        .team-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(139, 21, 56, 0.9) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .team-card:hover .team-overlay {
          opacity: 1;
        }

        .team-social {
          position: absolute;
          bottom: 1.5rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 1rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }

        .team-card:hover .team-social {
          opacity: 1;
          transform: translateY(0);
        }

        .social-link {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          color: #8B1538;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .social-link:hover {
          background: #D4AF37;
          color: white;
          transform: scale(1.1);
        }

        .team-info {
          padding: 2rem;
          text-align: center;
        }

        .team-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #1a1a1a;
          font-family: 'Playfair Display', serif;
        }

        .team-role {
          color: #8B1538;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .team-id {
          color: #6B7280;
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
          background: #F3F4F6;
          border-radius: 20px;
          display: inline-block;
        }

        .footer {
          background: linear-gradient(135deg, #5D0E26 0%, #1a1a1a 100%);
          color: rgba(255, 255, 255, 0.8);
          padding: 4rem 0 2rem;
          position: relative;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #8B1538, #D4AF37);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer h3 {
          color: white;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          font-family: 'Playfair Display', serif;
        }

        .footer h4 {
          color: white;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .footer p {
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-links {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 0.75rem;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer-links a:hover {
          color: #D4AF37;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-links a {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: white;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .social-links a:hover {
          background: #D4AF37;
          transform: translateY(-4px);
        }

        .footer-copyright {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 2rem;
          text-align: center;
        }

        .scroll-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #8B1538, #5D0E26);
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(139, 21, 56, 0.4);
          transition: all 0.3s ease;
          z-index: 999;
        }

        .scroll-top:hover {
          transform: translateY(-4px) scale(1.1);
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-desktop {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .section-title {
            font-size: 2rem;
          }

          .hero-content h1 {
            font-size: 2rem;
          }

          .team-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div>
        <div className="progress-bar" style={{ width: `${scrollProgress}%` }}></div>

        <header className="header">
          <div className="container">
            <div className="header-content">
              <a href="#hero" className="logo" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s" alt="Logo" />
                <h1>SITA-BI</h1>
              </a>

              <nav className="nav-desktop">
                <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`}>Home</a>
                <a href="#tawarantopik" onClick={(e) => { e.preventDefault(); scrollToSection('tawarantopik'); }} className={`nav-link ${activeSection === 'tawarantopik' ? 'active' : ''}`}>Tawaran Topik</a>
                <a href="#jadwal" onClick={(e) => { e.preventDefault(); scrollToSection('jadwal'); }} className={`nav-link ${activeSection === 'jadwal' ? 'active' : ''}`}>Jadwal</a>
                <a href="#pengumuman" onClick={(e) => { e.preventDefault(); scrollToSection('pengumuman'); }} className={`nav-link ${activeSection === 'pengumuman' ? 'active' : ''}`}>Pengumuman</a>
                <a href="#team" onClick={(e) => { e.preventDefault(); scrollToSection('team'); }} className={`nav-link ${activeSection === 'team' ? 'active' : ''}`}>Team</a>
                <a href="/login" className="btn-login">Login</a>
              </nav>

              <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
              <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="nav-link">Home</a>
              <a href="#tawarantopik" onClick={(e) => { e.preventDefault(); scrollToSection('tawarantopik'); }} className="nav-link">Tawaran Topik</a>
              <a href="#jadwal" onClick={(e) => { e.preventDefault(); scrollToSection('jadwal'); }} className="nav-link">Jadwal</a>
              <a href="#pengumuman" onClick={(e) => { e.preventDefault(); scrollToSection('pengumuman'); }} className="nav-link">Pengumuman</a>
              <a href="#team" onClick={(e) => { e.preventDefault(); scrollToSection('team'); }} className="nav-link">Team</a>
              <a href="/login" className="btn-login">Login</a>
            </nav>
          </div>
        </header>

        <section id="hero" className="hero">
          <div className="container">
            <div className="hero-grid">
              <div className="hero-content">
                <span className="hero-badge">✨ Welcome to SITA-BI</span>
                <h1>
                  Your <span className="hero-gradient-text">Ultimate Solution</span> for Managing Thesis Projects
                </h1>
                <p className="hero-highlight">
                  Stay organized, stay on track, and achieve your academic goals with ease. Transform your thesis journey into a seamless experience.
                </p>
                <div className="hero-buttons">
                  <a href="#" className="btn-primary">Get Started</a>
                  <a href="#" className="btn-outline">Learn More</a>
                </div>
              </div>
              <div className="hero-image">
                <div className="hero-image-wrapper">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s" alt="Illustration" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tawarantopik" className="section">
          <div className="container">
            <div className="section-title-wrapper">
              <p className="section-subtitle">Explore Topics</p>
              <h2 className="section-title">Tawaran Topik</h2>
              <p className="section-description">Temukan topik penelitian yang sesuai dengan minat dan kebutuhan Anda</p>
            </div>
            <div className="empty-state">
              <BookOpen size={80} className="empty-icon" />
              <p>Belum ada tawaran topik yang tersedia saat ini.</p>
            </div>
          </div>
        </section>

        <section id="jadwal" className="section section-bg">
          <div className="container">
            <div className="section-title-wrapper">
              <p className="section-subtitle">Schedule</p>
              <h2 className="section-title">Jadwal Sidang</h2>
              <p className="section-description">Pantau jadwal sidang Anda dengan mudah dan tetap terorganisir</p>
            </div>
            <div className="empty-state">
              <GraduationCap size={80} className="empty-icon" />
              <p>Belum ada jadwal untuk ditampilkan.</p>
            </div>
          </div>
        </section>

        <section id="pengumuman" className="section">
          <div className="container">
            <div className="section-title-wrapper">
              <p className="section-subtitle">Announcements</p>
              <h2 className="section-title">Pengumuman</h2>
              <p className="section-description">Dapatkan informasi terbaru dan penting seputar kegiatan akademik</p>
            </div>
            <div className="empty-state">
              <Megaphone size={80} className="empty-icon" />
              <p>Belum ada pengumuman untuk ditampilkan.</p>
            </div>
          </div>
        </section>

        <section id="team" className="section section-bg">
          <div className="container">
            <div className="section-title-wrapper">
              <p className="section-subtitle">Meet Our Team</p>
              <h2 className="section-title">Team 7</h2>
              <p className="section-description">Tim pengembang yang berdedikasi untuk menciptakan solusi terbaik</p>
            </div>
            <div className="team-grid">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="team-card">
                  <div className="team-image-wrapper">
                    <img src={member.image} alt={member.name} className="team-image" />
                    <div className="team-overlay"></div>
                    <div className="team-social">
                      <a href="#" className="social-link">
                        <Twitter size={18} />
                      </a>
                      <a href="#" className="social-link">
                        <Github size={18} />
                      </a>
                      <a href="#" className="social-link">
                        <Instagram size={18} />
                      </a>
                      <a href="#" className="social-link">
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                  <div className="team-info">
                    <h4 className="team-name">{member.name}</h4>
                    <p className="team-role">{member.role}</p>
                    <p className="team-id">{member.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div>
                <h3>SITA-BI</h3>
                <p><MapPin size={18} />Jalan Limau Manis</p>
                <p>Limau Manis, Kecamatan Pauh, Kota Padang, 25164</p>
                <p style={{ marginTop: '1rem' }}><Phone size={18} /><strong>Phone:</strong> 0751-72590</p>
                <p><Mail size={18} /><strong>Email:</strong> info@pnp.ac.id</p>
              </div>
              <div>
                <h4>Useful Links</h4>
                <ul className="footer-links">
                  <li><a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</a></li>
                  <li><a href="#pengumuman" onClick={(e) => { e.preventDefault(); scrollToSection('pengumuman'); }}>Pengumuman</a></li>
                  <li><a href="#jadwal" onClick={(e) => { e.preventDefault(); scrollToSection('jadwal'); }}>Jadwal</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="scroll-top">
            ↑
          </button>
        )}
      </div>
    </>
  );
}