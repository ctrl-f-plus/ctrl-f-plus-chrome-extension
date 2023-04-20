// src/contentScripts/contentStyles.ts

const contentStyles = `
.ctrl-f-highlight {
  background-color: #fc8bb6 !important;
  color: #010100;

  padding: 1px 2px;
  border-radius: 0.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /*Tailwind: .box-shadow-small */
}

.ctrl-f-highlight-focus {
  background-color: #bd1a62 !important;
  color: #fffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /*Tailwind: .box-shadow-medium */
}
`;

/*padding: 2px 4px;*/
// border-width: 2px;

// .border {
//     border-top-left-radius: 5px;
//     border-bottom-left-radius: 5px;
//     border-top-right-radius: 5px;
//     border-bottom-right-radius: 5px;
// }

// .highlightly {
//     background-color: rgb(199, 151, 247);
// box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 15px;
// border-width: 2px;
// border-style: solid;
// border-color: rgb(199, 151, 247);
// border-image: initial;
// }

// const contentStyles = `
// .ctrl-f-highlight {
//   background-color: yellow;
//   color: black;
//   padding: 2px 4px;
//   border-radius: 4px;
//   box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
// }

// .ctrl-f-highlight-focus {
//   background-color: #ff9800;
//   color: white;
//   padding: 2px 4px;
//   border-radius: 4px;
//   box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);

// }
// `;

export default contentStyles;

// border-width: 2px;
//   border-style: solid;
//   border-color: red;
//   border-image: initial;
