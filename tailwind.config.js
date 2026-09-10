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
        space: {
          bg: '#0A0E1A',
          secondaryBg: '#131929',
          card: 'rgba(26, 34, 51, 0.7)',
          cardHover: 'rgba(31, 40, 64, 0.8)',
          glassBg: 'rgba(255, 255, 255, 0.05)',
          glassBorder: 'rgba(255, 255, 255, 0.12)',
          sidebar: 'rgba(13, 20, 33, 0.9)',
          header: 'rgba(10, 14, 26, 0.85)',
          border: 'rgba(255, 255, 255, 0.12)',
          primary: '#4A7CF7',
          blue: '#4A7CF7',
          cyan: '#00D4FF',
          purple: '#7C5CFC',
          pink: '#FF6B9D',
          success: '#00C897',
          warning: '#FFB800',
          danger: '#FF4757',
          textPrimary: '#FFFFFF',
          textSecondary: '#8B9BB5',
          textMuted: '#6B7B95',
          link: '#4A7CF7',
        },
        chart: {
          1: '#4A7CF7',
          2: '#00D4FF',
          3: '#7C5CFC',
          4: '#FF6B9D',
          5: '#00C897',
          6: '#FFB800',
        },
        platform: {
          youtube: '#FF4757',
          instagram: '#FF6B9D',
          tiktok: '#00D4FF',
          twitter: '#4A7CF7',
          twitch: '#7C5CFC',
          spotify: '#00C897',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #4A7CF7, #00D4FF)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))',
        'success-gradient': 'linear-gradient(135deg, #00C897, #00D4FF)',
        'animated-gradient': 'linear-gradient(135deg, #4A7CF7, #00D4FF, #7C5CFC, #FF6B9D)',
        'warning-gradient': 'linear-gradient(135deg, #FFB800, #FF6B9D)',
        'purple-gradient': 'linear-gradient(135deg, #7C5CFC, #4A7CF7)',
      },
      boxShadow: {
        glow: '0 0 25px rgba(74, 124, 247, 0.35)',
        glowBlue: '0 0 20px rgba(74, 124, 247, 0.3)',
        glowCyan: '0 0 20px rgba(0, 212, 255, 0.25)',
        glowGreen: '0 0 20px rgba(0, 200, 151, 0.25)',
        glowRed: '0 0 20px rgba(255, 71, 87, 0.25)',
        card: '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        liquidGlass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
};
