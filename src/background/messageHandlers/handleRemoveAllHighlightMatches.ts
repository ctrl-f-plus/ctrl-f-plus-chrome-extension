// src/background/messageHandlers/handleRemoveAllHighlightMatches.ts

import { ResponseCallback } from '../../shared/types/shared.types';
import {
  REMOVE_HIGHLIGHT_MATCHES,
  RemoveHighlightMatchesMsg,
} from '../types/message.types';
import { queryCurrentWindowTabs } from '../utils/chromeApiUtils';
import sendMessageToTab from '../utils/sendMessageToContent';

export default async function handleRemoveAllHighlightMatches(
  sendResponse: ResponseCallback
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

  //-------------------------------------------------------------------------------
  // TODO: Verify that you don't need `Promise.allSettled` instead of `Promise.all`
  // const responses = await Promise.allSettled(tabPromises);

  // const fulfilledResponses = responses
  //   .filter((response) => response.status === 'fulfilled')
  //   .map((response) => (response as PromiseFulfilledResult<any>).value);

  // sendResponse(fulfilledResponses);
  //-------------------------------------------------------------------------------

  return true;
}
