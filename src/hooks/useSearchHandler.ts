// src/hooks/useSearchHandler.ts

import { useCallback, useContext } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import {
  sendMessageToBackground,
  sendMsgToBackground,
} from '../utils/messageUtils/sendMessageToBackground';
import {
  clearAllStoredTabs,
  setStoredFindValue,
  setStoredLastSearchValue,
} from '../utils/storage';

export const useSearchHandler = () => {
  const { setSearchValue, setLastSearchValue } = useContext(LayoverContext);

  const handleSearch = useCallback(
    async (newSearchValue: string): Promise<void> => {
      setSearchValue(newSearchValue);
      setLastSearchValue(newSearchValue);

      setStoredFindValue(newSearchValue);
      setStoredLastSearchValue(newSearchValue);

      await clearAllStoredTabs(); //FIXME: review a) if you need this and b) its location

      await sendMessageToBackground({
        from: 'content',
        type: 'remove-all-highlight-matches',
      });

      await sendMessageToBackground({
        from: 'content',
        type: 'get-all-matches-msg',
        payload: newSearchValue,
      });
    },
    [sendMessageToBackground, sendMsgToBackground]
  );

  const handlePrevious = useCallback((): void => {
    sendMessageToBackground({
      from: 'content',
      type: 'prev-match',
    });
  }, [sendMessageToBackground]);

  return {
    handleSearch,
    handlePrevious,
  };
};
