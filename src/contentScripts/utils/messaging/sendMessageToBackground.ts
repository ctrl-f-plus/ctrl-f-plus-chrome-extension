// src/utils/messageUtils/sendMessageToBackground.ts

import { ToBackgroundMessage } from '../../types/toBackgroundMessage.types';

const sendMessageToBackground = <T extends ToBackgroundMessage>(
  message: T
): Promise<any> =>
  new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => resolve(response));
  });

export default sendMessageToBackground;
