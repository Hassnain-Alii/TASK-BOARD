/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: '#1e293b',
        'surface-hover': '#334155',
        primary: '#6366f1',
        'primary-hover': '#4f46e5',
        danger: '#ef4444',
        success: '#10b981',
        'text-main': '#f8fafc',
        'text-muted': '#94a3b8',
        'priority-low': '#3b82f6',
        'priority-medium': '#f59e0b',
        'priority-high': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(99, 102, 241, 0.4)',
      },
      backdropBlur: {
        glass: '12px',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '50%': { transform: 'translateX(8px)' },
          '75%': { transform: 'translateX(-8px)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, -30px) scale(1.1)' },
        },
        spin: {
          'to': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        fadeIn: 'fadeIn 0.4s ease forwards',
        shimmer: 'shimmer 1.5s infinite linear',
        float: 'float 10s infinite ease-in-out',
        'float-delay': 'float 10s infinite ease-in-out -5s',
      },
    },
  },
  plugins: [],
}
