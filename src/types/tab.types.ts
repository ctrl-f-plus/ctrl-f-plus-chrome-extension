// src/interfaces/tab.types.ts

export type TabId = chrome.tabs.Tab['id'] | number;
export type ValidTabId = Exclude<TabId, undefined>;
export type JSONString = string;

export interface BaseTab {
  tabId: TabId;
  active?: boolean;
  currentIndex: number | undefined;
  matchesCount: number | undefined;
  globalMatchIdxStart?: number;
}
// FIXME: remove serializedMatches from TabState
export interface TabState extends BaseTab {
  matchesObj: HTMLSpanElement[];
}

export interface SerializedTabState extends BaseTab {
  serializedMatches: JSONString;
}

// type SerializedMatchesObj = string;
