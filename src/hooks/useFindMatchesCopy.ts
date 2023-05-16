// src/hooks/useFindMatchesCopy.ts

import { useCallback, useContext, useEffect, useState } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { SwitchTabMsg, UpdateTabStatesObjMsg } from '../types/message.types';
import { SerializedTabState, TabState } from '../types/tab.types';
import { serializeMatchesObj } from '../utils/htmlUtils';
import { searchAndHighlight } from '../utils/matchUtils/highlightUtils';
import { sendMsgToBackground } from '../utils/messageUtils/sendMessageToBackground';

export const useFindMatchesCopy = () => {
  // console.log('5. useFindMatchesCopy');

  const { state2Context, setState2Context, totalMatchesCount, globalMatchIdx } =
    useContext(LayoverContext);
  const [state2, setState2] = useState(state2Context);

  useEffect(() => {
    // console.log(
    //   'useFindMatchesCopy - useEffect Updated: [state2Context, state2]',
    //   state2Context,
    //   state2
    // );
    if (JSON.stringify(state2) !== JSON.stringify(state2Context)) {
      setState2(state2Context);
    }
  }, [state2Context]);

  const findAllMatches = useCallback(
    async (state2: TabState, findValue: string) => {
      const newState = { ...state2Context };

      newState.currentIndex = 0;
      newState.matchesCount = 0;
      newState.matchesObj = [];

      await searchAndHighlight({
        state2: newState,
        findValue,
      });

      const serializedState: SerializedTabState = serializeMatchesObj({
        ...state2,
      });

      setState2Context({ type: 'SET_STATE2_CONTEXT', payload: newState });
      return newState;
    },
    [state2Context, setState2Context]
  );

  const updateHighlights = useCallback(
    (state: TabState, prevIndex?: number, endOfTab?: boolean): TabState => {
      console.log('updateHighlights() called');

      const newState = { ...state };

      if (!newState.matchesObj.length) {
        return newState;
      }

      if (typeof prevIndex === 'number') {
        const prevMatch = newState.matchesObj[prevIndex];
        prevMatch.classList.remove('ctrl-f-highlight-focus');
      }

      if (!endOfTab && typeof newState.currentIndex !== 'undefined') {
        const curMatch = newState.matchesObj[newState.currentIndex];
        curMatch.classList.add('ctrl-f-highlight-focus');
        scrollToElement(curMatch);
      }

      return newState;
    },
    []
  );

  const nextMatch = useCallback(async (): Promise<void> => {
    console.log('nextMatch() called');
    if (state2.currentIndex === undefined) {
      return;
    }

    const prevIndex = state2.currentIndex;

    const newState2 = {
      ...state2,
      currentIndex: (state2.currentIndex + 1) % state2.matchesObj.length,
    };

    let updatedState: TabState;
    if (newState2.currentIndex === 0) {
      const endOfTab: boolean = true;

      updatedState = updateHighlights(newState2, prevIndex, endOfTab);

      debugger;
      if (state2.matchesCount === totalMatchesCount) {
        // updateHighlights(newState2, prevIndex, false);
        updatedState = updateHighlights(updatedState, undefined, false);
      } else {
        const serializedState: SerializedTabState = serializeMatchesObj({
          ...newState2,
        });

        const msg: SwitchTabMsg = {
          from: 'content-script-match-utils',
          type: 'switch-tab',
          serializedState: serializedState,
          prevIndex: prevIndex,
        };

        // await sendMsgToBackground<SwitchTabMsg>(msg);
        const FIXME_RESPONSE_FROM_SWITCH_TAB_MSG =
          await sendMsgToBackground<SwitchTabMsg>(msg);
        console.log(FIXME_RESPONSE_FROM_SWITCH_TAB_MSG);
      }
    } else {
      updatedState = updateHighlights(newState2, prevIndex);
    }

    setState2(updatedState);
    debugger;
    setState2Context({ type: 'SET_STATE2_CONTEXT', payload: updatedState });
  }, [
    updateHighlights,
    setState2Context,
    state2,
    totalMatchesCount,
    globalMatchIdx,
  ]);

  // src/utils/scrollUtils.ts
  function scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // const functionName = useCallback(
  //   async (findValue: string): Promise<void> => {},
  //   []
  // );

  return {
    findAllMatches,
    nextMatch,
    updateHighlights,
  };
};
