// src/types/Store.types.ts

import { LayoverPosition } from './Layover.types';
import { SerializedTabState, TabId, ValidTabId } from './tab.types';

export interface WindowStore extends SharedStore {
  updatedTabsCount: number;
  totalTabs: number | undefined;
  tabStores: Record<ValidTabId, SimplifiedTabState>;
}

export interface SimplifiedTabState {
  tabId: ValidTabId;
  serializedTabState: SerializedTabState;
}

export interface TabStore extends SharedStore {
  tabId: ValidTabId;
  serializedTabState: SerializedTabState;
}

// export type Store = {
//   lastFocusedWindowId: chrome.windows.Window['id'] | undefined;
//   windowStores: Record<chrome.windows.Window['id'], WindowStore>;
// };

export interface Store {
  lastFocusedWindowId: chrome.windows.Window['id'];
  windowStores: {
    [K in number]: WindowStore;
  };
}

// export interface Store {
//   lastFocusedWindowId: chrome.windows.Window['id'];
//   windowStores: {
//     [K in chrome.windows.Window['id']]?: WindowStore;
//   };
// }

// Store Interface
export interface SharedStore {
  totalMatchesCount: number;
  layoverPosition: LayoverPosition;
  showLayover: boolean;
  showMatches: boolean;
  activeTabId: TabId;
  searchValue: string;

  // GLOBAL: yes - will need to review after logic changes to immediate searching
  lastSearchValue: string;
}
