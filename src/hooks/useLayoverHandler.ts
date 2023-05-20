// src/hooks/useLayoverHandler.ts

import { useReducer } from 'react';
import { LayoverPosition } from '../components/Layover';
import {
  ActionTypes,
  LayoverAction,
  LayoverState,
} from '../types/layoverContext.types';
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
    currentIndex: 0,
    matchesCount: 0,
    matchesObj: [],
    globalMatchIdxStart: undefined,
  },
};

// const ACTIONS = {
//   // INCREMENT_MATCH_INDICES: 'increment_match_indices',
//   INCREMENT_MATCH_INDICES: 'INCREMENT_MATCH_INDICES',
// };

const ACTIONS: { [K in ActionTypes]: K } = {
  INCREMENT_MATCH_INDICES: 'INCREMENT_MATCH_INDICES',
  // add other action types here
} as const;

// function incrementMatchIndices(globalMatchIdxStart: number) {
//   // TODO:
//   // return;
// }

const reducer = (
  state: LayoverState,
  action: LayoverAction | { type: ActionTypes; payload: any }
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
    case 'SET_STATE2_CONTEXT':
      // console.log(
      //   'Updating state with value. Old state:',
      //   state.state2Context,
      //   'New state:',
      //   action.payload
      // );
      return { ...state, state2Context: action.payload as TabState };
    // case ACTIONS.INCREMENT_MATCH_INDICES:
    default:
      return state;
  }
};

export const useLayoverHandler = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setSearchValue = (value: string) => {
    dispatch({ type: 'SET_SEARCH_VALUE', payload: value });
  };

  const setLastSearchValue = (value: string) => {
    dispatch({ type: 'SET_LAST_SEARCH_VALUE', payload: value });
  };

  const setState2Context = (value: TabState) => {
    dispatch({ type: 'SET_STATE2_CONTEXT', payload: value });
  };

  const incrementMatchIndices = () => {
    dispatch({ type: ACTIONS.INCREMENT_MATCH_INDICES });
  };

  return {
    ...state,
    setSearchValue,
    setLastSearchValue,
    setShowLayover: (value: boolean) =>
      dispatch({ type: 'SET_SHOW_LAYOVER', payload: value }),
    setShowMatches: (value: boolean) =>
      dispatch({ type: 'SET_SHOW_MATCHES', payload: value }),
    setTotalMatchesCount: (value: number) =>
      dispatch({ type: 'SET_TOTAL_MATCHES_COUNT', payload: value }),
    setGlobalMatchIdx: (value: number) =>
      dispatch({ type: 'SET_GLOBAL_MATCH_IDX', payload: value }),
    setLayoverPosition: (value: LayoverPosition | null) =>
      dispatch({ type: 'SET_LAYOVER_POSITION', payload: value }),
    setState2Context,
    incrementMatchIndices,
  };
};
