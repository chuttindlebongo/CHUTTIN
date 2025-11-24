/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#FFD700',
          50: '#FFFEF5',
          100: '#FFFCEB',
          200: '#FFF7CC',
          300: '#FFF2AD',
          400: '#FFED8F',
          500: '#FFD700',
          600: '#E6C200',
          700: '#CCA000',
          800: '#997800',
          900: '#665000',
        },
      },
    },
  },
  plugins: [],
};
