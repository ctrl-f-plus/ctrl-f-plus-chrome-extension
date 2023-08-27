// src/contentScripts/hooks/useFindMatches.ts

import { useCallback, useContext, useEffect, useState } from 'react';
import { Direction } from '../../shared/types/shared.types';
import { HIGHLIGHT_FOCUS_CLASS } from '../../shared/utils/constants';
import { LayoverContext } from '../contexts/LayoverContext';
import { TabStateContext } from '../contexts/TabStateContext';
import { SerializedTabState, TabState } from '../types/tab.types';
import {
  SWITCH_TAB,
  SwitchTabMsg,
  UPDATED_TAB_STATE,
  UpdatedTabStateMsg,
} from '../types/toBackgroundMessage.types';
import scrollToElement from '../utils/dom/scrollUtil';
import sendMessageToBackground from '../utils/messaging/sendMessageToBackground';
import calculateTargetIndex from '../utils/search/calculateTargetIndex';
import searchAndHighlight from '../utils/search/searchAndHighlight';
import serializeTabState from '../utils/serialization/serializeTabState';

type UpdateHighlightsOptions = {
  previousIndex?: number;
  endOfTab?: boolean;
};

export default function useFindMatches() {
  const { totalMatchesCount } = useContext(LayoverContext);
  const { tabStateContext, setTabStateContext } = useContext(TabStateContext);

  const [localTabState, setLocalTabState] = useState(tabStateContext);

  useEffect(() => {
    if (JSON.stringify(localTabState) !== JSON.stringify(tabStateContext)) {
      setLocalTabState(tabStateContext);
    }
  }, [localTabState, tabStateContext]);

  const findAllMatches = useCallback(
    async (searchValue: string) => {
      const newState = { ...tabStateContext };

      newState.currentIndex = 0;
      newState.matchesCount = 0;
      newState.queryMatches = [];

      await searchAndHighlight(newState, searchValue);

      setTabStateContext(newState);
      return newState;
    },
    [tabStateContext, setTabStateContext]
  );

  const updateHighlights = useCallback(
    (state: TabState, options?: UpdateHighlightsOptions): TabState => {
      const { previousIndex, endOfTab } = options || {};
      const newState = { ...state };
      if (!newState.queryMatches.length) {
        return newState;
      }

      if (typeof previousIndex === 'number') {
        const prevMatch = newState.queryMatches[previousIndex];
        prevMatch.classList.remove(HIGHLIGHT_FOCUS_CLASS);
      }

      if (!endOfTab && typeof newState.currentIndex !== 'undefined') {
        const curMatch = newState.queryMatches[newState.currentIndex];

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
      indexCalc: (localTabState: TabState) => number
    ) => {
      if (localTabState.currentIndex === undefined) {
        return;
      }

      const previousIndex = localTabState.currentIndex;

      const newLocalTabState = {
        ...localTabState,
        currentIndex: indexCalc(localTabState),
      };

      let updatedState: TabState;

      const isEnd =
        traversalDirection === Direction.NEXT
          ? newLocalTabState.currentIndex === 0
          : newLocalTabState.currentIndex ===
            localTabState.queryMatches.length - 1;

      if (isEnd) {
        // removes the focus class from the last match
        updatedState = updateHighlights(newLocalTabState, {
          previousIndex,
          endOfTab: true,
        });

        if (newLocalTabState.matchesCount === totalMatchesCount) {
          updatedState = updateHighlights(updatedState, { endOfTab: false });
        } else {
          const serializedState: SerializedTabState = serializeTabState({
            ...newLocalTabState,
          });

          sendMessageToBackground<SwitchTabMsg>({
            type: SWITCH_TAB,
            payload: {
              serializedState,
              direction: traversalDirection,
            },
          });
        }
      } else {
        updatedState = updateHighlights(newLocalTabState, { previousIndex });
      }

      const serializedState: SerializedTabState = serializeTabState({
        ...updatedState,
      });

      sendMessageToBackground<UpdatedTabStateMsg>({
        type: UPDATED_TAB_STATE,
        payload: { serializedState },
      });

      setLocalTabState(updatedState);
      setTabStateContext(updatedState);
    },
    [
      updateHighlights,
      setTabStateContext,
      localTabState,
      totalMatchesCount,
      setLocalTabState,
    ]
  );

  // TODO: ***987 0 SearchInput Component Testing
  const nextMatch = useCallback(
    () =>
      navigateMatches(Direction.NEXT, (currentState: TabState) =>
        currentState.queryMatches.length
          ? calculateTargetIndex(
              Direction.NEXT,
              currentState.currentIndex,
              currentState.queryMatches.length
            )
          : 0
      ),
    [navigateMatches]
  );

  const previousMatch = useCallback(
    () =>
      navigateMatches(Direction.PREVIOUS, (currentState: TabState) =>
        calculateTargetIndex(
          Direction.PREVIOUS,
          currentState.currentIndex,
          currentState.queryMatches.length
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
