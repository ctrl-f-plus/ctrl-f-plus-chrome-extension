// OLD: works
// src/hooks/useSearchHandler.ts

import { useCallback, useContext } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { TransactionId } from '../types/message.types';
import {
  sendMessageToBackground,
  sendMsgToBackground,
} from '../utils/messageUtils/sendMessageToBackground';
import {
  clearAllStoredTabs,
  setStoredFindValue,
  setStoredLastSearchValue,
} from '../utils/storage';

// import { createGetAllMatchesMsg } from '../utils/messageUtils/createMessages';

// export function createGetAllMatchesMsg(findValue: string): GetAllMatchesMsg {
//   return {
//     from: 'content',
//     type: 'get-all-matches-msg',
//     payload: findValue,
//   };
// }

export const useSearchHandler = () => {
  // console.log('4. useSearchHandler');
  const { setSearchValue, setLastSearchValue } = useContext(LayoverContext);

  const handleSearch = useCallback(
    async (findValue: string): Promise<void> => {
      setStoredFindValue(findValue);

      setStoredLastSearchValue(findValue);
      // setSearchValue(findValue);
      setLastSearchValue(findValue);

      await clearAllStoredTabs(); //FIXME: review a) if you need this and b) its location

      await sendMessageToBackground({
        from: 'content',
        type: 'remove-all-highlight-matches',
      });

      if (findValue === '') return; //TODO: need to update count to 0 though

      await sendMessageToBackground({
        from: 'content',
        type: 'get-all-matches-msg',
        payload: findValue,
      });
      // debugger;

      // const getAllMatchesMsg = createGetAllMatchesMsg(findValue);
      // sendMsgToBackground<GetAllMatchesMsg>(getAllMatchesMsg);
    },
    [sendMessageToBackground, sendMsgToBackground]
  );

  const handleNext = useCallback(async (): Promise<void> => {
    await sendMessageToBackground({
      from: 'content',
      type: 'next-match',
      transactionId: Date.now().toString() as TransactionId,
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
