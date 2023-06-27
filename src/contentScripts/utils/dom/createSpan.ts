// src/utils/dom/createSpan.ts

export default function createSpan(
  spanClasses: string[],
  text?: string
): HTMLSpanElement {
  const span = document.createElement('span');
  span.textContent = text || '';
  span.classList.add(...spanClasses);

  return span;
}
