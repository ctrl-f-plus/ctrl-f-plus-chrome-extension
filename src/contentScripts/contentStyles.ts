// // src/contentScripts/contentStyles.js

// const contentStyles = `
// .highlight {
//   background-color: green !important;
// }

// .highlight-red {
//   background-color: red;
// }
// `;

// export default contentStyles;

// src/contentScripts/contentStyles.js

// FIXME: ES modules, which are not yet fully supported by the content scripts in Chrome extensions

const contentStyles = `
.highlight {
  background-color: green !important;
}

.highlight-focus {
  background-color: red !important;;
}
`;

// padding: 2px;

module.exports = contentStyles;
