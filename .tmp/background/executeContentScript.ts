// src/background/executeContentScript.ts
import { ExecuteContentScript } from '../utils/messages';

interface ExecuteContentScriptProps {
  tabId: number;
  findValue: string;
}

export const executeContentScript = (props: ExecuteContentScriptProps) => {
  const { tabId, findValue } = props;

  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, { type: 'highlight', findValue });
    }
  );
};

interface ExecuteContentScriptWithMessageProps {
  tabId: number;
  messageType: string;
  findValue: string;
}

export const executeContentScriptWithMessage = (
  props: ExecuteContentScriptWithMessageProps
) => {
  const { tabId, messageType, findValue } = props;
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, { type: messageType, findValue });
    }
  );
};
