// src/utils/matchUtils/removeAllHighlightMatches.ts

// TODO: make sure that you test this to ensure that the html is being rebuilt correctly
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
