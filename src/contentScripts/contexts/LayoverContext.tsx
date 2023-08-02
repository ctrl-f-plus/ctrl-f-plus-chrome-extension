import { createContext, useEffect, useMemo } from 'react';
import useLayoverHandler from '../hooks/useLayoverHandler';
import {
  LayoverContextData,
  LayoverProviderProps,
} from '../types/layoverContext.types';
import {
  CONTENT_SCRIPT_INITIALIZED,
  ContentScriptInitializedMsg,
} from '../types/toBackgroundMessage.types';
import sendMessageToBackground from '../utils/messaging/sendMessageToBackground';

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
    ]
  );

  return (
    <LayoverContext.Provider value={contextValue}>
      {children}
    </LayoverContext.Provider>
  );
}
