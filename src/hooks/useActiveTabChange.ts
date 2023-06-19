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
  }, [activeTabId, setShowLayover, showMatches, tabStateContext.tabId]);
}
