// src/hooks/useSearchHandler.ts

import { useCallback, useContext } from 'react';
import {
  clearAllStoredTabs,
  setStoredFindValue,
  setStoredLastSearchValue,
} from '../utils/storage';
import { useSendMessageToBackground } from './useSendMessageToBackground';
import { LayoverContext } from '../contexts/LayoverContext';

export const useSearchHandler = () => {
  const { sendMessageToBackground } = useSendMessageToBackground();
  const { setSearchValue, setLastSearchValue } = useContext(LayoverContext);

  const handleSearch = useCallback(
    async (findValue: string): Promise<void> => {
      setStoredFindValue(findValue);

      setStoredLastSearchValue(findValue);
      // setSearchValue(findValue);
      setLastSearchValue(findValue);

      await clearAllStoredTabs();

      await sendMessageToBackground({
        from: 'content',
        type: 'remove-all-highlight-matches',
      });

      if (findValue === '') return;

      sendMessageToBackground({
        from: 'content',
        type: 'get-all-matches-msg',
        payload: findValue,
      });
    },
    [sendMessageToBackground]
  );

  const handleNext = useCallback(async (): Promise<void> => {
    const response = await sendMessageToBackground({
      from: 'content',
      type: 'next-match',
    });
  }, [sendMessageToBackground]);

  const handlePrevious = useCallback((): void => {
    sendMessageToBackground({
      from: 'content',
      type: 'prev-match',
    });
  }, [sendMessageToBackground]);

  return {
    handleSearch,
    handleNext,
    handlePrevious,
  };
};
