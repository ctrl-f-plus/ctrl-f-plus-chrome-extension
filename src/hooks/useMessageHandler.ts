// src/hooks/useMessageHandler.ts

import { useEffect } from 'react';

type MessageHandler = (message: any, sender: any, sendResponse: any) => void;

export default function useMessageHandler(messageHandler: MessageHandler) {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler);

    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);
}
