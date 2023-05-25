// src/contexts/TabStateContext.tsx

import React, { ReactNode, createContext, useMemo } from 'react';
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

export function TabStateContextProvider({
  children,
}: TabStateContextProviderProps) {
  const { tabStateContext, setTabStateContext } = useLayoverHandler();

  const contextValue = useMemo(
    () => ({ tabStateContext, setTabStateContext }),
    // [tabStateContext, setTabStateContext]
    [tabStateContext]
  );

  return (
    <TabStateContext.Provider value={contextValue}>
      {children}
    </TabStateContext.Provider>
  );
}

// export type TabStateAction = {
//   type: TabStateActionTypes;
//   payload: TabState;
// };

// const tabStateReducer = (state: TabState, action: TabStateAction): TabState => {
//   switch (action.type) {
//     case 'SET_TAB_STATE_CONTEXT':
//       return {
//         ...state,
//         // This is assuming `action.payload` is the `newState` from previous examples
//         // Make sure to do a deep clone if action.payload is a nested structure
//         ...action.payload,
//       };
//     default:
//       throw new Error(`Unhandled action type: ${action.type}`);
//   }
// };

// export const TabStateContextProvider: React.FC<
//   TabStateContextProviderProps
// > = ({ children }) => {
//   const [tabStateContext, dispatch] = useReducer(tabStateReducer, initialState);

//   const setTabStateContext = (value: TabState) => {
//     dispatch({ type: 'SET_TAB_STATE_CONTEXT', payload: value });
//   };

//   return (
//     <TabStateContext.Provider
//       value={{
//         tabStateContext,
//         setTabStateContext,
//       }}
//     >
//       {children}
//     </TabStateContext.Provider>
//   );
// };
