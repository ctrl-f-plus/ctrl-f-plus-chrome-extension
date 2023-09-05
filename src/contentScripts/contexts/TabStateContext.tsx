// src/contexts/TabStateContext.tsx

import { ReactNode, createContext, useMemo } from 'react';
import useLayoverHandler from '../hooks/useLayoverHandler';
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

interface TabStateContextProviderProps {
  children: ReactNode;
}

export const TabStateContext = createContext<TabStateContextData>({
  tabStateContext: {
    tabId: undefined,
    currentIndex: 0,
    matchesCount: undefined,
    queryMatches: [],
    globalMatchIdxStart: undefined,
  },
  setTabStateContext: () => {},
});

export function TabStateContextProvider({
  children,
}: TabStateContextProviderProps) {
  const { tabStateContext, setTabStateContext } = useLayoverHandler();

  const contextValue = useMemo(
    () => ({ tabStateContext, setTabStateContext }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tabStateContext]
  );

  return (
    <TabStateContext.Provider value={contextValue}>
      {children}
    </TabStateContext.Provider>
  );
}
