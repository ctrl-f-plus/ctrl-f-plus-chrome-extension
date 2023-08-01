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
  // purge: false,
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // safelist: [
  //   {
  //     pattern:
  //       /bg-(red|green|blue|purple)-(100|200|300|400|500|600|700|800|900)/,
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
    extend: {},
  },
  plugins: [],
  important: true,
  variants: {},
  corePlugins: {
    preflight: true,
  },
};
