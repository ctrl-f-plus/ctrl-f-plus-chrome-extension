// src/hooks/useFindMatches.ts

import { useContext } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { SwitchTabMsg, UpdateTabStatesObjMsg } from '../types/message.types';
import { SerializedTabState, TabState } from '../types/tab.types';
import { serializeMatchesObj } from '../utils/htmlUtils';
import { searchAndHighlight } from '../utils/matchUtils/highlightUtils';
import {
  createSwitchTabMsg,
  createUpdateTabStatesObjMsg,
} from '../utils/messageUtils/createMessages';
import { sendMsgToBackground } from '../utils/messageUtils/sendMessageToBackground';

export const useFindMatches = () => {
  // console.log('2. useFindMatches');
  const { state2Context, setState2Context } = useContext(LayoverContext);

  if (state2Context === null) {
    throw new Error(
      'useFindMatches must be used within a LayoverContext.Provider'
    );
  }

  async function findAllMatches(state2: TabState, findValue: string) {
    state2.currentIndex = 0;
    state2.matchesCount = 0;
    state2.matchesObj = [];
    // state2.reset(); //TODO: create state class?
    try {
      await searchAndHighlight({
        state2: state2,
        findValue,
      });

      const serializedState: SerializedTabState = serializeMatchesObj({
        ...state2,
      });
      // setState2Context({ type: 'SET_STATE2_CONTEXT', payload: state2 });
      const msg = createUpdateTabStatesObjMsg(serializedState);
      sendMsgToBackground<UpdateTabStatesObjMsg>(msg);
    } catch (error) {
      console.error(error);
    }
  }

  // async function updateHighlights2(
  //   state2: TabState,
  //   prevIndex?: number,
  //   endOfTab?: boolean,
  //   sendResponse?: Function
  // ): Promise<any> {
  //   if (!state2.matchesObj.length) {
  //     return Promise.resolve();
  //   }

  //   if (typeof prevIndex === 'number') {
  //     const prevMatch = state2.matchesObj[prevIndex];
  //     prevMatch.classList.remove('ctrl-f-highlight-focus');
  //   }

  //   if (!endOfTab && typeof state2.currentIndex !== 'undefined') {
  //     const curMatch = state2.matchesObj[state2.currentIndex];
  //     curMatch.classList.add('ctrl-f-highlight-focus');
  //     scrollToElement(curMatch);
  //   }

  //   if (sendResponse) {
  //     const serializedState: SerializedTabState = serializeMatchesObj({
  //       ...state2,
  //     });
  //     return {
  //       serializedState: serializedState,
  //       status: 'success',
  //     };
  //   }

  //   // setState2Context({ type: 'SET_STATE2_CONTEXT', payload: state2 });
  //   return Promise.resolve();
  // }

  // async function nextMatch(state2: TabState): Promise<void> {
  //   if (typeof state2.currentIndex === 'undefined') {
  //     return;
  //   }

  //   const prevIndex = state2.currentIndex;
  //   state2.currentIndex = (state2.currentIndex + 1) % state2.matchesObj.length;

  //   if (state2.currentIndex === 0) {
  //     const endOfTab: boolean = true;
  //     await updateHighlights(state2, prevIndex, endOfTab);
  //     const serializedState: SerializedTabState = serializeMatchesObj({
  //       ...state2,
  //     });

  //     if (serializedState.tabId === undefined) {
  //       debugger;
  //       // FIXME: serializedState.tabId is undefined..
  //       debugger;
  //     }

  //     const msg = createSwitchTabMsg(serializedState);

  //     await sendMsgToBackground<SwitchTabMsg>(msg);
  //   } else {
  //     await updateHighlights(state2, prevIndex);
  //   }

  //   // setState2Context({ type: 'SET_STATE2_CONTEXT', payload: state2 });
  // }

  function previousMatch(state2: TabState) {
    // TODO
  }

  // src/utils/scrollUtils.ts
  function scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return {
    findAllMatches,
    // updateHighlights2,
    // nextMatch,
  };
};
