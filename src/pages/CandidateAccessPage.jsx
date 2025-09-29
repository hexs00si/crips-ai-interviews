import { candidateAccessData } from '@/data/candidateAccess';

export function CandidateAccessPage() {
  const { title, comingSoon } = candidateAccessData;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">{comingSoon.message}</p>
      </div>
    </div>
  );
}