// src/contexts/TabsContext.tsx

import React, { ReactNode, createContext, useState, useContext } from 'react';

export interface Match {
  xpath: string;
  text: string;
  spanClasses: string[];
}

export interface Tab {
  tabId: number | undefined;
  currentIndex: number | undefined;
  matchesObj: Match[];
}

export interface TabMapType {
  [key: number]: Tab;
}

export interface TabsContextData {
  tabMap: TabMapType;
  setTabMap: (tabMap: TabMapType) => void;
}

export interface TabsProviderProps {
  children: ReactNode;
}

export const TabsContext = createContext<TabsContextData | undefined>(
  undefined
);

export const TabsProvider: React.FC<TabsProviderProps> = ({ children }) => {
  const [tabMap, setTabMap] = useState<TabMapType>({});

  return (
    <TabsContext.Provider value={{ tabMap, setTabMap }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabsData = (): TabsContextData => {
  const context = useContext(TabsContext);

  if (context === undefined) {
    throw new Error('useTabsData must be used within a TabsDataProvider');
  }

  return context;
};

// {
//   "237548747": {
//     "tabId": 237548747,
//     "currentIndex": 1,
//     "matchesObj": [
//       {
//         "xpath": "//*[@id=\"main-nav\"]/DIV[1]/A[1]",
//         "text": "Ben",
//         "spanClasses": ["ctrl-f-highlight", "ctrl-f-highlight-focus"]
//       },
//       {
//         "xpath": "//*[@id=\"home-section\"]/DIV[1]/DIV[1]/DIV[1]/H1[1]",
//         "text": "Ben",
//         "spanClasses": ["ctrl-f-highlight"]
//       },
//       {
//         "xpath": "//*[@id=\"my-story\"]/DIV[1]/DIV[1]/DIV[2]/DIV[3]/P[1]",
//         "text": "ben",
//         "spanClasses": ["ctrl-f-highlight"]
//       }
//     ]
//   },
//   "237548222": {
//     "tabId": 237548222,
//     "currentIndex": 1,
//     "matchesObj": [
//       {
//         "xpath": "//*[@id=\"main-nav\"]/DIV[1]/A[1]",
//         "text": "Ben",
//         "spanClasses": ["ctrl-f-highlight", "ctrl-f-highlight-focus"]
//       },
//       {
//         "xpath": "//*[@id=\"home-section\"]/DIV[1]/DIV[1]/DIV[1]/H1[1]",
//         "text": "Ben",
//         "spanClasses": ["ctrl-f-highlight"]
//       },
//       {
//         "xpath": "//*[@id=\"my-story\"]/DIV[1]/DIV[1]/DIV[2]/DIV[3]/P[1]",
//         "text": "ben",
//         "spanClasses": ["ctrl-f-highlight"]
//       }
//     ]
//   }
// }
