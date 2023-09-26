// src/utils/matchUtils/removeAllHighlightMatches.ts

import {
  HIGHLIGHT_CLASS,
  HIGHLIGHT_FOCUS_CLASS,
} from '../../../shared/utils/constants';

// TODO: make sure that you add tests to ensure that the html is being rebuilt correctly
export default function removeAllHighlightMatches() {
  const highlightElements = document.querySelectorAll(
    `.${HIGHLIGHT_CLASS}, .${HIGHLIGHT_FOCUS_CLASS}`
  );

  highlightElements.forEach((elem) => {
    const { textContent } = elem;

    if (!textContent) {
      console.warn('removeAllHighlights: Missing textContent for elem:', elem);
      return;
    }

    // eslint-disable-next-line no-param-reassign
    elem.outerHTML = textContent;
  });
}
