'use client';
import React from 'react';
import Image from 'next/image';
import { Twitter, Github, Instagram, Linkedin } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  id: string;
  image: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
}

export default function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative aspect-square overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-900 to-yellow-600 scale-x-0 group-hover:scale-x-100 transition-transform" />
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 opacity-0 translate-y-5 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors"
            aria-label="Twitter"
          >
            <Twitter size={18} />
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors"
            aria-label="Github"
          >
            <Github size={18} />
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-900 hover:bg-yellow-600 hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </div>
      <div className="p-8 text-center">
        <h4 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h4>
        <p className="text-red-900 font-semibold mb-3">{member.role}</p>
        <p className="text-gray-600 text-sm bg-gray-100 px-4 py-2 rounded-full inline-block">
          {member.id}
        </p>
      </div>
    </div>
  );
}
