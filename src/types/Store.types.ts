// src/types/Store.types.ts

import { LayoverPosition } from './Layover.types';
import { SerializedTabState, TabId, ValidTabId } from './tab.types';

interface SharedStore {
  totalMatchesCount: number;
  layoverPosition: LayoverPosition;
  showLayover: boolean;
  showMatches: boolean;
  activeTabId: TabId;
  searchValue: string;
  lastSearchValue: string;
}

interface BasicTabState {
  tabId: ValidTabId;
  serializedTabState: SerializedTabState;
}

export interface TabStore extends SharedStore {
  tabId: ValidTabId;
  serializedTabState: SerializedTabState;
}

export interface WindowStore extends SharedStore {
  updatedTabsCount: number;
  totalTabs: number | undefined;
  tabStores: Record<ValidTabId, BasicTabState>;
}

export interface Store {
  lastFocusedWindowId: chrome.windows.Window['id'];
  windowStores: {
    [K in number]: WindowStore;
  };
}
