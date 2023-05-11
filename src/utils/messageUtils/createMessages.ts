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
  SwitchedActiveTabHideLayover,
  SwitchedActiveTabShowLayover,
  ToggleSearchLayoverMsg,
  ToggleStylesAllTabs,
  ToggleStylesMsg,
  UpdateHighlightsMsg,
  UpdateLayoverPositionMsg,
  UpdateStoreMsg,
  UpdateTabStatesObjMsg,
} from '../../types/message.types';
import { SerializedTabState, ValidTabId } from '../../types/tab.types';

/**
 * FROM: Background
 * TO: Content
 */
export function createUpdateStoreMsg(store: Store): UpdateStoreMsg {
  return {
    from: 'background:store',
    type: 'store-updated',
    payload: {
      store,
    },
  };
}

export function createUpdateHighlightsMsg(tabId: number): UpdateHighlightsMsg {
  return {
    from: 'background',
    type: 'update-highlights',
    prevIndex: undefined,
  };
}

export function createToggleStylesMsg(addStyles: boolean): ToggleStylesMsg {
  return {
    from: 'background:backgroundUtils',
    type: addStyles ? 'add-styles' : 'remove-styles',
  };
}

export function createRemoveAllHighlightMatchesMsg(): RemoveAllHighlightMatchesMsg {
  return {
    from: 'background:backgroundUtils',
    type: 'remove-all-highlight-matches',
  };
}

export function createNextMatchMsg(): NextMatchMsg {
  return {
    from: 'background:backgroundUtils',
    type: 'next-match',
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
  tabId: ValidTabId
): HighlightMsg {
  return {
    from: 'background',
    type: 'highlight',
    findValue: findValue,
    tabId: tabId,
    tabState: {},
  };
}

export function createSwitchedActiveTabShowLayoverMsg(): SwitchedActiveTabShowLayover {
  return {
    from: 'background',
    type: 'switched-active-tab-show-layover',
  };
}

export function createSwitchedActiveTabHideLayoverMsg(): SwitchedActiveTabHideLayover {
  return {
    from: 'background',
    type: 'switched-active-tab-hide-layover',
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

// TODO: consolidate with `createToggleStylesMsg()`??
export function createToggleStylesAllTabsMsg(
  addStlyes: boolean
): ToggleStylesAllTabs {
  // debugger;
  return {
    from: 'content',
    type: addStlyes ? 'add-styles-all-tabs' : 'remove-styles-all-tabs',
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

// FIXME:consoliate?
export function createRemoveAllHighlightMatches_msg(): RemoveAllHighlightMatches_msg {
  return {
    from: 'content',
    type: 'remove-all-highlight-matches',
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