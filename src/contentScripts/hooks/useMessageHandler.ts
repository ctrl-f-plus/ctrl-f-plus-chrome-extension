// src/contentScripts/hooks/useMessageHandler.ts

import { useEffect } from 'react';
import { ToLayoverMessage } from '../../background/types/message.types';
import { ResponseCallback } from '../../shared/types/shared.types';

type MessageHandler = (
  message: ToLayoverMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: ResponseCallback
) => Promise<boolean | undefined>;

export default function useMessageHandler(messageHandler: MessageHandler) {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler);

    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);
}
