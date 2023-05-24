// src/contexts/LayoverContext.tsx

import React, { createContext, useMemo } from 'react';
import { useLayoverHandler } from '../hooks/useLayoverHandler';
import { LayoverPosition } from '../types/Layover.types';
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
  setLayoverPosition: () => {},
  activeTabId: undefined,
  setActiveTabId: () => {},
  incrementMatchIndices: () => {},
});

export function LayoverProvider({ children }: LayoverProviderProps) {
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
    activeTabId,
    setActiveTabId,
    incrementMatchIndices,
  } = useLayoverHandler();

  // const foo = useMemo(() => ({ foo: 'bar' }), []);
  const contextValue = useMemo(
    () => ({
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
      activeTabId,
      setActiveTabId,
      incrementMatchIndices,
    }),
    [
      showLayover,
      searchValue,
      lastSearchValue,
      showMatches,
      totalMatchesCount,
      globalMatchIdx,
      layoverPosition,
      activeTabId,
    ]
  );

  return (
    <LayoverContext.Provider value={contextValue}>
      {children}
    </LayoverContext.Provider>
  );
}
