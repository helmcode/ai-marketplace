/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a2e',
        },
        accent: {
          primary: '#8b5cf6',
          secondary: '#a78bfa',
          glow: '#c4b5fd',
          dark: '#6d28d9',
        },
        surface: {
          DEFAULT: '#16161f',
          hover: '#1e1e2d',
          border: '#2d2d3d',
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-accent': 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
