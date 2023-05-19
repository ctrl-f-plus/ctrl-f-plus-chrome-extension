// src/utils/messageUtils/createMessages.ts

import { Store } from '../../background/store';
import { LayoverPosition } from '../../components/Layover';
import {
  GetAllMatchesMsg,
  HighlightMsg,
  NextMatchMsg,
  NextMatch_msg,
  PrevMatchMsg,
  PrevMatch_msg,
  RemoveAllHighlightMatchesMsg,
  RemoveAllHighlightMatches_msg,
  SwitchTabMsg,
  ToggleSearchLayoverMsg,
  // ToggleStylesAllTabs,
  ToggleStylesMsg,
  TransactionId,
  UpdateHighlightsMsg,
  UpdateLayoverPositionMsg,
  UpdateStoreMsg,
  UpdateTabStatesObjMsg,
} from '../../types/message.types';
import { SerializedTabState, TabId, ValidTabId } from '../../types/tab.types';

/**
 * FROM: Background
 * TO: Content
 */
export function createUpdateStoreMsg(store: Store): UpdateStoreMsg {
  return {
    from: 'background:store',
    type: 'store-updated',
    payload: {},
  };
}

export function createToggleStylesMsg(
  addStyles: boolean,
  payload: any
): ToggleStylesMsg {
  return {
    from: 'background:backgroundUtils',
    type: 'add-styles',
    payload,
  };
}

// export function createRemoveAllHighlightMatchesMsg(): RemoveAllHighlightMatchesMsg {
//   return {
//     from: 'background:backgroundUtils',
//     type: 'remove-all-highlight-matches',
//   };
// }

export function createNextMatchMsg(
  tabId: TabId,
  transactionId: TransactionId
): NextMatchMsg {
  return {
    from: 'background:backgroundUtils',
    type: 'next-match',
    payload: { tabId },
    transactionId: transactionId,
  };
}

export function createPrevMatchMsg(): PrevMatchMsg {
  return {
    from: 'background:backgroundUtils',
    type: 'prev-match',
  };
}

export function createHighlightMsg(
  findValue: string,
  tabId: ValidTabId,
  foundFirstMatch: boolean
): HighlightMsg {
  return {
    async: true,
    from: 'background',
    type: 'highlight',
    findValue: findValue,
    foundFirstMatch,
    tabId: tabId,
    tabState: {},
  };
}

export function createUpdateHighlightsMsg(tabId: number): UpdateHighlightsMsg {
  return {
    from: 'background',
    type: 'update-highlights',
    prevIndex: undefined,
    payload: {
      tabId: tabId,
    },
  };
}

export function createToggleSearchLayoverMsg(): ToggleSearchLayoverMsg {
  return {
    from: 'background',
    type: 'toggle_search_layover',
  };
}

/**
 * FROM: Content
 * TO: Background
 */
export function createSwitchTabMsg(
  serializedState: SerializedTabState,
  prevIndex: number | undefined = undefined
): SwitchTabMsg {
  return {
    from: 'content-script-match-utils',
    type: 'switch-tab',
    serializedState: serializedState,
    prevIndex: prevIndex,
  };
}

export function createSwitchTabMsg2(
  serializedState: SerializedTabState,
  prevIndex: number | undefined = undefined
): SwitchTabMsg {
  return {
    from: 'content-script-match-utils',
    type: 'switch-tab',
    serializedState: serializedState,
    prevIndex: prevIndex,
  };
}

export function createUpdateTabStatesObjMsg(
  serializedState: SerializedTabState
): UpdateTabStatesObjMsg {
  return {
    from: 'content:match-utils',
    type: 'update-tab-states-obj',
    payload: {
      serializedState,
    },
  };
}

export function createUpdateLayoverPositionMsg(
  newPosition: LayoverPosition
): UpdateLayoverPositionMsg {
  return {
    from: 'content:layover-component',
    type: 'update-layover-position',
    payload: {
      newPosition,
    },
  };
}

// export const createGetAllMatchesMsg = (findValue: string): GetAllMatchesMsg => {
export function createGetAllMatchesMsg(findValue: string): GetAllMatchesMsg {
  return {
    from: 'content',
    type: 'get-all-matches-msg',
    payload: findValue,
  };
}

export function createNextMatch_msg(): NextMatch_msg {
  return {
    from: 'content',
    type: 'next-match',
  };
}

export function createPrevMatch_msg(): PrevMatch_msg {
  return {
    from: 'content',
    type: 'prev-match',
  };
}
