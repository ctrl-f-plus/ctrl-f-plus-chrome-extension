// src/interfaces/tab.types.ts

export type TabId = chrome.tabs.Tab['id'] | number;
export type ValidTabId = Exclude<TabId, undefined>;

export interface BaseTab {
  tabId: TabId;
  active?: boolean;
  currentIndex: number | undefined;
  matchesCount: number | undefined;
  globalMatchIdxStart?: number;
}
// FIXME: remove serializedMatches from TabState
export interface TabState extends BaseTab {
  matchesObj: string | any[];
  serializedMatches?: string;
}

export interface SerializedTabState extends BaseTab {
  serializedMatches?: string;
}

// type SerializedMatchesObj = string;
