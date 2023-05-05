// src/hooks/useMessageHandler.ts

import { useEffect } from 'react';

type MessageHandler = (message: any, sender: any, sendResponse: any) => void;

export const useMessageHandler = (messageHandler: MessageHandler) => {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler);

    // Cleanup the event listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);
};

// ///////////////////////////////////////////

// useEffect(() => {
//   const processMessage = (message: any, sender: any, sendResponse: any) => {
//     messageHandler(message, sender, sendResponse);
//   };

//   chrome.runtime.onMessage.addListener(processMessage);

//   return () => {
//     chrome.runtime.onMessage.removeListener(processMessage);
//   };
// }, [messageHandler]);
