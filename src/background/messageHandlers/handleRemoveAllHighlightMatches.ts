// src/background/messageHandlers/handleRemoveAllHighlightMatches.ts

import {
  REMOVE_HIGHLIGHT_MATCHES,
  RemoveHighlightMatchesMsg,
} from '../../types/message.types';
import { queryCurrentWindowTabs } from '../../utils/background/chromeApiUtils';
import sendMessageToTab from '../../utils/messaging/sendMessageToContentScripts';

// FIXME: Create a ts type of sendResponse and update throughout codebase
export default async function handleRemoveAllHighlightMatches(
  sendResponse: (response?: any) => void
) {
  const tabs = await queryCurrentWindowTabs();

  const tabPromises = tabs.map((tab) => {
    if (tab.id) {
      const msg: RemoveHighlightMatchesMsg = {
        async: false,
        type: REMOVE_HIGHLIGHT_MATCHES,
        payload: {
          tabId: tab.id,
        },
      };
      return sendMessageToTab<RemoveHighlightMatchesMsg>(tab.id, msg);
    }
    return Promise.resolve(null);
  });

  const responses = await Promise.all(tabPromises);
  sendResponse(responses);

  return true;
}
