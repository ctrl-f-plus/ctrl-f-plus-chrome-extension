// src/utils/dom/createSpan.ts

export default function createSpan(
  text: string,
  spanClasses: string[]
): HTMLSpanElement {
  const span = document.createElement('span');
  span.textContent = text;
  span.classList.add(...spanClasses);

  return span;
}
