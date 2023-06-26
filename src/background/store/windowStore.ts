// src/background/windowStore.ts

import { SharedStore } from '../../types/Store.types';
import { LayoverPosition, SerializedTabState } from '../../types/shared.types';
import { ValidTabId } from '../../types/tab.types';
import { queryCurrentWindowTabs } from '../utils/chromeApiUtils';
import { getAllStoredTabs } from '../utils/storage';

interface BasicTabState {
  tabId: ValidTabId;
  serializedTabState: SerializedTabState;
}

export interface WindowStore extends SharedStore {
  updatedTabsCount: number;
  totalTabs: number | undefined;
  tabStores: Record<ValidTabId, BasicTabState>;

  resetPartialStore: () => void;
  update: (updates: Partial<WindowStore>) => void;
  updateLayoverPosition: (newPosition: LayoverPosition) => void;
  setTotalTabsCount: () => void;
  setUpdatedTabsCount: (updatedTabsCount: number) => void;
  updateMatchesCount: () => void;
  updateTotalMatchesCount: (totalMatchesCount: number) => void;
  toggleShowFields: (isVisible?: boolean) => void;
  setActiveTabId: (activeTabId: number) => void;
}

export const createWindowStore = (): WindowStore => {
  return {
    totalMatchesCount: 0,
    layoverPosition: { x: 0, y: 0 },
    showLayover: false,
    showMatches: false,
    activeTabId: undefined,
    searchValue: '',
    lastSearchValue: '',
    updatedTabsCount: 0,
    totalTabs: undefined,
    tabStores: {},

    update(updates): void {
      Object.assign(this, updates);
      const updatesTabStores = updates.tabStores;

      if (updatesTabStores) {
        Object.keys(updatesTabStores).forEach((tabId) => {
          const validTabId = tabId as unknown as ValidTabId;

          if (!this.tabStores[validTabId]) {
            this.tabStores[validTabId] = updatesTabStores[validTabId];
          } else {
            Object.assign(
              this.tabStores[validTabId],
              updatesTabStores[validTabId]
            );
          }
        });
      }
    },

    resetPartialStore(): void {
      const partialInitialState = {
        totalMatchesCount: 0,
        searchValue: '',
        lastSearchValue: '',
        tabStores: {},
      };
      this.update(partialInitialState);
    },

    updateLayoverPosition(newPosition) {
      this.layoverPosition = newPosition;
    },

    async setTotalTabsCount() {
      const tabs = await queryCurrentWindowTabs();
      this.totalTabs = tabs.length;
    },

    setUpdatedTabsCount(updatedTabsCount) {
      this.updatedTabsCount = updatedTabsCount;
    },

    async updateMatchesCount() {
      const storedTabs = await getAllStoredTabs();
      let totalMatchesCount = 0;

      Object.keys(storedTabs).forEach((tabId) => {
        const validTabId = tabId as unknown as ValidTabId;
        totalMatchesCount += storedTabs[validTabId]?.matchesCount ?? 0;
      });

      this.totalMatchesCount = totalMatchesCount;
    },

    updateTotalMatchesCount(totalMatchesCount) {
      this.totalMatchesCount = totalMatchesCount;
    },

    toggleShowFields(isVisible) {
      // FIXME: feels hacky
      const show = isVisible !== undefined ? isVisible : !this.showLayover;

      this.showLayover = show;
      this.showMatches = show;
    },

    setActiveTabId(activeTabId) {
      this.activeTabId = activeTabId;
    },
  };
};
