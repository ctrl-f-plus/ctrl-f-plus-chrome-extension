// src/hooks/useSendMessageToBackground.ts

import { Messages } from '../types/message.types';

export const useSendMessageToBackground = () => {
  const sendMessageToBackground = async (message: Messages) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  };

  return {
    sendMessageToBackground,
  };
};
