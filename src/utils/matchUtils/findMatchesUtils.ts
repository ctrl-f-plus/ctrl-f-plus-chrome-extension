// src/utils/matchUtils/findMatchesUtils.ts
// src/utils/matchUtils/matchController.ts

import {
  SwitchTabMessage,
  UpdateTabStatesObjMsg,
} from '../../types/message.types';
import { SerializedTabState, TabState } from '../../types/tab.types';
import { serializeMatchesObj } from '../htmlUtils';
import { searchAndHighlight } from './highlightUtils';
import { sendMessageToBackground } from '../messageUtils/sendMessageToBackground';

// - `findAllMatches()`, `updateHighlights()`, `nextMatch()`, and `previousMatch()` are only called from within `findMatchesScript.ts`
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
      const serializedState: SerializedTabState = serializeMatchesObj({
        ...state2,
      });

      const msg: UpdateTabStatesObjMsg = {
        from: 'content:match-utils',
        type: 'update-tab-states-obj',
        payload: {
          serializedState,
        },
      };
      sendMessageToBackground(msg);
    },
  });
}

export async function updateHighlights(
  state2: TabState,
  prevIndex?: number,
  endOfTab?: boolean
): Promise<void> {
  if (!state2.matchesObj.length) {
    return Promise.resolve();
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

  return Promise.resolve();
}

export async function nextMatch(state2: TabState): Promise<void> {
  if (typeof state2.currentIndex === 'undefined') {
    return;
  }

  const prevIndex = state2.currentIndex;
  state2.currentIndex = (state2.currentIndex + 1) % state2.matchesObj.length;

  if (state2.currentIndex === 0) {
    const endOfTab: boolean = true;
    await updateHighlights(state2, prevIndex, endOfTab);
    const serializedState2: SerializedTabState = serializeMatchesObj({
      ...state2,
    });

    const msg: SwitchTabMessage = {
      from: 'content-script-match-utils',
      type: 'switch-tab',
      serializedState2: serializedState2,
      prevIndex: undefined,
    };

    await sendMessageToBackground(msg);
  } else {
    await updateHighlights(state2, prevIndex);
  }
}

export function previousMatch(state2: TabState) {
  // if (
  //   typeof state2.currentIndex === 'undefined' ||
  //   typeof state2.tabId === 'undefined'
  // ) {
  //   return;
  // }
  // const prevIndex = state2.currentIndex;
  // state2.currentIndex =
  //   (state2.currentIndex - 1 + state2.matchesObj[state2.tabId].length) %
  //   state2.matchesObj[state2.tabId].length;
  // updateHighlights(state2, prevIndex);
}

// src/utils/scrollUtils.ts
function scrollToElement(element: HTMLElement) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
