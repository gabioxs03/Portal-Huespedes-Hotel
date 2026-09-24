/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10283D',
        deepblue: '#1B4665',
        steel: '#6F8EA3',
        champagne: '#C9A564',
        ivory: '#F7F5F0',
        stone: '#D5E0E7',
        mist: '#EAF1F5'
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        luxury: '0 16px 38px rgba(22, 43, 62, 0.14)'
      }
    }
  },
  plugins: []
}
