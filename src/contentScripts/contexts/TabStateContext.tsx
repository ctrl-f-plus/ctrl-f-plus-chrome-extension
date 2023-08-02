// src/contexts/TabStateContext.tsx

import { ReactNode, createContext, useEffect, useMemo } from 'react';
import useLayoverHandler from '../hooks/useLayoverHandler';
import { SerializedTabState, TabState } from '../types/tab.types';
import {
  CONTENT_SCRIPT_INITIALIZED,
  ContentScriptInitializedMsg,
} from '../types/toBackgroundMessage.types';
import sendMessageToBackground from '../utils/messaging/sendMessageToBackground';
import serializeTabState from '../utils/serialization/serializeTabState';

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
    matchesObj: [],
    // globalMatchIdxStart: undefined,
    globalMatchIdxStart: -1,
  },
  setTabStateContext: () => {},
});

export function TabStateContextProvider({
  children,
}: TabStateContextProviderProps) {
  const { tabStateContext, setTabStateContext } = useLayoverHandler();

  const contextValue = useMemo(
    () => ({ tabStateContext, setTabStateContext }),
    // [tabStateContext, setTabStateContext]
    [tabStateContext]
  );

  useEffect(() => {
    console.log(contextValue);
    console.log(tabStateContext);

    const serializedState: SerializedTabState =
      serializeTabState(tabStateContext);

    sendMessageToBackground<ContentScriptInitializedMsg>({
      type: CONTENT_SCRIPT_INITIALIZED,
      payload: { serializedState },
    });
  }, []);

  return (
    <TabStateContext.Provider value={contextValue}>
      {children}
    </TabStateContext.Provider>
  );
}
