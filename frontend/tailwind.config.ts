import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Slack purple — primary brand
        brand: {
          DEFAULT: '#4A154B',
          50: '#F7F0F7',
          100: '#EAD9EB',
          200: '#D2B3D4',
          300: '#B98DBD',
          400: '#A067A6',
          500: '#874090',
          600: '#6B2B72',
          700: '#4A154B',
          800: '#380F39',
          900: '#260A28',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
