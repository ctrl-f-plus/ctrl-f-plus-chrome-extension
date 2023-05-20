// src/hooks/useLayoverHandler.ts

import { useReducer } from 'react';
import { LayoverPosition } from '../components/Layover';
import {
  ActionTypes,
  LayoverAction,
  LayoverState,
  SetState2Action,
} from '../types/layoverContext.types';
import { TabId, TabState } from '../types/tab.types';

function debounce<F extends (...args: any[]) => any>(
  func: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timeoutID: NodeJS.Timeout | null;
  return (...args: Parameters<F>) => {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    // @ts-ignore
    timeoutID = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

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

function incrementMatchIndices(globalMatchIdxStart: number) {
  // TODO:
  // return;
}

const reducer = (
  state: LayoverState,
  action: LayoverAction | SetState2Action | { type: ActionTypes; payload: any }
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
      if (typeof action.payload === 'function') {
        const updaterFunction = action.payload as (
          prevState2: TabState
        ) => TabState;
        const newState = updaterFunction(state.state2Context);
        // console.log(
        //   'Updating state with function. Old state:',
        //   state.state2Context,
        //   'New state:',
        //   newState
        // );
        return {
          ...state,
          state2Context: newState,
        };
        // updatedState = {
        //   ...state,
        //   state2Context: newState,
        // };
      } else {
        // console.log(
        //   'Updating state with value. Old state:',
        //   state.state2Context,
        //   'New state:',
        //   action.payload
        // );
        return { ...state, state2Context: action.payload as TabState };
        // updatedState = { ...state, state2Context: action.payload as TabState };
      }
    case ACTIONS.INCREMENT_MATCH_INDICES:
    // return {
    //   // updatedState = {
    //   ...state,
    //   globalMatchIdx: state.globalMatchIdx + 1,
    //   state2Context: {
    //     ...state.state2Context,
    //     // currentIndex: state.state2Context.currentIndex + 1,
    //     globalMatchIdxStart: state.state2Context.globalMatchIdxStart
    //       ? state.state2Context.globalMatchIdxStart + 1
    //       : undefined,
    //   },
    // };
    default:
      // updatedState = state;
      return state;
    // globalMatchIdx: (updatedState.state2Context.currentIndex || 0) +
    //   (updatedState.state2Context.globalMatchIdxStart || 0),
  }
  // return updatedState;
  // return {
  //   ...updatedState,
  //   globalMatchIdx:
  //     (updatedState.state2Context.currentIndex || 0) +
  //     (updatedState.state2Context.globalMatchIdxStart || 0),
  // };
};

export const useLayoverHandler = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // TODO: DON"T DELETE `toggleSearchLayover()` yet
  // const toggleSearchLayover = useCallback(
  //   (forceShowLayover?: boolean) => {
  //     const closeSearchLayover = async (searchValue: string) => {
  //       setStoredFindValue(searchValue);

  //       // FIXME: There is a bug here. where we incorrectly call handle next when no matches are highlighted
  //       setStoredLastSearchValue(searchValue);

  //       // src/hooks/useLayoverHandler.ts
  //       sendMessageToBackground({
  //         from: 'content',
  //         type: 'remove-styles-all-tabs',
  //       });

  //       // await sendMessageToBackground({
  //       //   from: 'content',
  //       //   type: 'remove-all-highlight-matches',
  //       // });
  //       // removeAllHighlightMatches();

  //       dispatch({ type: 'SET_SHOW_MATCHES', payload: false });
  //       dispatch({ type: 'SET_SHOW_LAYOVER', payload: false });
  //     };

  //     closeSearchLayover(state.searchValue);
  //   },

  //   [sendMessageToBackground, state.showLayover, state.searchValue]
  // );

  const setSearchValue = (value: string) => {
    dispatch({ type: 'SET_SEARCH_VALUE', payload: value });
  };

  const setLastSearchValue = (value: string) => {
    dispatch({ type: 'SET_LAST_SEARCH_VALUE', payload: value });
  };

  const setState2Context = (value: SetState2Action) => {
    dispatch(value);
  };

  const incrementMatchIndices = () => {
    // dispatch({ type: ACTIONS.INCREMENT_MATCH_INDICES });
    dispatch({ type: ACTIONS.INCREMENT_MATCH_INDICES });
  };

  // const sendStateToBackground = async (state: LayoverState) => {
  //   const stateWithoutFunctions: Partial<LayoverState> = Object.fromEntries(
  //     Object.entries(state).filter(
  //       ([key, value]) => typeof value !== 'function'
  //     )
  //   ) as Partial<LayoverState>;

  //   const message: UpdateTabStatesObjMsg = {
  //     // const message: StateUpdateMessage = {
  //     from: 'content:match-utils',
  //     // type: 'state-update',
  //     type: 'update-tab-states-obj',
  //     payload: {
  //       serializedState: stateWithoutFunctions,
  //     },
  //   };

  //   await sendMessageToBackground(message);
  // };
  // useEffect(() => {
  //   // const stateWithoutFunctions = Object.fromEntries(
  //   //   Object.entries(state).filter(
  //   //     ([key, value]) => typeof value !== 'function'
  //   //   )
  //   // );
  //   // console.log(
  //   //   'LayoverContext Updated: ',
  //   //   stateWithoutFunctions,
  //   //   '\nmatchesObj: ',
  //   //   state.state2Context.matchesObj
  //   // );

  //   // sendStateToBackground(state);
  //   const debouncedSendStateToBackground = debounce(
  //     sendStateToBackground,
  //     1000
  //   );

  //   // Send the state to the background script, debounced
  //   // debouncedSendStateToBackground(state);
  // }, [state, sendStateToBackground]);

  // useEffect(() => {
  //   const stateWithoutFunctions = Object.fromEntries(
  //     Object.entries(state).filter(
  //       ([key, value]) => typeof value !== 'function'
  //     )
  //   );
  //   console.log(
  //     'LayoverContext Updated: ',
  //     stateWithoutFunctions,
  //     '\nmatchesObj: ',
  //     state.state2Context.matchesObj
  //   );
  // }, [state]);

  return {
    ...state,
    setSearchValue,
    setLastSearchValue,
    setShowLayover: (value: boolean) =>
      dispatch({ type: 'SET_SHOW_LAYOVER', payload: value }),
    // toggleSearchLayover,
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
