import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', 'class'],
  theme: {
  	extend: {
  		fontFamily: {
  			serif: [
  				'var(--font-serif)',
  				'Georgia',
  				'Times New Roman',
  				'serif'
  			],
  			sans: [
  				'var(--font-sans)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'monospace'
  			]
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.4s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(4px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  safelist: [
    // topic label text colours (muted editorial palette)
    'text-blue-800', 'text-violet-800', 'text-emerald-800',
    'text-amber-800', 'text-rose-800', 'text-teal-800',
    'dark:text-blue-300', 'dark:text-violet-300', 'dark:text-emerald-300',
    'dark:text-amber-300', 'dark:text-rose-300', 'dark:text-teal-300',
    // topic dot colours
    'bg-blue-700', 'bg-violet-700', 'bg-emerald-700',
    'bg-amber-700', 'bg-rose-700', 'bg-teal-700',
    'dark:bg-blue-400', 'dark:bg-violet-400', 'dark:bg-emerald-400',
    'dark:bg-amber-400', 'dark:bg-rose-400', 'dark:bg-teal-400',
  ],
  plugins: [require("tailwindcss-animate")],
};

export default config;
