import { useContext, useEffect } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';

export default function useRemoveAllHighlightMatches() {
  const { showMatches } = useContext(LayoverContext);

  function removeAllHighlightMatches() {
    const highlightElements = document.querySelectorAll(
      '.ctrl-f-highlight, .ctrl-f-highlight-focus'
    );

    highlightElements.forEach((elem) => {
      const { textContent } = elem;

      if (!textContent) {
        console.warn(
          'removeAllHighlights: Missing textContent for elem:',
          elem
        );
        return;
      }

      const textNode = document.createTextNode(textContent);
      elem.parentNode?.replaceChild(textNode, elem);
    });
  }

  useEffect(
    () => () => {
      if (showMatches) {
        removeAllHighlightMatches();
      }
    },
    [showMatches]
  );
}
