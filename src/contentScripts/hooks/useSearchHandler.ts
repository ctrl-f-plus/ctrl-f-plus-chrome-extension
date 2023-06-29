// src/contentScripts/hooks/useSearchHandler.ts

import { useCallback, useContext } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import {
  GET_ALL_MATCHES,
  GetAllMatchesMsg,
  REMOVE_ALL_HIGHLIGHT_MATCHES,
  RemoveAllHighlightMatchesMsg,
} from '../types/message.types';
import { clearAllStoredTabs } from '../../background/utils/storage';
import { sendMessageToBackground } from '../utils/messaging/sendMessageToBackground';

export default function useSearchHandler() {
  const { setSearchValue, setLastSearchValue } = useContext(LayoverContext);

  const handleSearch = useCallback(
    async (newSearchValue: string): Promise<void> => {
      setSearchValue(newSearchValue);
      setLastSearchValue(newSearchValue);

      await clearAllStoredTabs(); // FIXME: review a) if you need this and b) its location

      await sendMessageToBackground<RemoveAllHighlightMatchesMsg>({
        type: REMOVE_ALL_HIGHLIGHT_MATCHES,
      });

      await sendMessageToBackground<GetAllMatchesMsg>({
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
