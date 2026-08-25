/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f5ff',
          100: '#e6ebff',
          200: '#c2ceff',
          300: '#9db0ff',
          400: '#5b78ff',
          500: '#3452fb',
          600: '#233ce0',
          700: '#1c2fb0',
          800: '#182689',
          900: '#151f66'
        }
      }
    }
  },
  plugins: []
};
