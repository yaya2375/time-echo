import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wechat: {
          green: '#07C160',
          'green-dark': '#06AD56',
          bg: '#EDEDED',
          'bg-dark': '#1A1A1A',
          card: '#FFFFFF',
          'card-dark': '#2C2C2C',
          text: '#191919',
          'text-secondary': '#888888',
          'text-dark': '#E5E5E5',
          bubble: '#95EC69',
          'bubble-dark': '#3A3A3A',
          link: '#576B95',
          divider: '#E5E5E5',
        },
      },
      maxWidth: {
        phone: '430px',
      },
      height: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
    },
  },
  plugins: [],
} satisfies Config;
