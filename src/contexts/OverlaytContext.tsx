// src/contexts/Contexts.tsx

import React, { createContext } from 'react';
import { useOverlayHandler } from '../hooks/useOverlayHandler';
import {
  OverlayContextData,
  OverlayProviderProps,
} from '../interfaces/overlayContext.type';

// TODO: Potentially move searchValue and setSearchValue out of this file
export const OverlayContext = createContext<OverlayContextData>({
  showOverlay: false,
  setShowOverlay: () => {},
  toggleSearchOverlay: () => {},
  searchValue: '',
  setSearchValue: () => {},
});

export const OverlayProvider: React.FC<OverlayProviderProps> = ({
  children,
}) => {
  const {
    showOverlay,
    setShowOverlay,
    searchValue,
    setSearchValue,
    toggleSearchOverlay,
  } = useOverlayHandler();

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
