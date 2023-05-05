// src/hooks/useSearchHandler.ts

import { useCallback } from 'react';
import { clearAllStoredTabs, setStoredFindValue } from '../utils/storage';
import { useSendMessageToBackground } from './useSendMessageToBackground';

export const useSearchHandler = () => {
  const { sendMessageToBackground } = useSendMessageToBackground();

  const handleSearch = useCallback(
    async (findValue: string): Promise<void> => {
      setStoredFindValue(findValue);

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

  const handleNext = useCallback((): void => {
    sendMessageToBackground({
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
