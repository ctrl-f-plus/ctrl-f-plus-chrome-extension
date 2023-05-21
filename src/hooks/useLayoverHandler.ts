// src/hooks/useLayoverHandler.ts

import { cloneDeep } from 'lodash';
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
  activeTabId: undefined,
  tabStateContext: {
    tabId: undefined as TabId,
    currentIndex: 0,
    matchesCount: 0,
    matchesObj: [],
    globalMatchIdxStart: undefined,
  },
};

const ACTIONS: { [K in ActionTypes]: K } = {
  INITIALIZE_STATE: 'INITIALIZE_STATE',
  SET_SHOW_LAYOVER: 'SET_SHOW_LAYOVER',
  SET_SHOW_MATCHES: 'SET_SHOW_MATCHES',
  SET_SEARCH_VALUE: 'SET_SEARCH_VALUE',
  SET_LAST_SEARCH_VALUE: 'SET_LAST_SEARCH_VALUE',
  SET_TOTAL_MATCHES_COUNT: 'SET_TOTAL_MATCHES_COUNT',
  SET_GLOBAL_MATCH_IDX: 'SET_GLOBAL_MATCH_IDX',
  SET_LAYOVER_POSITION: 'SET_LAYOVER_POSITION',
  SET_ACTIVE_TAB_ID: 'SET_ACTIVE_TAB_ID',
  INCREMENT_MATCH_INDICES: 'INCREMENT_MATCH_INDICES',
  SET_TAB_STATE_CONTEXT: 'SET_TAB_STATE_CONTEXT',
} as const;

const reducer = (state: LayoverState, action: LayoverAction): LayoverState => {
  // console.log(
  //   'Updating state with value. Old state:',
  //   state,
  //   'New state:',
  //   action.payload
  // );

  switch (action.type) {
    case ACTIONS.INITIALIZE_STATE:
      return action.payload;
    case ACTIONS.SET_SHOW_LAYOVER:
      return { ...state, showLayover: action.payload };
    case ACTIONS.SET_SHOW_MATCHES:
      return { ...state, showMatches: action.payload };
    case ACTIONS.SET_SEARCH_VALUE:
      return { ...state, searchValue: action.payload };
    case ACTIONS.SET_LAST_SEARCH_VALUE:
      return { ...state, lastSearchValue: action.payload };
    case ACTIONS.SET_TOTAL_MATCHES_COUNT:
      return { ...state, totalMatchesCount: action.payload };
    case ACTIONS.SET_GLOBAL_MATCH_IDX:
      return { ...state, globalMatchIdx: action.payload };
    case ACTIONS.SET_LAYOVER_POSITION:
      return { ...state, layoverPosition: action.payload };
    case ACTIONS.SET_ACTIVE_TAB_ID:
      return { ...state, activeTabId: action.payload };
    case ACTIONS.SET_TAB_STATE_CONTEXT:
      return { ...state, tabStateContext: action.payload as TabState };
    // case ACTIONS.SET_TAB_STATE_CONTEXT:
    //   const newTabStateContext = cloneDeep(state.tabStateContext); //TODO: review the cost of using cloneDeep. It may be overkill
    //   // Update the cloned state with the new values from the action's payload\

    //   // TODO: Review: "use Object.assign to update the cloned state. Be aware that Object.assign does not deep clone the properties from action.payload. If action.payload contains nested objects, and these objects are later mutated elsewhere in your app, you might encounter unexpected results due to object reference equality."
    //   Object.assign(newTabStateContext, action.payload);
    //   return { ...state, tabStateContext: newTabStateContext };

    default:
      return state;
  }
};

export const useLayoverHandler = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setSearchValue = (value: string) => {
    dispatch({ type: ACTIONS.SET_SEARCH_VALUE, payload: value });
  };

  const setLastSearchValue = (value: string) => {
    dispatch({ type: ACTIONS.SET_LAST_SEARCH_VALUE, payload: value });
  };

  const setTabStateContext = (value: TabState) => {
    dispatch({ type: ACTIONS.SET_TAB_STATE_CONTEXT, payload: value });
  };

  const setShowLayover = (value: boolean) =>
    dispatch({ type: ACTIONS.SET_SHOW_LAYOVER, payload: value });

  const setShowMatches = (value: boolean) =>
    dispatch({ type: ACTIONS.SET_SHOW_MATCHES, payload: value });

  const setTotalMatchesCount = (value: number) =>
    dispatch({ type: ACTIONS.SET_TOTAL_MATCHES_COUNT, payload: value });

  const setGlobalMatchIdx = (value: number) =>
    dispatch({ type: ACTIONS.SET_GLOBAL_MATCH_IDX, payload: value });

  const setLayoverPosition = (value: LayoverPosition | null) =>
    dispatch({ type: ACTIONS.SET_LAYOVER_POSITION, payload: value });

  const setActiveTabId = (value: TabId) =>
    dispatch({ type: ACTIONS.SET_ACTIVE_TAB_ID, payload: value });

  const incrementMatchIndices = () => {
    dispatch({ type: ACTIONS.INCREMENT_MATCH_INDICES });
  };

  return {
    ...state,
    setSearchValue,
    setLastSearchValue,
    setShowLayover,
    setShowMatches,
    setTotalMatchesCount,
    setGlobalMatchIdx,
    setLayoverPosition,
    incrementMatchIndices,
    setTabStateContext,
    setActiveTabId,
  };
};
