/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
  ],
  safelist: [
    // Safelist common dark mode and gradient classes from package
    'dark:bg-gray-900',
    'dark:bg-slate-900',
    'dark:bg-slate-800',
    'dark:text-white',
    'dark:text-slate-400',
    'dark:border-slate-700',
    'dark:prose-invert',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'progress-fill': 'progressFill 3s ease-in-out infinite',
        'pulse-ring': 'pulseRing 1.8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        shimmer: 'shimmer 2s ease-in-out infinite',
        'slide-in-from-left': 'slideInFromLeft 0.3s ease-out',
        'slide-up-full': 'slideUpFull 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      animationDelay: {
        150: '150ms',
        700: '700ms',
      },
      backgroundImage: {
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        btn: '6px',
        pill: '32px',
      },
      boxShadow: {
        'btn-dark': '0 4px 0 0 var(--color-white)',
        'btn-light': '0 4px 0 0 var(--color-brand-text)',
        'focus-brand': '0 0 0 2px var(--color-shadow-focus-brand)',
        'focus-error': '0 0 0 2px var(--color-shadow-focus-error)',
        'glow-bluePurple':
          '0 0 18px var(--color-shadow-glow-blue), 0 0 32px var(--color-shadow-glow-purple)',
      },
      colors: {
        accent: {
          cyan: 'var(--color-accent-cyan)',
          'cyan-hover': 'var(--color-accent-cyan-hover)',
          primary: 'var(--color-accent-primary)',
          purple: 'var(--color-accent-purple)',
        },
        brand: {
          error: 'var(--color-brand-error)',
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          selection: 'var(--color-brand-selection)',
          surface: 'var(--color-brand-surface)',
          text: 'var(--color-brand-text)',
        },
        checkout: {
          bg: 'var(--color-checkout-bg)',
        },
        luminex: {
          bg: 'var(--color-luminex-bg)',
          border: 'var(--color-luminex-border)',
          'border-30': 'var(--color-luminex-border-30)',
          card: 'var(--color-luminex-card)',
          'card-50': 'var(--color-luminex-card-50)',
          input: 'var(--color-luminex-input)',
        },
        surface: {
          dark: 'var(--color-surface-dark)',
          light: 'var(--color-surface-light)',
        },
      },
      fontFamily: {
        display: ['Graphie', 'var(--font-poppins)', 'Poppins', 'sans-serif'],
        karla: ['var(--font-karla)', 'Karla', 'sans-serif'],
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      height: {
        input: '56px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        progressFill: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseRing: {
          '0%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.2', transform: 'scale(1.15)' },
          '100%': { opacity: '0.6', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.9' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideInFromLeft: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUpFull: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      spacing: {
        input: '56px',
      },
    },
  },
};
