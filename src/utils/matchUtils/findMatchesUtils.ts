// src/utils/matchUtils/findMatchesUtils.ts
// src/utils/matchUtils/matchController.ts

import { SwitchTabMsg, UpdateTabStatesObjMsg } from '../../types/message.types';
import { SerializedTabState, TabState } from '../../types/tab.types';
import { serializeMatchesObj } from '../htmlUtils';
import {
  createSwitchTabMsg,
  createUpdateTabStatesObjMsg,
} from '../messageUtils/createMessages';
import { sendMsgToBackground } from '../messageUtils/sendMessageToBackground';
import { searchAndHighlight } from './highlightUtils';

// - `findAllMatches()`, `updateHighlights()`, `nextMatch()`, and `previousMatch()` are only called from within `findMatchesScript.ts`
export async function findAllMatches(state2: TabState, findValue: string) {
  state2.currentIndex = 0;
  state2.matchesCount = 0;
  state2.matchesObj = [];
  // state2.reset(); //TODO: create state class?

  searchAndHighlight({
    state2: state2,
    findValue,
    // callback: async () => {
    //   const serializedState: SerializedTabState = serializeMatchesObj({
    //     ...state2,
    //   });

    //   debugger;
    //   const msg = createUpdateTabStatesObjMsg(serializedState);
    //   sendMsgToBackground<UpdateTabStatesObjMsg>(msg);
    // },
  });
}

export async function updateHighlights(
  state2: TabState,
  prevIndex?: number,
  endOfTab?: boolean,
  sendResponse?: Function
): Promise<void> {
  if (!state2.matchesObj.length) {
    debugger;
    return Promise.resolve();
  }
  debugger;
  if (typeof prevIndex === 'number') {
    debugger;
    // FIXME: check if this is ever hit
    const prevMatch = state2.matchesObj[prevIndex];
    prevMatch.classList.remove('ctrl-f-highlight-focus');
  }
  debugger;
  if (endOfTab) {
    return;
  }
  debugger;
  if (typeof state2.currentIndex !== 'undefined') {
    const curMatch = state2.matchesObj[state2.currentIndex];
    curMatch.classList.add('ctrl-f-highlight-focus');
    scrollToElement(curMatch);
  }

  debugger;
  if (sendResponse) {
    const serializedState: SerializedTabState = serializeMatchesObj({
      ...state2,
    });
    debugger;
    sendResponse({
      serializedState: serializedState,
      status: 'success',
    });
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
    const serializedState: SerializedTabState = serializeMatchesObj({
      ...state2,
    });

    const msg = createSwitchTabMsg(serializedState);
    await sendMsgToBackground<SwitchTabMsg>(msg);
  } else {
    await updateHighlights(state2, prevIndex);
  }
}

export function previousMatch(state2: TabState) {
  // TODO
}

// src/utils/scrollUtils.ts
function scrollToElement(element: HTMLElement) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
