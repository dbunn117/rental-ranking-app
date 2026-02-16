import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#faf8f5',
          100: '#f2ede6',
          200: '#e8dfd2',
          300: '#d4c4ad',
        },
        sea: {
          600: '#0d5c7a',
          700: '#0a4a62',
          800: '#083849',
          900: '#052735',
        },
      },
      boxShadow: {
        card: '0 4px 20px rgba(13, 92, 122, 0.08), 0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 40px rgba(13, 92, 122, 0.12), 0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
export default config
