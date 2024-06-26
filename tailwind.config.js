/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:
      {
        'Butterfly1': '#FF4066',
        'Butterfly2': '#FFF16A',
        //=============DARK PALETTE==================//
        'Background': '#121212',
        'Surface': '#292929',
        'Primary': '#BB86FC',
        'Primary-v': '#3700B3',
        'Secondary': '#03DAC6',
        'ERROR': '#CF6679',
        'On-Surface': '#414141',

      },
      gridTemplateColumns: {
        'custom': 'auto auto 179px',
      },
    },
  },
  plugins: [],
}

