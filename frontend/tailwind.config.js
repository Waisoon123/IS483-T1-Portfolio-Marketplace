/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Montserrat', 'sans-serif'],
      }
    },
    colors: {
      primary: '#EAEFFD', //Background
      secondary: {
        100: '#C4D4FA', // Filter BackDrop Panel
        200: '#5D85F0', // Filter Icon
        300: '#2E62EC', //Indicators / Social Media Icons
      },
      // update colors,if used, here
      red: '#dc2626',
      modalError: '#FFECE8',
      modalErrorBorder: '#BF6A55',
      modalSuccess: '#EFFFE8',
      modalSuccessBorder: '#B9E2A7',
      green: '#16a34a',
      black: '#000000',
      white: '#ffffff',
      button: {
        hovergreen: '#166534',
        hoverred: '#b91c1c',
        hoverUpdate: '#1a468b',
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
      'gray': {
        '100': '#f5f5f5',
        '200': '#eeeeee',
        '300': '#e0e0e0',
        '400': '#bdbdbd',
        '500': '#9e9e9e',
        '600': '#757575',
        '700': '#616161',
        '800': '#424242',
        '900': '#212121',
      },
    },
  },
  plugins: [],
};