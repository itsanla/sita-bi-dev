'use client';
import React from 'react';
import Image from 'next/image';
import {
  Megaphone,
  GraduationCap,
  BookOpen,
  Github,
  Linkedin,
  Instagram,
  Twitter,
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  id: string;
  image: string;
}

interface HomeContentProps {
  teamMembers: TeamMember[];
}

export default function HomeContent({ teamMembers }: HomeContentProps) {
  return (
    <main>
      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen flex items-center bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-24"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-gradient-to-r from-red-900 to-red-700 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                ✨ Welcome to SITA-BI
              </span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
                Your{' '}
                <span className="bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">
                  Ultimate Solution
                </span>{' '}
                for Managing Thesis Projects
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Stay organized, stay on track, and achieve your academic goals
                with ease. Transform your thesis journey into a seamless
                experience.
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
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB48qcI4RmLRUfQqoGwJb6GIM7SqYE9rcBg&s"
                alt="Illustration"
                width={512}
                height={512}
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
            <p className="text-red-900 font-semibold text-sm uppercase tracking-widest mb-4">
              Explore Topics
            </p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Tawaran Topik
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Temukan topik penelitian yang sesuai dengan minat dan kebutuhan
              Anda
            </p>
          </div>
          <div className="text-center p-16 bg-white rounded-3xl border-2 border-dashed border-red-900/20 hover:border-red-900 hover:shadow-2xl transition-all">
            <BookOpen size={80} className="mx-auto mb-6 text-red-900" />
            <p className="text-xl text-gray-600">
              Belum ada tawaran topik yang tersedia saat ini.
            </p>
          </div>
        </div>
      </section>

      {/* Jadwal Section */}
      <section
        id="jadwal"
        className="py-24 bg-gradient-to-b from-white to-orange-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-red-900 font-semibold text-sm uppercase tracking-widest mb-4">
              Schedule
            </p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Jadwal Sidang
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pantau jadwal sidang Anda dengan mudah dan tetap terorganisir
            </p>
          </div>
          <div className="text-center p-16 bg-white rounded-3xl border-2 border-dashed border-red-900/20 hover:border-red-900 hover:shadow-2xl transition-all">
            <GraduationCap size={80} className="mx-auto mb-6 text-red-900" />
            <p className="text-xl text-gray-600">
              Belum ada jadwal untuk ditampilkan.
            </p>
          </div>
        </div>
      </section>

      {/* Pengumuman Section */}
      <section id="pengumuman" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-red-900 font-semibold text-sm uppercase tracking-widest mb-4">
              Announcements
            </p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Pengumuman
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dapatkan informasi terbaru dan penting seputar kegiatan akademik
            </p>
          </div>
          <div className="text-center p-16 bg-white rounded-3xl border-2 border-dashed border-red-900/20 hover:border-red-900 hover:shadow-2xl transition-all">
            <Megaphone size={80} className="mx-auto mb-6 text-red-900" />
            <p className="text-xl text-gray-600">
              Belum ada pengumuman untuk ditampilkan.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="py-24 bg-gradient-to-b from-white to-orange-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-red-900 font-semibold text-sm uppercase tracking-widest mb-4">
              Meet Our Team
            </p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Team 7</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tim pengembang yang berdedikasi untuk menciptakan solusi terbaik
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-900 to-yellow-600 scale-x-0 group-hover:scale-x-100 transition-transform" />
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 opacity-0 translate-y-5 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <a
                      href="#"
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors"
                    >
                      <Twitter size={18} />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors"
                    >
                      <Github size={18} />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors"
                    >
                      <Instagram size={18} />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors"
                    >
                      <Linkedin size={18} />
                    </a>
                  </div>
                </div>
                <div className="p-8 text-center">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h4>
                  <p className="text-red-900 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm bg-gray-100 px-4 py-2 rounded-full inline-block">
                    {member.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
