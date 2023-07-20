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

    // TODO: Try to make sure that you test for the infinite loop that this dependency array causes:
    // }, [activeTabId, setShowLayover, showMatches, tabStateContext.tabId]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId]);
}
