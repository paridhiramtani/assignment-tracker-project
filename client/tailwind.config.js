/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        // JLF Inspired Palette
        brand: {
          50: '#fff1f2', // Very light rose background
          100: '#ffe4e6',
          600: '#e11d48', // Vibrant Rose/Pink
          700: '#be123c', // Deep Maroon/Rose
          800: '#9f1239', // Darker Maroon
          900: '#881337', // Deepest Text Color
        },
        accent: {
          500: '#f59e0b', // Gold/Amber for highlights
        }
      }
    },
  },
  plugins: [],
}
