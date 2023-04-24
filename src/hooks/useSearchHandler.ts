// src/hooks/useSearchHandler.ts

import { clearStoredMatchesObject, setStoredFindValue } from '../utils/storage';
import { useSendMessageToBackground } from './useSendMessageToBackground';

export const useSearchHandler = () => {
  const { sendMessageToBackground } = useSendMessageToBackground();

  const handleSearch = async (findValue: string) => {
    setStoredFindValue(findValue);

    await clearStoredMatchesObject();

    await sendMessageToBackground({
      from: 'content',
      type: 'remove-all-highlight-matches',
      payload: findValue,
    });

    sendMessageToBackground({
      from: 'content',
      type: 'get-all-matches-msg',
      payload: findValue,
    });
  };

  // ***1
  const handleNext = () => {
    debugger;
    sendMessageToBackground({
      from: 'content',
      type: 'next-match',
    });
  };

  const handlePrevious = () => {
    sendMessageToBackground({
      from: 'content',
      type: 'prev-match',
    });
  };

  return {
    handleSearch,
    handleNext,
    handlePrevious,
  };
};
