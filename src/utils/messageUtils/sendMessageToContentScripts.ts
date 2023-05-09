// src/utils/messageUtils/sendMessageToContentScripts.ts

import { Messages } from '../../types/message.types';
import { TabId, ValidTabId } from '../../types/tab.types';

export const sendMessageToContentScripts = async (
  msg: Messages,
  tabIds: ValidTabId[] = []
): Promise<any> => {
  if (tabIds.length === 0) {
    const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query({ currentWindow: true }, resolve);
    });

    tabIds = tabs
      .map((tab) => tab.id)
      .filter((id): id is ValidTabId => id !== undefined);
  }

  return new Promise((resolve) => {
    for (const tabId of tabIds) {
      chrome.tabs.sendMessage(tabId, msg);
    }
  });
};

// FIXME: (**354)
// OLD VERSION
export function sendMessageToTab(tabId: TabId, message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId as number, message, (response) => {
      // if (chrome.runtime.lastError) {
      //   debugger;
      //   reject(chrome.runtime.lastError);
      // } else {
      //   debugger;
      resolve(response);
      // }
    });
  });
}

// UPDATED VERSION
export function sendMsgToTab<T extends Messages>(
  tabId: TabId,
  message: T
): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId as number, message, (response) => {
      resolve(response);
    });
  });
}
