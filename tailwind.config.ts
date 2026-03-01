import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        zinc: {
          925: '#111114',
          950: '#0a0a0f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  safelist: [
    // M&A — blue
    'bg-blue-500/10', 'text-blue-400', 'border-blue-500/20', 'border-l-blue-500', 'shadow-blue-500/5',
    // Capital Markets — violet
    'bg-violet-500/10', 'text-violet-400', 'border-violet-500/20', 'border-l-violet-500', 'shadow-violet-500/5',
    // Energy & Tech — emerald
    'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20', 'border-l-emerald-500', 'shadow-emerald-500/5',
    // Regulation — amber
    'bg-amber-500/10', 'text-amber-400', 'border-amber-500/20', 'border-l-amber-500', 'shadow-amber-500/5',
    // Disputes — rose
    'bg-rose-500/10', 'text-rose-400', 'border-rose-500/20', 'border-l-rose-500', 'shadow-rose-500/5',
    // International — cyan
    'bg-cyan-500/10', 'text-cyan-400', 'border-cyan-500/20', 'border-l-cyan-500', 'shadow-cyan-500/5',
  ],
  plugins: [],
};

export default config;
