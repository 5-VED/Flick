/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        flick: {
          yellow: '#FFD700',
          'yellow-dark': '#E6C200',
          'yellow-glow': 'rgba(255,215,0,0.35)',
          black: '#1A1A1A',
          card: '#222222',
          card2: '#2A2A2A',
          card3: '#333333',
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
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'radar-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,215,0,0.3)' },
          '50%': { boxShadow: '0 0 50px rgba(255,215,0,0.7)' },
        },
        'draw-route': {
          '0%': { strokeDashoffset: '600' },
          '100%': { strokeDashoffset: '0' },
        },
        'captain-move': {
          '0%': { transform: 'translate(0px, 0px)' },
          '25%': { transform: 'translate(5px, -8px)' },
          '50%': { transform: 'translate(12px, -15px)' },
          '75%': { transform: 'translate(18px, -10px)' },
          '100%': { transform: 'translate(22px, -18px)' },
        },
        'dots-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.215,0.61,0.355,1) infinite',
        'radar-spin': 'radar-spin 3s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-down': 'slide-down 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.3s ease both',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'draw-route': 'draw-route 1.5s ease-out forwards',
        'captain-move': 'captain-move 8s ease-in-out infinite alternate',
        'dots-bounce': 'dots-bounce 1.4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
