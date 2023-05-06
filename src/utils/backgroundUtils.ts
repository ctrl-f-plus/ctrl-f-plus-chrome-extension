// src/utils/backgroundUtils.ts

import { store } from '../background/background';
import { Store, resetStore, updateStore } from '../background/store';
import { UpdateHighlightsMessage } from '../types/message.types';
import { SerializedTabState, TabId } from '../types/tab.types';
import { getAllStoredTabs, setStoredTabs } from '../utils/storage';

/**
 *  Utility/Helper Functions:
 */
export function sendTabMessage(tabId: TabId, message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId as number, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function executeContentScript(
  findValue: string,
  tab: chrome.tabs.Tab,
  store: Store
): Promise<{
  hasMatch: boolean;
  state: any;
}> {
  return new Promise<{ hasMatch: boolean; state: any }>(
    async (resolve, reject) => {
      if (tab.id === undefined) {
        console.warn('executeContentScript: Tab ID is undefined:', tab);
        reject({ hasMatch: false, state: null });
        return;
      }

      const tabId: TabId = tab.id as number;

      try {
        const response = await sendTabMessage(tabId, {
          from: 'background',
          type: 'highlight',
          findValue: findValue,
          tabId: tab.id,
          tabState: {},
        });

        const {
          tabId: responseTabId,
          currentIndex,
          matchesCount,
        } = response.serializedState2;

        if (typeof tab.id === 'number') {
          updateStore(store, {
            totalMatchesCount: store.totalMatchesCount + matchesCount,
            tabStates: {
              ...store.tabStates,
              [tabId]: {
                tabId,
                active: false, //FIXME:
                currentIndex,
                matchesCount,
                serializedMatches: response.serializedState2.matchesObj,
                globalMatchIdxStart: store.totalMatchesCount,
              },
            },
          });
        }

        resolve(response);
      } catch (error) {
        reject({ hasMatch: false, state: null });
      }
    }
  );
}

export async function getOrderedTabs(): Promise<chrome.tabs.Tab[]> {
  return new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const activeTabIndex = tabs.findIndex((tab) => tab.active);
      const orderedTabs = [
        ...tabs.slice(activeTabIndex + 1),
        ...tabs.slice(0, activeTabIndex),
      ];
      resolve(orderedTabs);
    });
  });
}

export async function updateMatchesCount() {
  const storedTabs = await getAllStoredTabs();

  let totalMatchesCount = 0;
  for (const tabId in storedTabs) {
    if (storedTabs.hasOwnProperty(tabId)) {
      totalMatchesCount += storedTabs[tabId]?.matchesCount ?? 0;
    }
  }
  const tabIds = Object.keys(storedTabs).map((key) => parseInt(key, 10));

  for (const tabId of tabIds) {
    sendTabMessage(tabId, {
      from: 'background',
      type: 'update-matches-count',
      payload: {
        totalMatchesCount,
      },
    });
  }
}

// 'Match X/Y (Total: Z)';
export async function updateTotalTabsCount(store: Store) {
  store.totalTabs = await new Promise<number>((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => resolve(tabs.length));
  });
}

/**
 *  Main Functions:
 */
export async function executeContentScriptOnAllTabs(
  findValue: string,
  store: Store
) {
  const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({ currentWindow: true }, resolve);
  });

  const activeTabIndex = tabs.findIndex((tab) => tab.active);

  const orderedTabs = [
    ...tabs.slice(activeTabIndex),
    ...tabs.slice(0, activeTabIndex),
  ];
  let foundFirstMatch = false;

  for (const tab of orderedTabs) {
    if (tab.id && !foundFirstMatch) {
      const { hasMatch, state } = await executeContentScript(
        findValue,
        tab,
        store
      );

      if (hasMatch && !foundFirstMatch) {
        foundFirstMatch = true;

        // FIXME: Cannot use sendTabMessage here for some reason
        chrome.tabs.sendMessage(tab.id, {
          from: 'background',
          type: 'update-highlights',
          state: store.tabStates[tab.id],
          prevIndex: undefined,
        });

        if (tabs[activeTabIndex].id !== tab.id) {
          chrome.tabs.update(tab.id, { active: true });
          // store.activeTab = tab; //REVIEW IF YOU WANT TO USE updateStore instead
        }

        // TODO: review placement of this
        await updateStore(store, {
          findValue,
          activeTab: tab,
          showLayover: true,
          showMatches: true,
        });

        // Process remaining tabs asynchronously
        const remainingTabs = orderedTabs.slice(orderedTabs.indexOf(tab) + 1);
        remainingTabs.forEach((remainingTab) => {
          if (remainingTab.id) {
            executeContentScript(findValue, remainingTab, store);
          }
        });

        break;
      }
    }
  }
}

