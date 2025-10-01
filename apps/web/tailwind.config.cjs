/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#800000',
          '50': '#f2e6e6',
          '100': '#e6cccc',
          '200': '#d9b3b3',
          '300': '#cc9999',
          '400': '#bf8080',
          '500': '#b36666',
          '600': '#a64d4d',
          '700': '#993333',
          '800': '#8c1a1a',
          '900': '#800000',
        },
      },
    },
  },
  plugins: [],
};
