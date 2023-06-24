/* eslint-disable import/prefer-default-export */
import { WindowStore } from '../../types/Store.types';
import { ValidTabId } from '../../types/tab.types';
import { getAllStoredTabs } from '../storage';
import { queryCurrentWindowTabs } from './chromeAPI';

export async function getOrderedTabs(
  windowStore: WindowStore,
  includeActiveTab = true
): Promise<chrome.tabs.Tab[]> {
  const tabs = await queryCurrentWindowTabs();

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
export async function getOrderedTabIds(
  windowStore: WindowStore
): Promise<ValidTabId[]> {
  const orderedTabs = await getOrderedTabs(windowStore);
  const storedTabs = await getAllStoredTabs();
  const tabIds = Object.keys(storedTabs).map((key) => parseInt(key, 10));

  const orderedTabIds: ValidTabId[] = orderedTabs
    .map((tab) => tab.id)
    .filter((id): id is ValidTabId => id !== undefined && tabIds.includes(id));

  return orderedTabIds;
}