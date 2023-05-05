// src/interfaces/tab.types.ts

export type TabId = chrome.tabs.Tab['id'] | number;
export type ValidTabId = Exclude<TabId, undefined>;

export interface TabState {
  tabId: TabId;
  active?: boolean;
  currentIndex: number | undefined;
  matchesCount: number | undefined;
  matchesObj: string | any[];
  serializedMatches?: string;
  globalMatchIdxStart?: number;
}
