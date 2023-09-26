// src/contentScripts/hooks/useActiveTabChange.ts

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

    // TODO: Write test(s) that fails in the presence of infinite looping.
    //       The following dependency array causes an infinite loop:
    //       }, [activeTabId, setShowLayover, showMatches, tabStateContext.tabId]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId]);
}
