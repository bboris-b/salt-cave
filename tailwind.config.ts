import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cave: {
          black: '#0A0A08',
          dark: '#1A1812',
          charcoal: '#2C2A24',
        },
        salt: {
          pink: '#D4967A',
          glow: '#F0D4B8',
          warm: '#E8C4A0',
          amber: '#C8874F',
        },
        text: {
          primary: '#E8E0D4',
          secondary: '#9C9486',
          muted: '#6B645A',
        },
        accent: {
          cta: '#D4967A',
          'cta-hover': '#E0A88F',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
