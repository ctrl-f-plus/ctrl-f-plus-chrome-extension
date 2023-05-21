// src/contexts/LayoverContext.tsx

import React, { createContext } from 'react';
import { LayoverPosition } from '../components/Layover';
import { useLayoverHandler } from '../hooks/useLayoverHandler';
import {
  LayoverContextData,
  LayoverProviderProps,
} from '../types/layoverContext.types';

export const LayoverContext = createContext<LayoverContextData>({
  showLayover: false,
  setShowLayover: () => {},
  searchValue: '',
  setSearchValue: () => {},
  lastSearchValue: '',
  setLastSearchValue: () => {},
  showMatches: false,
  setShowMatches: () => {},
  totalMatchesCount: 0,
  setTotalMatchesCount: () => {},
  globalMatchIdx: 0,
  setGlobalMatchIdx: () => {},
  layoverPosition: null,
  setLayoverPosition: (value: LayoverPosition | null) => {},
  incrementMatchIndices: () => {},
});

export const LayoverProvider: React.FC<LayoverProviderProps> = ({
  children,
}) => {
  const {
    showLayover,
    setShowLayover,
    lastSearchValue,
    setLastSearchValue,
    searchValue,
    setSearchValue,
    showMatches,
    setShowMatches,
    totalMatchesCount,
    setTotalMatchesCount,
    globalMatchIdx,
    setGlobalMatchIdx,
    layoverPosition,
    setLayoverPosition,
    incrementMatchIndices,
  } = useLayoverHandler();

  return (
    <LayoverContext.Provider
      value={{
        showLayover,
        setShowLayover,
        searchValue,
        setSearchValue,
        lastSearchValue,
        setLastSearchValue,
        showMatches,
        setShowMatches,
        totalMatchesCount,
        setTotalMatchesCount,
        globalMatchIdx,
        setGlobalMatchIdx,
        layoverPosition,
        setLayoverPosition,
        incrementMatchIndices,
      }}
    >
      {children}
    </LayoverContext.Provider>
  );
};
