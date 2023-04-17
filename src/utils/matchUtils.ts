// src/utils/matchUtils.ts
import { searchAndHighlight } from './searchAndHighlightUtils';
import {
  getStoredMatchesObject,
  setStoredMatchesObject,
  // clearLocalStorage,
} from './storage';

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
      const serializedMatchesObj = {};
      for (const key in state.matchesObj) {
        serializedMatchesObj[key] = state.matchesObj[key].map((el) => {
          return {
            innerText: el.innerText,
            className: el.className,
            id: el.id,
          };
        });
      }

      const strg = await getStoredMatchesObject();
      debugger;
      setStoredMatchesObject(state.matchesObj, state.tabId);

      // // Call this right after the state has been updated with the matches
      chrome.runtime.sendMessage(
        {
          from: 'content',
          type: 'update-tab-states',
          payload: {
            hasMatch: state.matchesObj[state.tabId].length > 0,
            state,
            serializedMatchesObj,
            tabId: state.tabId,
          },
        },
        function (response) {}
      );
      console.log(state.matchesObj);
    },
  });
}

export function updateHighlights(state, prevIndex?: number) {
  // if (!state.matches.length) {
  debugger;
  if (!state.matchesObj[state.tabId].length) {
    return;
  }

  if (typeof prevIndex === 'number') {
    // const prevMatch = state.matches[prevIndex];
    const prevMatch = state.matchesObj[state.tabId][prevIndex];
    prevMatch.classList.remove('ctrl-f-highlight-focus');
  }

  // const curMatch = state.matches[state.currentIndex];
  const curMatch = state.matchesObj[state.tabId][state.currentIndex];
  curMatch.classList.add('ctrl-f-highlight-focus');
  scrollToElement(curMatch);
}

export async function nextMatch(state) {
  console.log('getInnerHtmlScript - nextMatch()');
  const prevIndex = state.currentIndex;
  // state.currentIndex = (state.currentIndex + 1) % state.matches.length;

  // TODO: send message to update tab states?
  state.currentIndex =
    (state.currentIndex + 1) % state.matchesObj[state.tabId].length;

  if (state.currentIndex === 0) {
    // debugger;
    // const strg = await getStoredMatchesObject();
    // debugger;

    // // Find the next tab that has matches
    // const tabIds = Object.keys(strg).map((key) => parseInt(key, 10));
    // const currentTabIndex = tabIds.findIndex((tabId) => tabId === state.tabId);
    // const nextTabIndex = (currentTabIndex + 1) % tabIds.length;
    // const nextTabId = tabIds[nextTabIndex];

    // debugger;

    // // Switch to the next tab
    // chrome.tabs.update(nextTabId, { active: true }, async (tab) => {
    //   // Add the .ctrl-f-highlight-focus class to the first match on that tab
    //   state.tabId = tab.id;
    //   state.matchesObj[state.tabId][0].classList.add('ctrl-f-highlight-focus');

    //   // Update the state object and highlights
    //   state.currentIndex = 0;
    //   updateHighlights(state, prevIndex);
    // });

    const strg = await getStoredMatchesObject();
    const message = {
      type: 'switch-tab',
      state: state,
      matchesObject: strg,
      prevIndex: prevIndex,
    };
    chrome.runtime.sendMessage(message);
  } else {
    updateHighlights(state, prevIndex);
  }
}

export function previousMatch(state) {
  const prevIndex = state.currentIndex;
  state.currentIndex =
    (state.currentIndex - 1 + state.matchesObj[state.tabId].length) %
    state.matchesObj[state.tabId].length;

  updateHighlights(state, prevIndex);
}

function scrollToElement(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
