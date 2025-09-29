import { aboutData } from '@/data/about';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { useNavigate } from 'react-router-dom';

export function AboutCTA() {
  const { cta } = aboutData;
  const navigate = useNavigate();

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{cta.title}</h2>
      <p className="text-gray-600 mb-8">{cta.description}</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <RainbowButton
          onClick={() => navigate(cta.buttons.primary.href)}
          className="min-w-[200px]"
        >
          {cta.buttons.primary.text}
        </RainbowButton>
        <RainbowButton
          onClick={() => navigate(cta.buttons.secondary.href)}
          className="min-w-[200px]"
          style={{
            background: `linear-gradient(135deg,
              #6b7280 0%,
              #9ca3af 25%,
              #d1d5db 50%,
              #9ca3af 75%,
              #6b7280 100%)`,
            backgroundSize: '200% 200%',
          }}
        >
          {cta.buttons.secondary.text}
        </RainbowButton>
      </div>
    </div>
  );
}