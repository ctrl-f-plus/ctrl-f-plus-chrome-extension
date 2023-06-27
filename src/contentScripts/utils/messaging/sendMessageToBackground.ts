/* eslint-disable import/prefer-default-export */
// src/utils/messageUtils/sendMessageToBackground.ts

import { ToBackgroundMsg } from '../../contentScripts/types/message.types';

export const sendMessageToBackground = <T extends ToBackgroundMsg>(
  message: T
): Promise<any> =>
  new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => resolve(response));
  });
