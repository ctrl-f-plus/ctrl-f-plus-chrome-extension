// src/contentScripts/contentStyles.ts

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


body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
}

cntrl-f-extension{
    width: 400px;
    height: 100%;
    position: fixed;
    top: 0px;
    right: 0px;
    z-index: 2147483647;
    background-color: green !important;
    box-shadow: 0px 0px 5px #0000009e;

}

cntrl-f-extension iframe {
    width: 100%;
    height: 100%;
    border: none;
}

`;

export default contentStyles;
// background: transparent !important;
