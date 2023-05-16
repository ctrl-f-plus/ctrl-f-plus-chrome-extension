// // src/hooks/useMessageHandler.ts

// import { useEffect } from 'react';

// type MessageHandler = (message: any, sender: any, sendResponse: any) => void;

// export const useMessageHandler = (
//   messageHandler: MessageHandler,
//   setMessage: Function
// ) => {
//   // console.log('3. useMessageHandler');

//   useEffect(() => {
//     // chrome.runtime.onMessage.addListener(messageHandler);
//     const handleMessage = (message: any, sender: any, sendResponse: any) => {
//       setMessage(message);
//       return messageHandler(message, sender, sendResponse);
//     };

//     chrome.runtime.onMessage.addListener(handleMessage);

//     return () => {
//       chrome.runtime.onMessage.removeListener(messageHandler);
//     };
//   }, [messageHandler, setMessage]);
// };

/// src/hooks/useMessageHandler.ts

import { useEffect } from 'react';

type MessageHandler = (message: any, sender: any, sendResponse: any) => void;

export const useMessageHandler = (messageHandler: MessageHandler) => {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler);

    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);
};
