// tailwind.config.js;

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ['disabled', 'group-hover'],
      textColor: ['disabled', 'group-hover'],
      opacity: ['disabled'],
      // fontFamily: {
      //   'open-sans': ['Open Sans', 'sans-serif'],
      // },
    },
  },
  plugins: [],
  important: true,
  prefix: 'ctrl-',
};
