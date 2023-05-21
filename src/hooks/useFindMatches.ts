// src/hooks/useFindMatches.ts

import { useCallback, useContext, useEffect, useState } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { TabStateContext } from '../contexts/TabStateContext';
import { SwitchTabMsg, UpdateTabStatesObjMsg } from '../types/message.types';
import { SerializedTabState, TabState } from '../types/tab.types';
import { serializeMatchesObj } from '../utils/htmlUtils';
import { searchAndHighlight } from '../utils/matchUtils/highlightUtils';
import { sendMsgToBackground } from '../utils/messageUtils/sendMessageToBackground';

type UpdateHighlightsOptions = {
  prevIndex?: number;
  endOfTab?: boolean;
};

export const useFindMatches = () => {
  const { totalMatchesCount, globalMatchIdx } = useContext(LayoverContext);
  const { tabStateContext, setTabStateContext } = useContext(TabStateContext);

  const [state2, setState2] = useState(tabStateContext);

  useEffect(() => {
    if (JSON.stringify(state2) !== JSON.stringify(tabStateContext)) {
      setState2(tabStateContext);
    }
  }, [tabStateContext]);

  const findAllMatches = useCallback(
    async (tabStateContext: TabState, findValue: string) => {
      // async (state2: TabState, findValue: string) => {
      const newState = { ...tabStateContext };

      newState.currentIndex = 0;
      newState.matchesCount = 0;
      newState.matchesObj = [];

      await searchAndHighlight({
        state2: newState,
        findValue,
      });

      setTabStateContext(newState);
      return newState;
    },
    [tabStateContext, setTabStateContext]
  );

  const updateHighlights = useCallback(
    (state: TabState, options?: UpdateHighlightsOptions): TabState => {
      const { prevIndex, endOfTab } = options || {};
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
      updatedState = updateHighlights(newState2, {
        prevIndex: prevIndex,
        endOfTab: true,
      });

      if (state2.matchesCount === totalMatchesCount) {
        updatedState = updateHighlights(updatedState, { endOfTab: false });
      } else {
        const serializedState: SerializedTabState = serializeMatchesObj({
          ...newState2,
        });

        const msg: SwitchTabMsg = {
          from: 'content-script-match-utils',
          type: 'switch-tab',
          serializedState: serializedState,
          prevIndex: prevIndex, // I don't think you need this field
        };

        await sendMsgToBackground<SwitchTabMsg>(msg);
      }
    } else {
      updatedState = updateHighlights(newState2, { prevIndex: prevIndex });
    }

    const serializedState: SerializedTabState = serializeMatchesObj({
      ...updatedState,
    });

    sendMsgToBackground<UpdateTabStatesObjMsg>({
      from: 'content:match-utils',
      type: 'update-tab-states-obj',
      payload: { serializedState },
    });

    setState2(updatedState);
    setTabStateContext(updatedState);
  }, [
    updateHighlights,
    setTabStateContext,
    state2,
    totalMatchesCount,
    globalMatchIdx,

    setState2,
    serializeMatchesObj,
    sendMsgToBackground,
  ]);

  // src/utils/scrollUtils.ts
  function scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return {
    findAllMatches,
    nextMatch,
    updateHighlights,
  };
};
