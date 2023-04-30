// src/hooks/useOverlayHandler.ts

import { useState, useCallback } from 'react';
import { useSendMessageToBackground } from './useSendMessageToBackground';
import { setStoredFindValue } from '../utils/storage';

export const useOverlayHandler = () => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [showMatches, setShowMatches] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [totalMatchesCount, setTotalMatchesCount] = useState<number>(0);
  const [globalMatchIdx, setglobalMatchIdx] = useState<number>(0);

  const { sendMessageToBackground } = useSendMessageToBackground();

  const toggleSearchOverlay = useCallback(
    (forceShowOverlay?: boolean) => {
      const openSearchOverlay = () => {
        sendMessageToBackground({
          from: 'content',
          type: 'add-styles-all-tabs',
        });

        setShowMatches(true);
      };

      const closeSearchOverlay = (searchValue: string) => {
        // TODO: NEED TO RUN SEARCHSUBMIT, BUT WITHOUT THE CSS INJECTION (test by typing a new value into search input then hitting `esc` key)
        setStoredFindValue(searchValue);
        sendMessageToBackground({
          from: 'content',
          type: 'remove-styles-all-tabs',
        });
        setShowMatches(false);
      };

      const newState =
        forceShowOverlay === undefined ? !showOverlay : forceShowOverlay;

      newState ? openSearchOverlay() : closeSearchOverlay(searchValue);
      setShowOverlay(newState);
    },
    [sendMessageToBackground]
  );

  return {
    showOverlay,
    setShowOverlay,
    toggleSearchOverlay,
    searchValue,
    setSearchValue,
    showMatches,
    setShowMatches,
    totalMatchesCount,
    setTotalMatchesCount,
    globalMatchIdx,
    setglobalMatchIdx,
  };
};
