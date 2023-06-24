// src/utils/chromeAPI.ts

import { WindowStore } from '../../types/Store.types';

export async function queryCurrentWindowTabs(
  activeTab: boolean | undefined = undefined
): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: activeTab, currentWindow: true }, resolve);
  });
}

// export function getActiveTabId(): Promise<number | undefined> {
export function getActiveTabId(): Promise<number> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        resolve(tabs[0].id);
      } else {
        reject(new Error('No active Tab'));
      }
    });
  });
}
