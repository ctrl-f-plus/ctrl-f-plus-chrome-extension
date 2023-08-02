// // tailwind.config.js;

// module.exports = {
//   content: ['./src/**/*.{js,jsx,ts,tsx}'],
//   theme: {
//     extend: {},
//   },
//   variants: {
//     extend: {
//       backgroundColor: ['disabled', 'group-hover'],
//       textColor: ['disabled', 'group-hover'],
//       opacity: ['disabled'],
//     },
//   },
//   plugins: [],
//   important: true,
//   // prefix: 'ctrl-',
// };

module.exports = {
  // darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // safelist: [
  //   {
  //     pattern:
  //       /bg-(gray|red|green|blue|purple|)-(100|200|300|400|500|600|700|800|900)/,
  //   },
  //   'flex-row',
  //   'flex-row-reverse',
  //   'flex-col',
  //   'flex-col-reverse',

  //   // Display classes
  //   'block',
  //   'inline-block',
  //   'inline',
  //   'flex',
  //   'inline-flex',
  //   'table',
  //   'inline-table',
  //   'table-caption',
  //   'table-cell',
  //   'table-column',
  //   'table-column-group',
  //   'table-footer-group',
  //   'table-header-group',
  //   'table-row-group',
  //   'table-row',
  //   'flow-root',
  //   'grid',
  //   'inline-grid',
  //   'contents',
  //   'list-item',
  //   'hidden',
  // ],
  theme: {
    extend: {
      fontSize: {
        'base-pp': '16px',
      },
      lineHeight: {
        'leading-6-pp': '24px',
      },

      colors: {
        bittersweet: {
          DEFAULT: '#ff6960',
          50: '#fff0f0',
          100: '#ffe2e0',
          200: '#ffc5c2',
          300: '#ffa39e',
          400: '#ff8680',
          500: '#ff6960',
          600: '#ff251a',
          700: '#d10a00',
          800: '#8f0700',
          900: '#470400',
          950: '#240200',
        },
        'cod-gray': {
          DEFAULT: '#121212',
          50: '#ebebeb',
          100: '#d9d9d9',
          200: '#b0b0b0',
          300: '#8a8a8a',
          400: '#616161',
          500: '#3b3b3b',
          600: '#121212',
          700: '#0d0d0d',
          800: '#0a0a0a',
          900: '#050505',
          950: '#030303',
        },
      },
    },
  },
  plugins: [],
  important: true,
  variants: {},
  corePlugins: {
    preflight: true,
  },
};
