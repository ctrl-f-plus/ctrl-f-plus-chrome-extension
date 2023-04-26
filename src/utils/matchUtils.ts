// src/utils/matchUtils.ts
import { searchAndHighlight } from './searchAndHighlightUtils';
import { serializeMatchesObj } from '../utils/htmlUtils';

export async function findAllMatches(state2, findValue) {
  state2.matchesObj = [];
  state2.currentIndex = 0;

  searchAndHighlight({
    matchesObj: state2.matchesObj,
    findValue,
    tabId: state2.tabId,
    state2: state2,
    callback: async () => {
      const serializedState2 = { ...state2 };
      serializedState2.matchesObj = serializeMatchesObj(
        serializedState2.matchesObj
      );

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

      console.log(state2.matchesObj);
    },
  });
}

export function updateHighlights(
  state2,
  prevIndex?: number,
  endOfTab?: boolean
) {
  if (state2.matchesObj[state2.tabId]) {
    state2.matchesObj = state2.matchesObj[state2.tabId];
  }

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

  const curMatch = state2.matchesObj[state2.currentIndex];
  curMatch.classList.add('ctrl-f-highlight-focus');
  scrollToElement(curMatch);
}

export async function nextMatch(state2) {
  // ***5
  console.log('getInnerHtmlScript - nextMatch()');
  const prevIndex = state2.currentIndex;

  state2.currentIndex = (state2.currentIndex + 1) % state2.matchesObj.length;

  if (state2.currentIndex === 0) {
    const endOfTab: boolean = true;

    updateHighlights(state2, prevIndex, endOfTab);

    const serializedState2 = { ...state2 };
    serializedState2.matchesObj = serializeMatchesObj(
      serializedState2.matchesObj
    );

    // TODO:(*99) Fix this so that `switch-tab` is only run when the targetTab != currentTab
    const message = {
      type: 'switch-tab',
      serializedState2: serializedState2,
      prevIndex: undefined,
    };

    chrome.runtime.sendMessage(message);
  } else {
    updateHighlights(state2, prevIndex);
  }
}

export function previousMatch(state) {
  const prevIndex = state.currentIndex;
  state.currentIndex =
    (state.currentIndex - 1 + state.matchesObj[state.tabId].length) %
    state.matchesObj[state.tabId].length;

  debugger;
  updateHighlights(state, prevIndex);
}

function scrollToElement(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
