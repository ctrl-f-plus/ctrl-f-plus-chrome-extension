// src/contexts/OverlaytContext.tsx

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
  toggleSearchOverlay: (forceShowOverlay?: boolean) => undefined,
  searchValue: '',
  setSearchValue: () => {},
  showMatches: false,
  setShowMatches: () => {},
  totalMatchesCount: 0,
  setTotalMatchesCount: () => {},
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
    showMatches,
    setShowMatches,
    totalMatchesCount,
    setTotalMatchesCount,
  } = useOverlayHandler();

  return (
    <OverlayContext.Provider
      value={{
        showOverlay,
        setShowOverlay,
        toggleSearchOverlay,
        searchValue,
        setSearchValue,
        showMatches,
        setShowMatches,
        totalMatchesCount,
        setTotalMatchesCount,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};
