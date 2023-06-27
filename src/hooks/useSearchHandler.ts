// src/hooks/useSearchHandler.ts

import { useCallback, useContext } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { sendMessageToBackground } from '../utils/messaging/sendMessageToBackground';
import { clearAllStoredTabs } from '../utils/background/storage';
import {
  GET_ALL_MATCHES,
  REMOVE_ALL_HIGHLIGHT_MATCHES,
} from '../types/message.types';

export default function useSearchHandler() {
  const { setSearchValue, setLastSearchValue } = useContext(LayoverContext);

  const handleSearch = useCallback(
    async (newSearchValue: string): Promise<void> => {
      setSearchValue(newSearchValue);
      setLastSearchValue(newSearchValue);

      await clearAllStoredTabs(); // FIXME: review a) if you need this and b) its location

      // msg: RemoveAllHighlightMatchesMsg;
      await sendMessageToBackground({
        type: REMOVE_ALL_HIGHLIGHT_MATCHES,
      });

      // msg: GetAllMatchesMsg;
      await sendMessageToBackground({
        type: GET_ALL_MATCHES,
        payload: {
          searchValue: newSearchValue,
        },
      });
    },
    [setSearchValue, setLastSearchValue]
  );

  return {
    handleSearch,
  };
}
