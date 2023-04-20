// src/contentScripts/contentStyles.ts

// #17a2b8
const contentStyles = `
.ctrl-f-highlight {
  background-color: #128da1 !important;
  color: #010100;

  /*padding: 1px 2px;*/
  border-radius: 0.25rem;
  border-width: 1px;
  border-style: solid;
  border-color: #128da1;
  /*box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); */ /*Tailwind: .box-shadow-small */
}

.ctrl-f-highlight-focus {
  background-color: #05fdb4 !important;
  /*color: white;*/

  /*padding: 1px 2px;*/
  border-width: 1px;
  border-style: solid;
  border-color: #05fdb4;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /*Tailwind: .box-shadow-medium */
}
`;

export default contentStyles;

// box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 15px;
// border-width: 2px;
// border-style: solid;
// border-color: #20c997;
// border-image: initial;
