// src/background/messageHandlers/handleRemoveAllHighlightMatches.ts

import { ResponseCallback } from '../../shared/types/shared.types';
import {
  REMOVE_HIGHLIGHT_MATCHES,
  RemoveHighlightMatchesMsg,
} from '../types/message.types';
import { queryCurrentWindowTabs } from '../utils/chromeApiUtils';
import sendMessageToTab from '../utils/sendMessageToContent';
import store from '../store/databaseStore';

// FIXME: Create a ts type of sendResponse and update throughout codebase
export default async function handleRemoveAllHighlightMatches(
  sendResponse: ResponseCallback
) {
  // const tabs = await queryCurrentWindowTabs();
  const tabIds = Object.keys(store.activeWindowStore.tabStores);

  const tabPromises = tabIds.map((tabId) => {
    if (tabId) {
      const msg: RemoveHighlightMatchesMsg = {
        async: false,
        type: REMOVE_HIGHLIGHT_MATCHES,
        payload: {
          tabId: Number(tabId),
        },
      };
      return sendMessageToTab<RemoveHighlightMatchesMsg>(Number(tabId), msg);
    }
    return Promise.resolve(null);
  });

  const responses = await Promise.all(tabPromises);
  sendResponse(responses);

  return true;
}
