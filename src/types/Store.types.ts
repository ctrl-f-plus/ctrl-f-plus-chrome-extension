// src/types/Store.types.ts

import { LayoverPosition } from './Layover.types';
import { SerializedTabState, TabId, ValidTabId } from './tab.types';

export interface SharedStore {
  totalMatchesCount: number;
  layoverPosition: LayoverPosition;
  showLayover: boolean;
  showMatches: boolean;
  activeTabId: TabId;
  searchValue: string;
  lastSearchValue: string;
}

export interface TabStore extends SharedStore {
  tabId: ValidTabId;
  serializedTabState: SerializedTabState;
}
