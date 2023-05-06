// src/hooks/useSendMessageToBackground.ts

import { Messages } from '../types/message.types';

export const useSendMessageToBackground = () => {
  const sendMessageToBackground = async (message: Messages): Promise<any> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        return resolve(response);
      });
    });
  };

  return {
    sendMessageToBackground,
  };
};
