/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        flick: {
          yellow: '#FFD700',
          'yellow-dark': '#E6C200',
          black: '#1A1A1A',
          card: '#222222',
          card2: '#2A2A2A',
          border: '#3A3A3A',
          muted: '#888888',
          dim: '#555555',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'cursive'],
        body: ['DM Sans', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.32s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.2s ease both',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
