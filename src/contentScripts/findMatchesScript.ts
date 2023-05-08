// src/contentScripts/findMatchesScript.ts

import { SerializedTabState, TabId, TabState } from '../types/tab.types';
import { serializeMatchesObj } from '../utils/htmlUtils';
import {
  findAllMatches,
  nextMatch,
  previousMatch,
  updateHighlights,
} from '../utils/matchUtils/findMatchesUtils';

const state2: TabState = {
  tabId: undefined as TabId | undefined,
  currentIndex: undefined,
  matchesCount: undefined,
  matchesObj: [],
};

async function handleHighlight(
  state2: TabState,
  findValue: string,
  tabId: TabId,
  sendResponse: Function
): Promise<void> {
  state2.tabId = tabId;

  await findAllMatches(state2, findValue);

  const serializedState2: SerializedTabState = serializeMatchesObj({
    ...state2,
  });

  sendResponse({
    hasMatch: state2.matchesObj.length > 0,
    serializedState2: serializedState2,
  });
}

async function handleNextMatch(
  state2: TabState,
  sendResponse: Function
): Promise<void> {
  if (state2.matchesObj.length > 0) await nextMatch(state2);

  const serializedState2: SerializedTabState = serializeMatchesObj({
    ...state2,
  });

  sendResponse({
    serializedState2: serializedState2,
    status: 'success',
  });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const { from, type, findValue, tabId, tabState } = message;

  switch (`${from}:${type}`) {
    case 'background:highlight':
      await handleHighlight(state2, findValue, tabId, sendResponse);
      return true;
    case 'background:next-match':
      await handleNextMatch(state2, sendResponse);
      return true;
    case 'background:prev-match':
      previousMatch(state2);
      break;
    case 'background:update-highlights':
      updateHighlights(state2, message.prevIndex);
      break;
    default:
      break;
  }

  return;
});
