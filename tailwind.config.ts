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
        // Surfaces — clean white with subtle blue tints
        'bg-primary': '#F6FAFD',
        'bg-card': '#FFFFFF',
        'bg-elevated': '#E8F1FA',
        'bg-hero': '#0D5EAF',          // Greek flag blue
        'bg-hero-deep': '#073D7A',     // Deeper navy for layered contrast

        // Accents
        'accent-primary': '#D4A24C',   // Ancient gold (highlights, buttons)
        'accent-warm': '#A23F3F',      // Wine red (red-figure pottery)
        'accent-olive': '#5C6B3C',     // Olive grove
        'accent-marble': '#EFEAD9',    // Marble / parchment
        'accent-blue': '#0D5EAF',      // Greek flag blue, for accents

        // Score colors (kept for clarity but harmonized with palette)
        'score-great': '#2D6A30',
        'score-ok': '#B8893E',
        'score-bad': '#A23F3F',

        // Text
        'text-primary': '#0E2240',     // Deep navy ink
        'text-secondary': '#3D4D6B',
        'text-muted': '#7989A3',
        'text-on-dark': '#F6FAFD',

        // Borders
        border: '#CDDAE8',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(13, 94, 175, 0.08)',
        'card-lg': '0 6px 24px rgba(13, 94, 175, 0.14)',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}

export default config
