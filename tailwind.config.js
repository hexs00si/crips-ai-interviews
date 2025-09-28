/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        success: {
          500: '#10b981',
        },
        warning: {
          500: '#f59e0b',
        },
        error: {
          500: '#ef4444',
        },
        info: {
          500: '#06b6d4',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
      backgroundImage: {
        'grid-black': 'linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)',
        'dot-black': 'radial-gradient(circle, black 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
        'dot': '20px 20px',
      },
      gridTemplateColumns: {
        'grid-20': 'repeat(auto-fit, 20px)',
      },
      gridTemplateRows: {
        'grid-20': 'repeat(auto-fit, 20px)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.bg-grid-black\\/\\[0\\.05\\]': {
          'background-image': 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
          'background-size': '20px 20px',
          'background-position': '0 0, 0 0',
        },
        '.bg-dot-black\\/\\[0\\.2\\]': {
          'background-image': 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 1px, transparent 1px)',
          'background-size': '20px 20px',
          'background-position': '10px 10px',
        },
        '.grid-pattern': {
          'background-image': 'linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          'background-size': '20px 20px',
          'background-position': '0 0, 0 0',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

