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
.ctrl-f-highlight {
  background-color: green !important;
}

.ctrl-f-highlight-focus {
  background-color: red !important;;
}
`;

module.exports = contentStyles;
