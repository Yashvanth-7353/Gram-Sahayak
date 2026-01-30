// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      colors: {
        // Governance Greens
        earth: {
          50: '#F5F7F5',
          100: '#E6EBE7',
          800: '#2C4A3E',
          900: '#1A2F25', 
        },
        // Brick & Clay Accents
        clay: {
          400: '#F4A261',
          500: '#E76F51', 
          600: '#C8553D',
        },
        // Warm Backgrounds
        sand: {
          50: '#FDFCF8',
          100: '#F7F5EE',
          200: '#EAE7DC',
          300: '#D8D4C5',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      }
    },
  },
  plugins: [],
}