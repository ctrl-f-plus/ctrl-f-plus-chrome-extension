// src/utils/matchUtils.ts
import { searchAndHighlight } from './searchAndHighlightUtils';
import { serializeMatchesObj } from '../utils/htmlUtils';

export async function findAllMatches(state, findValue) {
  state.matchesObj = {};
  state.currentIndex = 0;

  searchAndHighlight({
    currentIndex: state.currentIndex,
    matches: state.matches,
    matchesObj: state.matchesObj,
    findValue,
    tabId: state.tabId,
    callback: async () => {
      const state2 = { ...state };

      state2.matchesObj = state2.matchesObj[state2.tabId];

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
  debugger;
  if (state2.matchesObj[state2.tabId]) {
    state2.matchesObj = state2.matchesObj[state2.tabId];
  }
  debugger;
  if (!state2.matchesObj.length) {
    return;
  }
  debugger;
  if (typeof prevIndex === 'number') {
    const prevMatch = state2.matchesObj[prevIndex];
    prevMatch.classList.remove('ctrl-f-highlight-focus');
  }
  debugger;
  if (endOfTab) {
    return;
  }
  debugger;
  const curMatch = state2.matchesObj[state2.currentIndex];
  curMatch.classList.add('ctrl-f-highlight-focus');
  scrollToElement(curMatch);
}

export async function nextMatch(state2) {
  debugger;

  // ***5
  console.log('getInnerHtmlScript - nextMatch()');
  const prevIndex = state2.currentIndex;
  debugger;
  state2.currentIndex = (state2.currentIndex + 1) % state2.matchesObj.length;
  debugger;
  if (state2.currentIndex === 0) {
    const endOfTab: boolean = true;

    updateHighlights(state2, prevIndex, endOfTab);
    state2.matchesObj = serializeMatchesObj(state2.matchesObj);

    // TODO:(*99) Fix this so that `switch-tab` is only run when the targetTab != currentTab
    const message = {
      type: 'switch-tab',
      state: state2,
      prevIndex: undefined,
    };
    chrome.runtime.sendMessage(message);
  } else {
    debugger;
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
