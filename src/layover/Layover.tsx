import React, { useCallback, useContext } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { TabStateContext } from '../contexts/TabStateContext';
import useActiveTabChange from '../hooks/useActiveTabChange';
import useEscapeKeyDown from '../hooks/useEscapeKeydown';
import useFindMatches from '../hooks/useFindMatches';
import useMessageHandler from '../hooks/useMessageHandler';
import useRemoveAllHighlightMatches from '../hooks/useRemoveAllHighlightMatches';
import '../tailwind.css';
import { TabStore } from '../types/Store.types';
import {
  UPDATED_STORE,
  HIGHLIGHT,
  REMOVE_HIGHLIGHT_MATCHES,
  ToLayoverMessage,
  UPDATE_HIGHLIGHTS,
} from '../types/message.types';
import { XPathTabState } from '../types/tab.types';
import deserializeTabState from '../utils/serialization/deserializeTabState';
import removeAllHighlightMatches from '../utils/dom/removeAllHighlightMatches';
import restoreHighlightSpans from '../utils/dom/restoreHighlightSpans';
import serializeTabState from '../utils/serialization/serializeTabState';
import DraggableContainer from './components/DraggableContainer';
import SearchInput from './components/SearchInput';

function Layover() {
  const {
    showLayover,
    setShowLayover,
    setSearchValue,
    setLastSearchValue,
    setShowMatches,
    setTotalMatchesCount,
    setLayoverPosition,
    setActiveTabId,
  } = useContext(LayoverContext);
  const { tabStateContext, setTabStateContext } = useContext(TabStateContext);
  const { updateHighlights, findAllMatches } = useFindMatches();

  // TODO: review how often this is rendered
  const updateContextFromStore = useCallback(
    async (tabStore: TabStore) => {
      setSearchValue(tabStore.searchValue);
      setLastSearchValue(tabStore.lastSearchValue);
      setShowLayover(tabStore.showLayover);
      setShowMatches(tabStore.showMatches);
      setTotalMatchesCount(tabStore.totalMatchesCount);
      setLayoverPosition(tabStore.layoverPosition);
      setActiveTabId(tabStore.activeTabId);

      const { serializedTabState } = tabStore;
      const xPathTabState: XPathTabState =
        deserializeTabState(serializedTabState);
      const tabState = restoreHighlightSpans(xPathTabState);

      setTabStateContext(tabState);
    },
    [
      setActiveTabId,
      setLastSearchValue,
      setLayoverPosition,
      setSearchValue,
      setShowLayover,
      setShowMatches,
      setTabStateContext,
      setTotalMatchesCount,
    ]
  );

  const handleMessage = useCallback(
    async (
      message: ToLayoverMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      console.log('Received message:', message);

      const { type } = message;
      let newState;

      switch (type) {
        case UPDATED_STORE: {
          const { tabStore } = message.payload;
          if (tabStore) {
            await updateContextFromStore(tabStore);
            sendResponse(true);
          }

          return true;
        }
        case REMOVE_HIGHLIGHT_MATCHES:
          removeAllHighlightMatches();
          break;
        case HIGHLIGHT: {
          const { searchValue, foundFirstMatch } = message.payload;
          newState = await findAllMatches(searchValue);

          const hasMatch = newState.matchesObj.length > 0;

          if (hasMatch && !foundFirstMatch) {
            newState = updateHighlights(newState, { endOfTab: false });
          }

          setTabStateContext(newState);

          const serializedState = serializeTabState(newState);

          sendResponse({
            hasMatch,
            serializedState,
          });
          return true;
        }
        case UPDATE_HIGHLIGHTS: {
          newState = updateHighlights(
            { ...tabStateContext },
            { endOfTab: false }
          );

          setTabStateContext(newState);

          const newSerializedState = serializeTabState(newState);

          sendResponse({ status: 'success', newSerializedState });
          return true;
        }
        default:
          break;
      }

      return true;
    },
    [
      tabStateContext,
      setTabStateContext,
      updateHighlights,
      updateContextFromStore,
      findAllMatches,
    ]
  );

  // FIXME: (***878)
  useMessageHandler(handleMessage);
  useEscapeKeyDown();
  useActiveTabChange();
  useRemoveAllHighlightMatches();

  return (
    <>
      {' '}
      {showLayover && (
        <div id="ctrl-f-plus-extension">
          <div className="ctrl-fixed ctrl-left-5 ctrl-top-10 ctrl-z-[9999] ctrl-w-screen">
            {' '}
            <DraggableContainer>
              <SearchInput focus={showLayover} />
            </DraggableContainer>
          </div>
        </div>
      )}
    </>
  );
}
export default Layover;
