import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: { 500: '#F26A1F', 600: '#D85A15' },
      },
    },
  },
  plugins: [],
}

export default config
