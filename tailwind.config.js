module.exports = {
  darkMode: 'class',

  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },

    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1232px',
      },
    },

    extend: {
      colors: {
        gray: '#ECECEC',
        dark: '#000310',
        darkBlue: '#303A66',
        darkMoreBlue: '#151C3D',
        darkgray: '#676767',
      },
    },
  },
};
