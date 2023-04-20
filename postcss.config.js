// module.exports = {
//   plugins: {
//     tailwindcss: {},
//     autoprefixer: {},
//   },
// };

const nested = require('postcss-nested');

module.exports = {
  plugins: [require('tailwindcss'), nested(), require('autoprefixer')],
};