export async function executeContentScriptWithMessage(
  tabId: number,
  messageType: string
): Promise<any> {
  try {
    const response = await sendTabMessage(tabId, {
      from: 'background',
      type: messageType,
      tabId,
    });

    return response;
  } catch (error) {
    console.log(error);
    const response = { status: 'failed' };
    return response;
  }
}

export async function switchTab(
  serializedState2: SerializedTabState
): Promise<void> {
  if (serializedState2.tabId === undefined) {
    console.warn('switchTab: Tab ID is undefined:', serializedState2);
    return;
  }

  const storedTabs = await getAllStoredTabs();
  const matchesObject = storedTabs;

  const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));
  const currentTabIndex = tabIds.findIndex(
    (tabId) => tabId === serializedState2.tabId
  );
  const nextTabIndex = (currentTabIndex + 1) % tabIds.length;
  const nextTabId = tabIds[nextTabIndex];

  chrome.tabs.update(nextTabId, { active: true }, async (tab) => {
    if (tab === undefined || tab.id === undefined) return;

    serializedState2.tabId = tab.id;

    const message: UpdateHighlightsMessage = {
      from: 'background',
      type: 'update-highlights',
      state: serializedState2,
      prevIndex: undefined,
    };

    sendTabMessage(tab.id, message);

    updateStore(store, {
      globalMatchIdx: store.tabStates[nextTabId].globalMatchIdxStart,
    });
  });
}

/**
 * Event Handling Functions
 */
export async function handleGetAllMatchesMsg(findValue: string) {
  resetStore(store);

  executeContentScriptOnAllTabs(findValue, store);
}

export async function handleNextPrevMatch(
  sender: chrome.runtime.MessageSender,
  type: string
) {
  if (sender.tab && sender.tab.id) {
    const response = await executeContentScriptWithMessage(sender.tab.id, type);

    const tabState = store.tabStates[sender.tab.id];

    if (response.status === 'success') {
      const currentIndex = response.serializedState2.currentIndex;

      updateStore(store, {
        globalMatchIdx: tabState.globalMatchIdxStart + currentIndex,
        tabStates: {
          ...store.tabStates,
          [sender.tab.id]: {
            ...tabState,
            currentIndex,
          },
        },
      });
    } else {
      // TODO: Review to see if you actually need this:
      const currentIndex = tabState.globalMatchIdxStart;
      updateStore(store, {
        tabStates: {
          ...store.tabStates,
          [sender.tab.id]: {
            ...tabState,
            currentIndex,
          },
        },
      });
    }
  }
}

export async function handleToggleStylesAllTabs(addStyles: boolean) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        sendTabMessage(tab.id, {
          type: addStyles ? 'add-styles' : 'remove-styles',
        });
      }
    });
  });

  updateStore(store, {
    showLayover: addStyles,
    showMatches: addStyles,
  });
}

export async function handleRemoveAllHighlightMatches(sendResponse: Function) {
  const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({ currentWindow: true }, resolve);
  });

  const tabPromises = tabs.map((tab) => {
    if (tab.id) {
      return sendTabMessage(tab.id, {
        type: 'remove-all-highlight-matches',
      });
    } else {
      return Promise.resolve(null);
    }
  });

  const responses = await Promise.all(tabPromises);
  sendResponse(responses);

  return true;
}

export async function handleUpdateTabStatesObj(
  payload: any,
  sendResponse: Function
) {
  const { serializedState2 } = payload;
  await setStoredTabs(serializedState2);

  store.updatedTabsCount++;

  if (store.updatedTabsCount === store.totalTabs) {
    updateMatchesCount();
    store.updatedTabsCount = 0;
  }

  sendResponse({ status: 'success' });
}
