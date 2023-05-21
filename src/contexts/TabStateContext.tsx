// src/contexts/TabStateContext.tsx

import React, { ReactNode, createContext } from 'react';
import { useLayoverHandler } from '../hooks/useLayoverHandler';
import { TabState } from '../types/tab.types';

export interface TabStateContextData {
  tabStateContext: TabState;
  setTabStateContext: (value: TabState) => void;
}

export type TabStateActionTypes = 'SET_TAB_STATE_CONTEXT';

export type TabStateAction = {
  type: TabStateActionTypes;
  payload: TabState;
};

export interface TabStateContextProviderProps {
  children: ReactNode;
}

export const TabStateContext = createContext<TabStateContextData>({
  tabStateContext: {
    tabId: undefined,
    currentIndex: undefined,
    matchesCount: undefined,
    matchesObj: [],
    globalMatchIdxStart: undefined,
  },
  setTabStateContext: () => {},
});

export const TabStateContextProvider: React.FC<
  TabStateContextProviderProps
> = ({ children }) => {
  const { tabStateContext, setTabStateContext } = useLayoverHandler();

  return (
    <TabStateContext.Provider value={{ tabStateContext, setTabStateContext }}>
      {children}
    </TabStateContext.Provider>
  );
};
