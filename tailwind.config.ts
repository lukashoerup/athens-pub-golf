import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FAF6F0',
        'bg-card': '#FFFFFF',
        'bg-elevated': '#F0E9DE',
        'bg-hero': '#2C1810',
        'accent-primary': '#C4841D',
        'accent-warm': '#A0522D',
        'accent-olive': '#5C6B3C',
        'accent-navy': '#1B365D',
        'score-great': '#2D6A30',
        'score-ok': '#7D6C2A',
        'score-bad': '#A63D2F',
        'text-primary': '#1A1207',
        'text-secondary': '#5C4F3A',
        'text-muted': '#8C7E6A',
        'text-on-dark': '#FAF6F0',
        border: '#D9CEBD',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(44, 24, 16, 0.08)',
        'card-lg': '0 4px 20px rgba(44, 24, 16, 0.12)',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}

export default config
