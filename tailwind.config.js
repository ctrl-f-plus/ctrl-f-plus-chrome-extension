/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  // darkMode: 'class',
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ['disabled', 'group-hover'],
      textColor: ['disabled', 'group-hover'],
      opacity: ['disabled'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
  important: true,
};
