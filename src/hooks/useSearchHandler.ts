// New: does not work
// src/hooks/useSearchHandler.ts

// import { useCallback, useContext } from 'react';
// import {
//   clearAllStoredTabs,
//   setStoredFindValue,
//   setStoredLastSearchValue,
// } from '../utils/storage';
// import { sendMsgToBackground } from '../utils/messageUtils/sendMessageToBackground';
// import { LayoverContext } from '../contexts/LayoverContext';
// import {
//   createGetAllMatchesMsg,
//   createNextMatchMsg,
//   createNextMatch_msg,
//   createPrevMatchMsg,
//   createPrevMatch_msg,
//   createRemoveAllHighlightMatchesMsg,
//   createRemoveAllHighlightMatches_msg,
// } from '../utils/messageUtils/createMessages';
// import {
//   GetAllMatchesMsg,
//   PrevMatchMsg,
//   RemoveAllHighlightMatchesMsg,
//   RemoveAllHighlightMatches_msg,
//   NextMatch_msg,
//   PrevMatch_msg,
// } from '../types/message.types';

// export const useSearchHandler = () => {
//   const { setSearchValue, setLastSearchValue } = useContext(LayoverContext);

//   const handleSearch = useCallback(
//     async (findValue: string): Promise<void> => {
//       setStoredFindValue(findValue);

//       setStoredLastSearchValue(findValue);
//       // setSearchValue(findValue);
//       setLastSearchValue(findValue);

//       await clearAllStoredTabs();

//       const removeAllHighlights_msg = createRemoveAllHighlightMatches_msg();
//       await sendMsgToBackground<RemoveAllHighlightMatches_msg>(
//         removeAllHighlights_msg
//       );

//       if (findValue === '') return;

//       const getAllMatchesMsg = createGetAllMatchesMsg(findValue);
//       sendMsgToBackground<GetAllMatchesMsg>(getAllMatchesMsg);
//     },
//     [sendMsgToBackground]
//   );

//   const handleNext = useCallback(async (): Promise<void> => {
//     const nextMatch_msg = createNextMatch_msg();
//     await sendMsgToBackground<NextMatch_msg>(nextMatch_msg);
//   }, [sendMsgToBackground]);

//   const handlePrevious = useCallback((): void => {
//     const prevMatch_msg = createPrevMatch_msg();
//     sendMsgToBackground<PrevMatch_msg>(prevMatch_msg);
//   }, [sendMsgToBackground]);

//   return {
//     handleSearch,
//     handleNext,
//     handlePrevious,
//   };
// };

// OLD: works
// src/hooks/useSearchHandler.ts

import { useCallback, useContext } from 'react';
import {
  clearAllStoredTabs,
  setStoredFindValue,
  setStoredLastSearchValue,
} from '../utils/storage';
import {
  sendMessageToBackground,
  sendMsgToBackground,
} from '../utils/messageUtils/sendMessageToBackground';
import { LayoverContext } from '../contexts/LayoverContext';
import { GetAllMatchesMsg } from '../types/message.types';

// import { createGetAllMatchesMsg } from '../utils/messageUtils/createMessages';

export function createGetAllMatchesMsg(findValue: string): GetAllMatchesMsg {
  return {
    from: 'content',
    type: 'get-all-matches-msg',
    payload: findValue,
  };
}

export const useSearchHandler = () => {
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
      // debugger;

      if (findValue === '') return;

      // sendMessageToBackground({
      //   from: 'content',
      //   type: 'get-all-matches-msg',
      //   payload: findValue,
      // });

      const getAllMatchesMsg = createGetAllMatchesMsg(findValue);
      sendMsgToBackground<GetAllMatchesMsg>(getAllMatchesMsg);
    },
    [sendMessageToBackground, sendMsgToBackground]
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
