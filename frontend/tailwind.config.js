/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          dark: '#060D1A',
          base: '#0A1425',
          sidebar: '#0B1830',
          card: '#0D1B32',
          cardhover: '#11223F',
          border: '#1A3558',
          borderlight: '#234674'
        },
        cyber: {
          cyan: '#00C8FF',
          blue: '#2585FF',
          green: '#00D68F',
          red: '#FF405B',
          orange: '#FF9F32',
          purple: '#925CFF',
          text: '#EAF2FF',
          muted: '#91A4C2'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(0, 200, 255, 0.3)',
        'glow-blue': '0 0 15px -3px rgba(37, 133, 255, 0.3)',
        'glow-red': '0 0 15px -3px rgba(255, 64, 91, 0.3)',
        'glow-green': '0 0 15px -3px rgba(0, 214, 143, 0.3)',
        'card': '0 4px 20px -2px rgba(2, 6, 15, 0.7)'
      }
    },
  },
  plugins: [],
}
