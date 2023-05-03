// src/contexts/LayoverContext.tsx

import React, { createContext } from 'react';
import { useLayoverHandler } from '../hooks/useLayoverHandler';
import {
  LayoverContextData,
  LayoverProviderProps,
} from '../interfaces/layoverContext.type';

// TODO: Potentially move searchValue and setSearchValue out of this file
export const LayoverContext = createContext<LayoverContextData>({
  showLayover: false,
  setShowLayover: () => {},
  toggleSearchLayover: (forceShowLayover?: boolean) => undefined,
  searchValue: '',
  setSearchValue: () => {},
  showMatches: false,
  setShowMatches: () => {},
  totalMatchesCount: 0,
  setTotalMatchesCount: () => {},
  globalMatchIdx: 0,
  setglobalMatchIdx: () => {},
});

export const LayoverProvider: React.FC<LayoverProviderProps> = ({
  children,
}) => {
  const {
    showLayover,
    setShowLayover,
    searchValue,
    setSearchValue,
    toggleSearchLayover,
    showMatches,
    setShowMatches,
    totalMatchesCount,
    setTotalMatchesCount,
    globalMatchIdx,
    setglobalMatchIdx,
  } = useLayoverHandler();

  return (
    <LayoverContext.Provider
      value={{
        showLayover,
        setShowLayover,
        toggleSearchLayover,
        searchValue,
        setSearchValue,
        showMatches,
        setShowMatches,
        totalMatchesCount,
        setTotalMatchesCount,
        globalMatchIdx,
        setglobalMatchIdx,
      }}
    >
      {children}
    </LayoverContext.Provider>
  );
};
