// src/utils/matchUtils/removeAllHighlightMatches.ts

export default function removeAllHighlightMatches() {
  const highlightElements = document.querySelectorAll(
    '.ctrl-f-highlight, .ctrl-f-highlight-focus'
  );

  highlightElements.forEach((elem) => {
    const { textContent } = elem;

    if (!textContent) {
      console.warn('removeAllHighlights: Missing textContent for elem:', elem);
      return;
    }

    elem.outerHTML = textContent;
  });
}
