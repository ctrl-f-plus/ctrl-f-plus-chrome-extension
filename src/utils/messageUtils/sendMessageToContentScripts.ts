// src/utils/sendMessageToContentScripts.ts

import { Messages } from '../../types/message.types';
import { ValidTabId } from '../../types/tab.types';

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
