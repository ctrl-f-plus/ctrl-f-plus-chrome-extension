// src/utils/styleUtils.ts

export default function injectStyles(css: string): HTMLStyleElement {
  const style = document.createElement('style');

  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  return style;
}

// FIXME: UNUSED
// export function removeStyles(styleElement: HTMLStyleElement): void {
//   if (styleElement && styleElement.parentNode) {
//     styleElement.parentNode.removeChild(styleElement);
//   }
// }
