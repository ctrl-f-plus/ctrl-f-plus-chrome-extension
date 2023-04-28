//@ts-nocheck
import { getAllStoredTabs, setStoredTabs } from '../utils/storage';
import { store } from '../background/background';
import {
  SwitchedActiveTabShowOverlay,
  UpdateHighlightsMessage,
} from '../interfaces/message.types';

// TODO:DRY these
function executeContentScript(
  findValue: string,
  tab: chrome.tabs.Tab
): Promise<{
  hasMatch: boolean;
  state: any;
}> {
  return new Promise<{ hasMatch: boolean; state: any }>((resolve, reject) => {
    if (tab.id === undefined) {
      console.warn('executeContentScript: Tab ID is undefined:', tab);
      reject({ hasMatch: false, state: null });
      return;
    }

    const tabId = tab.id as number;

    chrome.tabs.sendMessage(
      tabId,
      {
        from: 'background',
        type: 'highlight',
        findValue: findValue,
        tabId: tab.id,
        messageId: Date.now(),
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          reject({ hasMatch: false, state: null });
        } else {
          resolve(response);
        }
      }
    );
  });
}

export async function executeContentScriptOnAllTabs(findValue: string) {
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
      const { hasMatch, state } = await executeContentScript(findValue, tab);

      if (hasMatch && !foundFirstMatch) {
        foundFirstMatch = true;

        chrome.tabs.sendMessage(tab.id, {
          from: 'background',
          type: 'update-highlights',
          state: store.tabStates[tab.id],
          prevIndex: undefined,
        });

        if (tabs[activeTabIndex].id !== tab.id) {
          chrome.tabs.update(tab.id, { active: true });
        }

        // Process remaining tabs asynchronously
        const remainingTabs = orderedTabs.slice(orderedTabs.indexOf(tab) + 1);
        remainingTabs.forEach((remainingTab) => {
          if (remainingTab.id) {
            executeContentScript(findValue, remainingTab);
          }
        });

        break;
      }
    }
  }
}

export function executeContentScriptWithMessage(
  tabId: number,
  messageType: string
) {
  // ***2.5
  chrome.tabs.sendMessage(tabId, {
    from: 'background',
    type: messageType,
    tabId,
  });
}

export async function switchTab(serializedState2) {
  //, prevIndex) {
  // if (serializedState2.tab.id === undefined) {
  //   console.warn('switchTab: Tab ID is undefined:', serializedState2.tab);
  //   return;
  // }

  // TODO: START HERE!! =>
  //    1) Clean this up (storedTabs vs matchesObject var naming)
  // //    2) Clean up all old references to matchesObj[tabId]
  //    3) Consolidate state/state2 naming convention into one name
  //    4) matchesObj isn't actually an object? check this and potentially update name
  const storedTabs = await getAllStoredTabs();
  const matchesObject = storedTabs;

  const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));
  const currentTabIndex = tabIds.findIndex(
    (tabId) => tabId === serializedState2.tabId
  );
  const nextTabIndex = (currentTabIndex + 1) % tabIds.length;
  const nextTabId = tabIds[nextTabIndex];
  chrome.tabs.update(nextTabId, { active: true }, async (tab) => {
    serializedState2.tabId = tab.id;

    serializedState2.currentIndex = 0;
    const message: UpdateHighlightsMessage = {
      from: 'background',
      type: 'update-highlights',
      state: serializedState2,
      prevIndex: undefined,
    };
    chrome.tabs.sendMessage(tab.id, message);

    const message2: SwitchedActiveTabShowOverlay = {
      from: 'background',
      type: 'switched-active-tab-show-overlay',
    };
    chrome.tabs.sendMessage(tab.id, message2);
  });
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
      totalMatchesCount += storedTabs[tabId].matchesCount;
    }
  }
  const tabIds = Object.keys(storedTabs).map((key) => parseInt(key, 10));

  for (const tabId of tabIds) {
    chrome.tabs.sendMessage(tabId, {
      from: 'background',
      type: 'update-matches-count',
      payload: {
        totalMatchesCount,
      },
    });
  }
}

// 'Match X/Y (Total: Z)';
export async function updateTotalTabsCount() {
  store.totalTabs = await new Promise<number>((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => resolve(tabs.length));
  });
}
