import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4AF37',
          light: '#C59B27',
        },
        secondary: {
          DEFAULT: '#FDFBF7',
          light: '#F5EFEB',
        },
        accent: {
          DEFAULT: '#E07A5F',
          light: '#E89888',
        },
        dark: {
          DEFAULT: '#2D2A26',
        },
      },
    },
  },
  plugins: [],
};

export default config;
