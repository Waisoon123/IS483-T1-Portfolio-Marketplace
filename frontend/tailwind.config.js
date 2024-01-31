/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
      button: {
        hovergreen: '#166534',
        hoverred: '#b91c1c',
      },
    },
  },
  plugins: [],
};