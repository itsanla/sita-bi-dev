// Server Component - No 'use client' needed
import { Suspense } from 'react';
import { TeamCardSkeleton } from '../Suspense/LoadingFallback';
import TeamMemberCard from './TeamMemberCard';

interface TeamMember {
  name: string;
  role: string;
  id: string;
  image: string;
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
}

export default function TeamSection({ teamMembers }: TeamSectionProps) {
  return (
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
            <Suspense key={idx} fallback={<TeamCardSkeleton />}>
              <TeamMemberCard member={member} index={idx} />
            </Suspense>
          ))}
        </div>
      </div>
    </section>
  );
}
