import React, { createContext, useState } from 'react';

export interface State {
  currentIndex: number | undefined;
  matchesObj: { [key: string]: any };
  tabId: number | undefined;
}

export interface TabContextData {
  state: State;
  setState: (state: State) => void;
}

export const TabContext = createContext<TabContextData>({
  state: {
    currentIndex: undefined,
    matchesObj: {},
    tabId: undefined,
  },

  setState: () => {},
});

export const TabProvider: React.FC = ({ children }) => {
  const [state, setState] = useState({
    currentIndex: undefined,
    matchesObj: {},
    tabId: undefined,
  });

  return (
    <TabContext.Provider value={{ state, setState }}>
      {children}
    </TabContext.Provider>
  );
};
