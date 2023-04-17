// src/utils/styleUtils.ts

export function injectStyles(css: string): HTMLStyleElement {
  const style = document.createElement('style');

  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  return style;
}

export function removeStyles(styleElement: HTMLStyleElement): void {
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
  }
}
