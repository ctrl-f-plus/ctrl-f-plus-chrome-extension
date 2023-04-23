// src/contexts/Contexts.tsx

import React, { ReactNode, createContext, useCallback, useState } from 'react';
import { useSendMessageToBackground } from '../hooks/useSendMessageToBackground';
import { setStoredFindValue } from '../utils/storage';
interface OverlayContextData {
  showOverlay: boolean;
  setShowOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSearchOverlay: () => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const OverlayContext = createContext<OverlayContextData>({
  showOverlay: false,
  setShowOverlay: () => {},
  toggleSearchOverlay: () => {},
  searchValue: '',
  setSearchValue: () => {},
});

interface OverlayProviderProps {
  children: ReactNode;
}

export const OverlayProvider: React.FC<OverlayProviderProps> = ({
  children,
}) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const { sendMessageToBackground } = useSendMessageToBackground();

  const toggleSearchOverlay = useCallback(() => {
    // debugger;
    // setShowOverlay((prevState) => !prevState);
    console.log(`toggleSearchOverlay called. showOverlay: ${showOverlay}`);

    showOverlay ? closeSearchOverlay(searchValue) : openSearchOverlay();
    setShowOverlay(!showOverlay);
  }, [showOverlay, sendMessageToBackground]);

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

  return (
    <OverlayContext.Provider
      value={{
        showOverlay,
        setShowOverlay,
        toggleSearchOverlay,
        searchValue,
        setSearchValue,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};
