// src/utils/messageUtils/sendMessageToBackground.ts

import { Messages } from '../types/message.types';

export const sendMsgToBackground = <T extends Messages>(
  message: T
): Promise<any> =>
  new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => resolve(response));
  });

export const sendMessageToBackground = async (
  message: Messages
): Promise<any> =>
  new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => resolve(response));
  });
