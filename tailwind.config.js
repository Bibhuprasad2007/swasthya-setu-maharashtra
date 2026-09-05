/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            50: '#f0f4f8',
            100: '#d9e2ec',
            200: '#bcccdc',
            300: '#9fb3c8',
            400: '#829ab1',
            500: '#627d98',
            600: '#486581',
            700: '#334e68',
            800: '#1e3a5f',
            900: '#0f2744',
            950: '#071626',
          },
          blue: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          dark: {
            bg: '#071521',
            surface: '#0D2233',
            elevated: '#112A3D',
            border: '#294457',
            text: '#D7E4EC',
            heading: '#F4F9FC',
            muted: '#A9BDC9',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -2px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 12px 30px -5px rgba(2, 132, 199, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
        'card-hover-dark': '0 12px 30px -5px rgba(56, 189, 248, 0.15), 0 8px 16px -6px rgba(0, 0, 0, 0.5)',
        'portal-active': '0 0 0 2px #0284c7, 0 8px 20px -4px rgba(2, 132, 199, 0.25)',
      }
    },
  },
  plugins: [],
}
