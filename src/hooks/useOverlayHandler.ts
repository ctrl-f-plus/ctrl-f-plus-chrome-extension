// src/hooks/useOverlayHandler.ts

import { useState } from 'react';
import { Messages } from '../interfaces/message.types';
import { setStoredFindValue } from '../utils/storage';
import { useSendMessageToBackground } from './useSendMessageToBackground';

export const userOverlayHandler = (searchValue: string) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const { sendMessageToBackground } = useSendMessageToBackground();

  const toggleSearchOverlay = () => {
    showOverlay ? closeSearchOverlay(searchValue) : openSearchOverlay();
    setShowOverlay(!showOverlay);
  };

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

  return {
    showOverlay,
    setShowOverlay,
    toggleSearchOverlay,
  };
};
