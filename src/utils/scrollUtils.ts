// src/utils/scrollUtils.ts
export function scrollToElement(element: HTMLElement) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
