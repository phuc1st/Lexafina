/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand blue — primary action, links, focus
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Accent orange — IELTS scores, streaks, highlights
        accent: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        // Sidebar dark background
        sidebar: {
          DEFAULT: '#0f172a',
          hover:   '#1e293b',
          active:  '#1e3a8a',
          border:  '#1e293b',
          text:    '#94a3b8',
          'text-active': '#ffffff',
        },
        // Surface / background tokens
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f8fafc',
          card:    '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        xs:    ['12px', '16px'],
        sm:    ['13px', '20px'],
        base:  ['14px', '22px'],
        md:    ['15px', '24px'],
        lg:    ['16px', '24px'],
        xl:    ['18px', '28px'],
        '2xl': ['20px', '30px'],
        '3xl': ['24px', '32px'],
        '4xl': ['28px', '36px'],
        '5xl': ['36px', '44px'],
      },
      borderRadius: {
        sm:   '6px',
        DEFAULT: '8px',
        md:   '10px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'20px',
        '3xl':'24px',
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-md': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'card-lg': '0 10px 24px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.07)',
        focus: '0 0 0 3px rgb(37 99 235 / 0.2)',
        'focus-accent': '0 0 0 3px rgb(249 115 22 / 0.2)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        sidebar: '240px',
        topbar: '56px',
      },
      transitionDuration: {
        150: '150ms',
        250: '250ms',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.25s ease both',
        'slide-in':   'slide-in 0.3s ease both',
        'skeleton':   'skeleton-pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
