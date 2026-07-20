// NativeWind / Tailwind configuration mapping design tokens to utility classes.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#6D28D9',
        secondary: '#F97316',
        background: '#FFFFFF',
        surface: '#FAFAFC',
        border: '#E7E5F0',
        'text-primary': '#141026',
        'text-secondary': '#6B6480',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
