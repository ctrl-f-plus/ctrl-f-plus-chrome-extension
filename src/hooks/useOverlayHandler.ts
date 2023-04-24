// src/hooks/useOverlayHandler.ts

import { useState, useCallback } from 'react';
import { useSendMessageToBackground } from './useSendMessageToBackground';
import { setStoredFindValue } from '../utils/storage';

export const useOverlayHandler = () => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const { sendMessageToBackground } = useSendMessageToBackground();

  const toggleSearchOverlay = useCallback(() => {
    const openSearchOverlay = () => {
      sendMessageToBackground({
        from: 'content',
        type: 'add-styles-all-tabs',
      });
    };

    const closeSearchOverlay = (searchValue: string) => {
      // TODO: NEED TO RUN SEARCHSUBMIT, BUT WITHOUT THE CSS INJECTION (test by typing a new value into search input then hitting `esc` key)
      setStoredFindValue(searchValue);
      sendMessageToBackground({
        from: 'content',
        type: 'remove-styles-all-tabs',
      });
    };

    showOverlay ? closeSearchOverlay(searchValue) : openSearchOverlay();
    setShowOverlay((prevShowOverlay) => !prevShowOverlay);
  }, [sendMessageToBackground]);

  return {
    showOverlay,
    setShowOverlay,
    searchValue,
    setSearchValue,
    toggleSearchOverlay,
  };
};
