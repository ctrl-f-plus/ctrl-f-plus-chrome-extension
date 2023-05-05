// src/utils/matchUtils.ts
import { callSerializedState } from '../contentScripts/findMatchesScript';
import { SwitchTabMessage } from '../types/message.types';
import { TabState } from '../types/tab.types';
import { searchAndHighlight } from './searchAndHighlightUtils';

export async function findAllMatches(state2: TabState, findValue: string) {
  state2.currentIndex = 0;
  state2.matchesCount = 0;
  state2.matchesObj = [];

  searchAndHighlight({
    matchesObj: state2.matchesObj,
    findValue,
    tabId: state2.tabId,
    state2: state2,
    callback: async () => {
      const serializedState2 = callSerializedState(state2);

      // FIXME: REVIEW this message
      chrome.runtime.sendMessage(
        {
          from: 'content',
          type: 'update-tab-states-obj',
          payload: {
            serializedState2,
          },
        },
        function (response) {}
      );
    },
  });
}

export function updateHighlights(
  state2: TabState,
  prevIndex?: number,
  endOfTab?: boolean
) {
  if (!state2.matchesObj.length) {
    return;
  }

  if (typeof prevIndex === 'number') {
    const prevMatch = state2.matchesObj[prevIndex];
    prevMatch.classList.remove('ctrl-f-highlight-focus');
  }

  if (endOfTab) {
    return;
  }

  if (typeof state2.currentIndex !== 'undefined') {
    const curMatch = state2.matchesObj[state2.currentIndex];
    curMatch.classList.add('ctrl-f-highlight-focus');
    scrollToElement(curMatch);
  }
}

export async function nextMatch(state2: TabState) {
  if (typeof state2.currentIndex === 'undefined') {
    return;
  }

  const prevIndex = state2.currentIndex;
  state2.currentIndex = (state2.currentIndex + 1) % state2.matchesObj.length;

  if (state2.currentIndex === 0) {
    const endOfTab: boolean = true;
    updateHighlights(state2, prevIndex, endOfTab);
    const serializedState2 = callSerializedState(state2);

    // TODO:(*99) Fix this so that `switch-tab` is only run when the targetTab != currentTab
    const message: SwitchTabMessage = {
      from: 'content-script-match-utils',
      type: 'switch-tab',
      serializedState2: serializedState2,
      prevIndex: undefined,
    };

    chrome.runtime.sendMessage(message);
  } else {
    updateHighlights(state2, prevIndex);
  }
}

export function previousMatch(state2: TabState) {
  if (
    typeof state2.currentIndex === 'undefined' ||
    typeof state2.tabId === 'undefined'
  ) {
    return;
  }

  const prevIndex = state2.currentIndex;
  state2.currentIndex =
    (state2.currentIndex - 1 + state2.matchesObj[state2.tabId].length) %
    state2.matchesObj[state2.tabId].length;

  updateHighlights(state2, prevIndex);
}

function scrollToElement(element: HTMLElement) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
