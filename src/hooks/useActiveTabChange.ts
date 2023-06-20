// ctrl-f-plus-chrome-extension/src/hooks/useActiveTabChange.ts

// TODO: Review if you even need/want to keep this functionality. I don't really think it is necesary, though it might help ensure that we never have a layover left open somewhere from a bug.

import { useContext, useEffect } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { TabStateContext } from '../contexts/TabStateContext';

export default function useActiveTabChange() {
  const { showMatches, setShowLayover, activeTabId } =
    useContext(LayoverContext);
  const { tabStateContext } = useContext(TabStateContext);

  useEffect(() => {
    const handleActiveTabChange = () => {
      if (showMatches && activeTabId === tabStateContext.tabId) {
        setShowLayover(true);
      } else {
        setShowLayover(false);
      }
    };

    handleActiveTabChange();

    // TODO: Try to make sure that you test for the infinite loop that this dependency array causes:
    // }, [activeTabId, setShowLayover, showMatches, tabStateContext.tabId]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId, showMatches]);
}

// // ctrl-f-plus-chrome-extension/src/hooks/useActiveTabChange.ts

// import { useCallback, useContext, useEffect } from 'react';
// import { LayoverContext } from '../contexts/LayoverContext';
// import { TabStateContext } from '../contexts/TabStateContext';

// export default function useActiveTabChange() {
//   const { showMatches, setShowLayover, activeTabId } =
//     useContext(LayoverContext);
//   const { tabStateContext } = useContext(TabStateContext);

//   // const handleActiveTabChange = () => {
//   const handleActiveTabChange = useCallback(() => {
//     if (showMatches && activeTabId === tabStateContext.tabId) {
//       setShowLayover(true);
//     } else {
//       setShowLayover(false);
//     }
//   }, [activeTabId, setShowLayover, showMatches, tabStateContext.tabId]);

//   useEffect(() => {
//     handleActiveTabChange();
//   }, [handleActiveTabChange]);

//   // }, [activeTabId, setShowLayover, showMatches, tabStateContext.tabId]);

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, [activeTabId, showMatches]);
// }
