// src/background/messageHandlers/handleRemoveAllHighlightMatches.ts

import { RemoveAllHighlightMatchesMsg } from '../../types/message.types';
import sendMessageToTab from '../../utils/messageUtils/sendMessageToContentScripts';
import { queryCurrentWindowTabs } from '../helpers/chromeAPI';

// FIXME: Create a ts type of sendResponse and update throughout codebase
export default async function handleRemoveAllHighlightMatches(
  sendResponse: (response?: any) => void
) {
  const tabs = await queryCurrentWindowTabs();

  const tabPromises = tabs.map((tab) => {
    if (tab.id) {
      const msg: RemoveAllHighlightMatchesMsg = {
        async: false,
        from: 'background:backgroundUtils',
        type: 'remove-all-highlight-matches',
        payload: {
          tabId: tab.id,
        },
      };
      return sendMessageToTab<RemoveAllHighlightMatchesMsg>(tab.id, msg);
    }
    return Promise.resolve(null);
  });

  const responses = await Promise.all(tabPromises);
  sendResponse(responses);

  return true;
}
