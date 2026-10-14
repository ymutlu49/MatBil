/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Oyunlarda kullanılan ama Tailwind 3'te varsayılan olarak bulunmayan ölçüler (w-18, h-18, border-3)
      spacing: { 18: '4.5rem' },
      borderWidth: { 3: '3px' },
    },
  },
  plugins: [],
};
