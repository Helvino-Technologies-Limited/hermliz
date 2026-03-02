/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#ebf0ff', 100: '#d6e2ff', 500: '#4477e8',
          600: '#1a56db', 700: '#1342b0', 800: '#0f3190',
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
