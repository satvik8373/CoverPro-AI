/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0f0f1a',
        neon: '#00d4ff',
        violet: '#6c5ce7',
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0, 212, 255, 0.15)',
      },
    },
  },
  plugins: [],
};
