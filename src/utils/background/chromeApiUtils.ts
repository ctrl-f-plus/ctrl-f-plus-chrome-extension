// src/background/utils/chromeApiUtils.ts
import { ValidTabId } from '../../types/tab.types';
import { getAllStoredTabs } from './storage';

/**
 * Chrome Api: Window Utils
 */
export async function getAllOpenWindows(): Promise<chrome.windows.Window[]> {
  return new Promise((resolve, reject) => {
    chrome.windows.getAll({ populate: true }, (windows) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(windows);
      }
    });
  });
}

export async function getLastFocusedWindow(): Promise<chrome.windows.Window> {
  return new Promise((resolve, reject) => {
    chrome.windows.getLastFocused((window) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(window);
      }
    });
  });
}

/**
 * Chrome Api: Tab Utils
 */
export function toValidTabId(tabId: TabId): ValidTabId {
  if (tabId === undefined) {
    throw new Error('TabId cannot be undefined');
  }
  return tabId as ValidTabId;
}

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

// TODO: REVIEW/RENAME TO FIT WITH THE OTHERS?
export async function queryCurrentWindowTabs(
  activeTab: boolean | undefined = undefined
): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: activeTab, currentWindow: true }, resolve);
  });
}

export async function getOrderedTabs(
  includeActiveTab = true
): Promise<chrome.tabs.Tab[]> {
  const tabs = await queryCurrentWindowTabs(); // FIXME: this should probably use store.activeWindowStore

  // tabs = tabs.sort((a, b) => a.index - b.index);

  const activeTabIndex = tabs.findIndex((tab) => tab.active);
  const startSliceIdx = includeActiveTab ? activeTabIndex : activeTabIndex + 1;

  const orderedTabs = [
    ...tabs.slice(startSliceIdx),
    ...tabs.slice(0, activeTabIndex),
  ];

  return orderedTabs;
}

// FIXME: The storedTabs and the filter are both required otherwise the tabs won't cycle back to the beginning
export async function getOrderedTabIds(): Promise<ValidTabId[]> {
  const orderedTabs = await getOrderedTabs();
  const storedTabs = await getAllStoredTabs();
  const tabIds = Object.keys(storedTabs).map((key) => parseInt(key, 10));

  // const orderedTabIds: ValidTabId[] = orderedTabs
  //   .map((tab) => tab.id)
  //   .filter((id): id is ValidTabId => id !== undefined && tabIds.includes(id));

  const orderedTabIds: ValidTabId[] = orderedTabs
    .map((tab) => toValidTabId(tab.id))
    .filter((id) => tabIds.includes(id));

  return orderedTabIds;
}
