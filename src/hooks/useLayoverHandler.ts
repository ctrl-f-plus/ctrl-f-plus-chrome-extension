// src/hooks/useLayoverHandler.ts

import { useCallback, useState } from 'react';
import { setStoredFindValue } from '../utils/storage';
import { useSendMessageToBackground } from './useSendMessageToBackground';

export const useLayoverHandler = () => {
  const [showLayover, setShowLayover] = useState<boolean>(false);
  const [showMatches, setShowMatches] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [totalMatchesCount, setTotalMatchesCount] = useState<number>(0);
  const [globalMatchIdx, setglobalMatchIdx] = useState<number>(0);

  const { sendMessageToBackground } = useSendMessageToBackground();

  const toggleSearchLayover = useCallback(
    (forceShowLayover?: boolean) => {
      const openSearchLayover = () => {
        sendMessageToBackground({
          from: 'content',
          type: 'add-styles-all-tabs',
        });

        setShowMatches(true);
      };

      const closeSearchLayover = (searchValue: string) => {
        // TODO: NEED TO RUN SEARCHSUBMIT, BUT WITHOUT THE CSS INJECTION (test by typing a new value into search input then hitting `esc` key)
        setStoredFindValue(searchValue);
        sendMessageToBackground({
          from: 'content',
          type: 'remove-styles-all-tabs',
        });
        setShowMatches(false);
      };

      const newState =
        forceShowLayover === undefined ? !showLayover : forceShowLayover;

      newState ? openSearchLayover() : closeSearchLayover(searchValue);
      setShowLayover(newState);
    },
    [sendMessageToBackground]
  );

  return {
    showLayover,
    setShowLayover,
    toggleSearchLayover,
    searchValue,
    setSearchValue,
    showMatches,
    setShowMatches,
    totalMatchesCount,
    setTotalMatchesCount,
    globalMatchIdx,
    setglobalMatchIdx,
  };
};
