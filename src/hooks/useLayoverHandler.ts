// src/hooks/useLayoverHandler.ts

import { useCallback, useReducer } from 'react';
import { LayoverAction, LayoverState } from '../types/layoverContext.types';
import { setStoredLastSearchValue, setStoredFindValue } from '../utils/storage';
import { useSendMessageToBackground } from './useSendMessageToBackground';

const initialState: LayoverState = {
  showLayover: false,
  showMatches: false,
  searchValue: '',
  lastSearchValue: '',
  totalMatchesCount: 0,
  globalMatchIdx: 0,
};

const reducer = (state: LayoverState, action: LayoverAction): LayoverState => {
  switch (action.type) {
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
    default:
      return state;
  }
};

export const useLayoverHandler = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { sendMessageToBackground } = useSendMessageToBackground();

  const toggleSearchLayover = useCallback(
    (forceShowLayover?: boolean) => {
      const openSearchLayover = () => {
        sendMessageToBackground({
          from: 'content',
          type: 'add-styles-all-tabs',
        });

        dispatch({ type: 'SET_SHOW_MATCHES', payload: true });
      };

      const closeSearchLayover = (searchValue: string) => {
        // TODO: NEED TO RUN SEARCHSUBMIT, BUT WITHOUT THE CSS INJECTION (test by typing a new value into search input then hitting `esc` key)
        setStoredFindValue(searchValue);
        setStoredLastSearchValue(searchValue);

        sendMessageToBackground({
          from: 'content',
          type: 'remove-styles-all-tabs',
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
  };
};
