// src/hooks/useMessageHandler.ts

import { useEffect } from 'react';
import { Messages } from '../types/message.types';

// FIXME: (***878) review the return type here:
type MessageHandler = (
  message: Messages,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
  // ) => Promise<void>;
) => Promise<boolean | undefined>;

export default function useMessageHandler(messageHandler: MessageHandler) {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler);

    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);
}
