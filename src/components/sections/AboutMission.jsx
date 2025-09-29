import { aboutData } from '@/data/about';

export function AboutMission() {
  const { mission } = aboutData;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{mission.title}</h2>
      <p className="text-gray-600 leading-relaxed">{mission.description}</p>
    </div>
  );
}