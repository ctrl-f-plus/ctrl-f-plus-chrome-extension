// src/hooks/useSearchHandler.ts

import { useCallback, useContext } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { sendMessageToBackground } from '../utils/messageUtils/sendMessageToBackground';
import { clearAllStoredTabs } from '../background/storage';

export default function useSearchHandler() {
  const { setSearchValue, setLastSearchValue } = useContext(LayoverContext);

  const handleSearch = useCallback(
    async (newSearchValue: string): Promise<void> => {
      setSearchValue(newSearchValue);
      setLastSearchValue(newSearchValue);

      await clearAllStoredTabs(); // FIXME: review a) if you need this and b) its location

      await sendMessageToBackground({
        from: 'content',
        type: 'remove-all-highlight-matches',
      });

      await sendMessageToBackground({
        from: 'content',
        type: 'get-all-matches',
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
