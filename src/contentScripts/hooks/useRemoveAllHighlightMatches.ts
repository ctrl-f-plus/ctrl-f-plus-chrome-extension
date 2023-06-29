// src/contentScripts/hooks/useRemoveAllHighlightMatches.ts

import { useContext, useEffect } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import removeAllHighlightMatches from '../utils/dom/removeAllHighlightMatches';

export default function useRemoveAllHighlightMatches() {
  const { showMatches } = useContext(LayoverContext);

  useEffect(
    () => () => {
      if (showMatches) {
        removeAllHighlightMatches();
      }
    },
    [showMatches]
  );
}
