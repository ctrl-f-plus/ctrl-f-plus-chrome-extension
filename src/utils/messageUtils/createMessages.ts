// src/utils/messageUtils/createMessages.ts
import { Store } from '../../background/store';
import {
  HighlightMsg,
  NextMatchMsg,
  PrevMatchMsg,
  RemoveAllHighlightMatchesMsg,
  SwitchTabMsg,
  SwitchedActiveTabHideLayover,
  SwitchedActiveTabShowLayover,
  ToggleStylesMsg,
  UpdateHighlightsMsg,
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
