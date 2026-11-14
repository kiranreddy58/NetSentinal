/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#070D18',
          sidebar: '#0A1424',
          header: '#0B1628',
          card: '#101D31',
          card2: '#13233B',
          border: '#20334D',
          borderHover: '#2D486B',
          cyan: '#00C8FF',
          blue: '#3185FF',
          green: '#00D68F',
          red: '#FF475D',
          orange: '#FFA33A',
          purple: '#9565FF',
          text: '#EAF1FF',
          muted: '#91A4BE'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(0, 200, 255, 0.3)',
        'glow-blue': '0 0 15px -3px rgba(49, 133, 255, 0.3)',
        'card': '0 4px 16px -2px rgba(2, 6, 15, 0.4)'
      }
    },
  },
  plugins: [],
}
