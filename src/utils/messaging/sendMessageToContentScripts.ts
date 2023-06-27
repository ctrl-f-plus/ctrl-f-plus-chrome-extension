// src/utils/messageUtils/sendMessageToContentScripts.ts

import { ToLayoverMessage } from '../../types/message.types';

export default function sendMessageToTab<T extends ToLayoverMessage>(
  tabId: number,
  message: T
): Promise<any> {
  return new Promise((resolve, reject) => {
    const callback = (response: any) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    };

    // chrome.tabs.get(tabId, function (tab) {
    // if (tab.status === 'complete') {
    // try {
    if (message.async) {
      chrome.tabs.sendMessage(tabId as number, message, callback);
    } else {
      chrome.tabs.sendMessage(tabId as number, message);
    }
    // } catch (error) {
    //   console.log(error);
    // }
    // }
    // });
  });
}
