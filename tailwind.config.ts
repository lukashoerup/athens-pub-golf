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
        // Surfaces — warm parchment / cream
        'parchment': '#F2EBDD',          // primary background (warm cream)
        'parchment-light': '#F8F2E5',     // cards, slightly lighter
        'parchment-dark': '#ECE4D2',      // sections, slightly darker
        'ink': '#1A2438',                // deep navy ink (text, CTAs)
        'ink-deep': '#0F1722',            // darker navy for deep contrast

        // Antique gold accents
        'gold': '#B89A60',                // muted antique gold
        'gold-soft': '#D4BD85',           // lighter gold tint

        // Score / status colors
        'olive': '#5C6B3C',               // good — under average
        'wine': '#9B3F36',                // bad — over by a lot

        // Ink hierarchy
        'ink-secondary': '#4A5568',
        'ink-muted': '#8B8579',           // warm tan-grey
        'ink-faint': '#B5AC9A',           // very faint tan-grey for hints

        // Hairline rules
        'rule': '#D8D2C5',                // hairline gray-tan
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        widest: '0.18em',
        ultra: '0.32em',
      },
      boxShadow: {
        none: 'none',
        soft: '0 1px 0 rgba(26, 36, 56, 0.04)',
      },
      borderRadius: {
        none: '0',
        DEFAULT: '2px',
        md: '4px',
        lg: '6px',
      },
    },
  },
  plugins: [],
}

export default config
