// src/utils/messageUtils/createMessages.ts
import { Store } from '../../background/store';
import {
  HighlightMsg,
  NextMatchMsg,
  PrevMatchMsg,
  UpdateHighlightsMsg,
  UpdateStoreMsg,
} from '../../types/message.types';
import { ValidTabId } from '../../types/tab.types';

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

// TODO: need to create message type
export function createToggleStylesMsg(addStyles: boolean) {
  return {
    from: 'background:backgroundUtils',
    type: addStyles ? 'add-styles' : 'remove-styles',
  };
}

// TODO: need to update/copy existing message type to a new message type
export function createRemoveAllHighlightMatchesMsg() {
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
