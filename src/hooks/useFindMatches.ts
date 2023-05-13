// import { useContext } from 'react';
// import { SerializedTabState, TabId, TabState } from '../types/tab.types';
// import { serializeMatchesObj } from '../utils/htmlUtils';
// import {
//   findAllMatches,
//   nextMatch,
// } from '../utils/matchUtils/findMatchesUtils';
// import { LayoverContext } from '../contexts/LayoverContext';

// export const useFindMatches = () => {
//   const { state2, setState2 } = useContext(LayoverContext);

//   async function handleHighlight(
//     state2: TabState,
//     findValue: string,
//     tabId: TabId,
//     sendResponse: Function
//   ): Promise<void> {
//     // state2.tabId = tabId;

//     const newState2 = { ...state2, tabId: tabId };

//     await findAllMatches(newState2, findValue);

//     const serializedState: SerializedTabState = serializeMatchesObj({
//       ...newState2,
//     });

//     // const newState2 = { ...state2, tabId: tabId };
//     sendResponse({
//       hasMatch: newState2.matchesObj.length > 0,
//       serializedState: serializedState,
//     });
//   }

//   async function handleNextMatch(
//     state2: TabState,
//     sendResponse: Function
//   ): Promise<void> {
//     if (state2.matchesObj.length > 0) await nextMatch(state2);

//     const serializedState2: SerializedTabState = serializeMatchesObj({
//       ...state2,
//     });

//     sendResponse({
//       serializedState2: serializedState2,
//       status: 'success',
//     });
//   }

//   return {
//     handleHighlight,
//     handleNextMatch,
//   };
// };
