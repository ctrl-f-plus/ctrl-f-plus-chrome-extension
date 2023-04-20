// src/contentScripts/contentStyles.ts

// light= #05fdb4
// dark = #128da1

const contentStyles = `
.ctrl-f-highlight {
  background-color: #128da1 !important;
  color: #010100;
  border-radius: 0.25rem;
  border-width: 1px;
  border-style: solid;
  border-color: #128da1;
}

.ctrl-f-highlight-focus {
  background-color: #05fdb4 !important;
  border-color: #05fdb4;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /*Tailwind: .box-shadow-medium */
}
`;

export default contentStyles;
