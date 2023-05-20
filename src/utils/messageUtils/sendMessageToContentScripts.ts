// src/utils/messageUtils/sendMessageToContentScripts.ts

import { Messages } from '../../types/message.types';
import { TabId, ValidTabId } from '../../types/tab.types';
import { queryCurrentWindowTabs } from '../backgroundUtils';

// FIXME: UNUSED
export const sendMessageToContentScripts = async (
  msg: Messages,
  tabIds: ValidTabId[] = []
): Promise<any> => {
  if (tabIds.length === 0) {
    const tabs = await queryCurrentWindowTabs();

    tabIds = tabs
      .map((tab) => tab.id)
      .filter((id): id is ValidTabId => id !== undefined);
  }

  return new Promise((resolve) => {
    for (const tabId of tabIds) {
      msg.payload.tabId = tabId;
      chrome.tabs.sendMessage(tabId, msg);
    }
  });
};

// UPDATED VERSION
export function sendMsgToTab<T extends Messages>(
  tabId: TabId,
  message: T
): Promise<any> {
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

////////////////////////////////////////////////////////////////////////////////////////////////////
export function sendMessageToTab(tabId: number, message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const callback = (response: any) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    };

    if (message.async) {
      chrome.tabs.sendMessage(tabId as number, message, callback);
    } else {
      chrome.tabs.sendMessage(tabId as number, message);
      resolve(true);
    }
  });
}
