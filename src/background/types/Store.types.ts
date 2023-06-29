// src/background/types/Store.types.ts

import {
  SerializedTabState,
  TabId,
  ValidTabId,
} from '../../contentScripts/types/tab.types';
import { LayoverPosition } from '../../shared/types/shared.types';

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
