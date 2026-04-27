/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFD700',
        surface: '#2A2A2A',
        bg: '#1A1A1A',
        muted: '#9CA3AF',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(100%)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pulse-green': { '0%,100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.6)' }, '50%': { boxShadow: '0 0 0 8px rgba(34,197,94,0)' } },
        'bounce-scale': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(0.94)' } },
        'spin-slow': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        checkmark: { '0%': { strokeDashoffset: '100' }, '100%': { strokeDashoffset: '0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16,1,0.3,1)',
        'pulse-green': 'pulse-green 2s infinite',
        'bounce-scale': 'bounce-scale 0.15s ease-in-out',
        checkmark: 'checkmark 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
