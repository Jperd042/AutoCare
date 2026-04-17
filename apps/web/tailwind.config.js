/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/screens/**/*.{js,jsx}',
    './src/hooks/**/*.{js,jsx}',
    './src/lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand (CruisersCrib logo palette) ─────────────────
        'brand-orange': 'rgb(255 122 0 / <alpha-value>)',
        'brand-gold': 'rgb(245 184 77 / <alpha-value>)',
        // ── Dark surfaces ─────────────────────────────────────
        'surface-bg': '#080C16',
        'surface-card': '#101724',
        'surface-raised': '#141F31',
        'surface-input': '#0F1726',
        'surface-hover': '#162033',
        'surface-border': '#263247',
        // ── Ink ───────────────────────────────────────────────
        'ink-primary': '#F8FAFC',
        'ink-secondary': '#CBD5E1',
        'ink-muted': '#94A3B8',
        'ink-dim': '#64748B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 40px rgba(0,0,0,0.22)',
        'card-md': '0 26px 60px rgba(0,0,0,0.32)',
        'glow-orange': '0 0 28px rgba(255,122,0,0.16)',
        'glow-sm': '0 10px 24px rgba(255,122,0,0.14)',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up':       'slide-up 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'fade-in':        'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
