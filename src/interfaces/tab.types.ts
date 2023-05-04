// src/interfaces/tab.types.ts

export interface TabState {
  tabId: chrome.tabs.Tab['id'] | undefined;
  active?: boolean;
  currentIndex: number | undefined;
  matchesCount: number | undefined;
  matchesObj: string | any[];
  serializedMatches?: string;
  globalMatchIdxStart?: number;
}
