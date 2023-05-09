// src/utils/messageUtils/createMessages.ts

import { Store } from '../../background/store';
import { UpdateHighlightsMsg, UpdateStoreMsg } from '../../types/message.types';

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
