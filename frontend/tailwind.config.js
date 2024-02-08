/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    colors: {
      primary: '#EAEFFD', //Background
      secondary: {
        100: '#C4D4FA', // Filter BackDrop Panel
        200: '#5D85F0', // Filter Icon
        300: '#2E62EC', //Indicators / Social Media Icons
      },
      // update colors,if used, here
      red: '#dc2626',
      green: '#16a34a',
      black: '#000000',
      white: '#ffffff',
      button: {
        hovergreen: '#166534',
        hoverred: '#b91c1c',
      },
      'indigo': {
        '50': '#EEF2FF',
        '100': '#E0E7FF',
        '200': '#C7D2FE',
        '300': '#A5B4FC',
        '400': '#818CF8',
        '500': '#6366F1',
        '600': '#4F46E5',
        '700': '#4338CA',
        '800': '#3730A3',
        '900': '#312E81',
      },
    },
  },
  plugins: [],
};