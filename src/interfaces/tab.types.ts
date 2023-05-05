// src/interfaces/tab.types.ts

export type TabId = chrome.tabs.Tab['id'] | number;

export interface TabState {
  // tabId: chrome.tabs.Tab['id'] | undefined;
  tabId: TabId;
  active?: boolean;
  currentIndex: number | undefined;
  matchesCount: number | undefined;
  matchesObj: string | any[];
  serializedMatches?: string;
  globalMatchIdxStart?: number;
}
