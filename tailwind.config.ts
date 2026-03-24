import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cave: {
          black: '#0A0A08',
          dark: '#1A1812',
        },
        salt: {
          pink: '#D4967A',
          glow: '#F0D4B8',
          warm: '#E8C4A0',
        },
        text: {
          primary: '#E8E0D4',
          secondary: '#9C9486',
          muted: '#6B645A',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
