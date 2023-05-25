/* eslint-disable import/prefer-default-export */

// src/utils/messageUtils/sendMessageToContentScripts.ts

import { Messages } from '../../types/message.types';
// import { ValidTabId } from '../../types/tab.types';
// import { queryCurrentWindowTabs } from '../backgroundUtils';

// // FIXME: UNUSED
// export const sendMessageToContentScripts = async (
//   msg: Messages,
//   tabIds: ValidTabId[] = []
// ): Promise<any> => {
//   let tabIdsClone = tabIds;
//   const msgClone = msg;

//   if (tabIds.length === 0) {
//     const tabs = await queryCurrentWindowTabs();

//     tabIdsClone = tabs
//       .map((tab) => tab.id)
//       .filter((id): id is ValidTabId => id !== undefined);
//   }

//   return new Promise((resolve) => {
//     tabIdsClone.forEach((tabId) => {
//       msgClone.payload.tabId = tabId;
//       chrome.tabs.sendMessage(tabId, msg);
//     });
//   });
// };

// FIXME: remove `eslint-disable`, export as default, and rename file if you don't add `sendMessageToContentScripts()` back
export function sendMessageToTab<T extends Messages>(
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
