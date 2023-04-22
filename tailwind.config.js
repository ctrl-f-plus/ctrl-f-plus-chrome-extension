// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [require('tailwindcss'), require('autoprefixer')],
// };

// tailwind.config.js

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
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
  plugins: [],
};
