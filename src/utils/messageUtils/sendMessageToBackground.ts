// src/utils/messageUtils/sendMessageToBackground.ts

import { Messages } from '../../types/message.types';

export const sendMessageToBackground = async (
  message: Messages
): Promise<any> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      return resolve(response);
    });
  });
};

export const sendMsgToBackground = <T extends Messages>(
  message: T
): Promise<any> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      return resolve(response);
    });
  });
};
