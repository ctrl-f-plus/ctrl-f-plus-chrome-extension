import { useState } from 'react';
import { Messages } from '../interfaces/message.types';
import { setStoredFindValue } from '../utils/storage';

export const userOverlayHandler = (
  searchValue: string,
  sendMessageToBackground: (message: Messages) => Promise<any>
) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const toggleSearchOverlay = () => {
    showOverlay ? closeSearchOverlay(searchValue) : openSearchOverlay();
  };

  const openSearchOverlay = () => {
    setShowOverlay(true);
    sendMessageToBackground({
      from: 'content',
      type: 'add-styles-all-tabs',
    });
  };

  const closeSearchOverlay = (searchValue: string) => {
    setShowOverlay(false);
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
    openSearchOverlay,
    closeSearchOverlay,
  };
};
