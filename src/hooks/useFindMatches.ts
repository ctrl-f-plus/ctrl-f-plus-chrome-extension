// src/hooks/useFindMatches.ts

import { useCallback, useContext, useEffect, useState } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { TabStateContext } from '../contexts/TabStateContext';
import { SwitchTabMsg, UpdateTabStatesObjMsg } from '../types/message.types';
import { SerializedTabState, TabState } from '../types/tab.types';
import searchAndHighlight from '../utils/search/searchAndHighlight';
import { sendMsgToBackground } from '../utils/messaging/sendMessageToBackground';
import scrollToElement from '../utils/dom/scrollUtil';
import calculateTargetIndex from '../utils/search/calculateTargetIndex';
import { Direction } from '../types/shared.types';
import { DIRECTION_NEXT, HIGHLIGHT_FOCUS_CLASS } from '../utils/constants';
import serializeTabState from '../utils/serialization/serializeTabState';

type UpdateHighlightsOptions = {
  previousIndex?: number;
  endOfTab?: boolean;
};

export default function useFindMatches() {
  const { totalMatchesCount } = useContext(LayoverContext);
  const { tabStateContext, setTabStateContext } = useContext(TabStateContext);

  const [state2, setState2] = useState(tabStateContext);

  useEffect(() => {
    if (JSON.stringify(state2) !== JSON.stringify(tabStateContext)) {
      setState2(tabStateContext);
    }
  }, [state2, tabStateContext]);

  const findAllMatches = useCallback(
    async (findValue: string) => {
      const newState = { ...tabStateContext };

      newState.currentIndex = 0;
      newState.matchesCount = 0;
      newState.matchesObj = [];

      await searchAndHighlight(newState, findValue);

      setTabStateContext(newState);
      return newState;
    },
    [tabStateContext, setTabStateContext]
  );

  const updateHighlights = useCallback(
    (state: TabState, options?: UpdateHighlightsOptions): TabState => {
      const { previousIndex, endOfTab } = options || {};
      const newState = { ...state };
      if (!newState.matchesObj.length) {
        return newState;
      }

      if (typeof previousIndex === 'number') {
        const prevMatch = newState.matchesObj[previousIndex];
        prevMatch.classList.remove(HIGHLIGHT_FOCUS_CLASS);
      }

      if (!endOfTab && typeof newState.currentIndex !== 'undefined') {
        const curMatch = newState.matchesObj[newState.currentIndex];

        curMatch.classList.add(HIGHLIGHT_FOCUS_CLASS);
        scrollToElement(curMatch);
      }

      return newState;
    },
    []
  );

  const navigateMatches = useCallback(
    (
      traversalDirection: Direction,
      indexCalc: (state2: TabState) => number
    ) => {
      if (state2.currentIndex === undefined) {
        return;
      }

      const previousIndex = state2.currentIndex;

      const newState2 = {
        ...state2,
        currentIndex: indexCalc(state2),
      };

      let updatedState: TabState;

      const isEnd =
        traversalDirection === DIRECTION_NEXT
          ? newState2.currentIndex === 0
          : newState2.currentIndex === state2.matchesObj.length - 1;

      if (isEnd) {
        // removes the focus class from the last match
        updatedState = updateHighlights(newState2, {
          previousIndex,
          endOfTab: true,
        });

        if (newState2.matchesCount === totalMatchesCount) {
          updatedState = updateHighlights(updatedState, { endOfTab: false });
        } else {
          const serializedState: SerializedTabState = serializeTabState({
            ...newState2,
          });

          const message: SwitchTabMsg = {
            from: 'content-script-match-utils',
            type: 'switch-tab',
            payload: {
              serializedState,
              direction: traversalDirection,
            },
          };

          sendMsgToBackground<SwitchTabMsg>(message);
        }
      } else {
        updatedState = updateHighlights(newState2, { previousIndex });
      }

      const serializedState: SerializedTabState = serializeTabState({
        ...updatedState,
      });

      sendMsgToBackground<UpdateTabStatesObjMsg>({
        from: 'content:match-utils',
        type: 'update-tab-states-obj',
        payload: { serializedState },
      });

      setState2(updatedState);
      setTabStateContext(updatedState);
    },
    [updateHighlights, setTabStateContext, state2, totalMatchesCount, setState2]
  );

  // TODO: ***987 0 SearchInput Component Testing
  const nextMatch = useCallback(
    () =>
      navigateMatches('next', (state2: TabState) =>
        // navigateMatches('forward', (state2: TabState) =>
        state2.matchesObj.length
          ? // ? (state2.currentIndex + 1) % state2.matchesObj.length
            calculateTargetIndex(
              'next',
              state2.currentIndex,
              state2.matchesObj.length
            )
          : 0
      ),
    [navigateMatches]
  );

  const previousMatch = useCallback(
    () =>
      navigateMatches(
        'previous',
        // 'backward',
        (state2: TabState) =>
          // (state2.currentIndex - 1 + state2.matchesObj.length) %
          // state2.matchesObj.length
          calculateTargetIndex(
            'previous',
            state2.currentIndex,
            state2.matchesObj.length
          )
      ),
    [navigateMatches]
  );

  return {
    findAllMatches,
    nextMatch,
    previousMatch,
    updateHighlights,
  };
}
