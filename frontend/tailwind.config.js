/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3A76F0', // Signal Blue approximation
          dark: '#2C5BB5',
          light: '#6B9BF5',
        },
        secondary: '#f3f4f6', // Light gray for backgrounds
        chat: {
          mine: '#3A76F0',
          theirs: '#E5E7EB',
        },
      },
    },
  },
  plugins: [],
};
