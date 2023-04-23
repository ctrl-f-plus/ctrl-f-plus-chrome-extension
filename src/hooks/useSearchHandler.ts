import { useState } from 'react';
import { clearStoredMatchesObject, setStoredFindValue } from '../utils/storage';
import { useSendMessageToBackground } from './useSendMessageToBackground';

export const useSearchHandler = () => {
  const [searchValue, setSearchValue] = useState('');
  const { sendMessageToBackground } = useSendMessageToBackground();

  const handleSearchSubmit = async (findValue: string) => {
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

  const handleNext = () => {
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
    searchValue,
    setSearchValue,
    handleSearchSubmit,
    handleNext,
    handlePrevious,
  };
};
