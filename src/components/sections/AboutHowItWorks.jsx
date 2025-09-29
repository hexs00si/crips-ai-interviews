import { aboutData } from '@/data/about';

export function AboutHowItWorks() {
  const { howItWorks } = aboutData;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{howItWorks.title}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {howItWorks.sections.map((section) => (
          <div
            key={section.id}
            className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200"
          >
            <h3 className="text-lg font-semibold text-primary-600 mb-3">{section.title}</h3>
            <ul className="text-gray-600 space-y-2">
              {section.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}