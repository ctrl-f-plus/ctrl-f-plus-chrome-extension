// src/hooks/useLayoverHandler.ts

import { useCallback, useReducer } from 'react';
import { LayoverPosition } from '../components/Layover';
import {
  LayoverAction,
  LayoverState,
  SetState2Action,
} from '../types/layoverContext.types';
import { sendMessageToBackground } from '../utils/messageUtils/sendMessageToBackground';
import { setStoredFindValue, setStoredLastSearchValue } from '../utils/storage';
import { TabId, TabState } from '../types/tab.types';

const initialState: LayoverState = {
  showLayover: false,
  showMatches: false,
  searchValue: '',
  lastSearchValue: '',
  totalMatchesCount: 0,
  globalMatchIdx: 0,
  layoverPosition: null,
  state2Context: {
    tabId: undefined as TabId | undefined,
    currentIndex: undefined,
    matchesCount: undefined,
    matchesObj: [],
  },
};

// const reducer = (state: LayoverState, action: LayoverAction): LayoverState => {
const reducer = (
  state: LayoverState,
  action: LayoverAction | SetState2Action
): LayoverState => {
  switch (action.type) {
    case 'INITIALIZE_STATE':
      return action.payload;
    case 'SET_SHOW_LAYOVER':
      return { ...state, showLayover: action.payload };
    case 'SET_SHOW_MATCHES':
      return { ...state, showMatches: action.payload };
    case 'SET_SEARCH_VALUE':
      return { ...state, searchValue: action.payload };
    case 'SET_LAST_SEARCH_VALUE':
      return { ...state, lastSearchValue: action.payload };
    case 'SET_TOTAL_MATCHES_COUNT':
      return { ...state, totalMatchesCount: action.payload };
    case 'SET_GLOBAL_MATCH_IDX':
      return { ...state, globalMatchIdx: action.payload };
    case 'SET_LAYOVER_POSITION':
      return { ...state, layoverPosition: action.payload };
    // case 'SET_STATE2':
    //   return { ...state, state2: action.payload };
    case 'SET_STATE2_CONTEXT':
      if (typeof action.payload === 'function') {
        const updaterFunction = action.payload as (
          prevState2: TabState
        ) => TabState;
        return {
          ...state,
          state2Context: updaterFunction(state.state2Context),
        };
      } else {
        return { ...state, state2Context: action.payload as TabState };
      }
    default:
      return state;
  }
};

export const useLayoverHandler = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleSearchLayover = useCallback(
    (forceShowLayover?: boolean) => {
      const openSearchLayover = () => {
        // sendMessageToBackground({
        //   from: 'content',
        //   type: 'add-styles-all-tabs',
        // });
        // dispatch({ type: 'SET_SHOW_MATCHES', payload: true });
      };

      const closeSearchLayover = async (searchValue: string) => {
        // TODO: NEED TO RUN SEARCHSUBMIT, BUT WITHOUT THE CSS INJECTION (test by typing a new value into search input then hitting `esc` key)
        setStoredFindValue(searchValue);

        // FIXME: There is a bug here. where we incorrectly call handle next when no matches are highlighted
        setStoredLastSearchValue(searchValue);

        // src/hooks/useLayoverHandler.ts
        sendMessageToBackground({
          from: 'content',
          type: 'remove-styles-all-tabs',
        });

        await sendMessageToBackground({
          from: 'content',
          type: 'remove-all-highlight-matches',
        });

        dispatch({ type: 'SET_SHOW_MATCHES', payload: false });
      };

      const newState =
        forceShowLayover === undefined ? !state.showLayover : forceShowLayover;

      newState ? openSearchLayover() : closeSearchLayover(state.searchValue);
      dispatch({ type: 'SET_SHOW_LAYOVER', payload: newState });
    },

    [sendMessageToBackground, state.showLayover, state.searchValue]
  );

  const setSearchValue = (value: string) => {
    dispatch({ type: 'SET_SEARCH_VALUE', payload: value });
  };

  const setLastSearchValue = (value: string) => {
    dispatch({ type: 'SET_LAST_SEARCH_VALUE', payload: value });
  };

  // const setState2 = (
  //   value: TabState | ((prevState2: TabState) => TabState)
  // ) => {
  //   dispatch({ type: 'SET_STATE2', payload: value });
  // };
  const setState2Context = (value: SetState2Action) => {
    dispatch(value);
  };

  return {
    ...state,
    setSearchValue,
    setLastSearchValue,
    setShowLayover: (value: boolean) =>
      dispatch({ type: 'SET_SHOW_LAYOVER', payload: value }),
    toggleSearchLayover,
    setShowMatches: (value: boolean) =>
      dispatch({ type: 'SET_SHOW_MATCHES', payload: value }),
    setTotalMatchesCount: (value: number) =>
      dispatch({ type: 'SET_TOTAL_MATCHES_COUNT', payload: value }),
    setGlobalMatchIdx: (value: number) =>
      dispatch({ type: 'SET_GLOBAL_MATCH_IDX', payload: value }),
    setLayoverPosition: (value: LayoverPosition | null) =>
      dispatch({ type: 'SET_LAYOVER_POSITION', payload: value }),
    // setState2: (value: TabState) =>
    //   dispatch({ type: 'SET_STATE2', payload: value }),
    setState2Context,
  };
};
