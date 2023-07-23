import React, { useCallback, useContext, useEffect } from 'react';
import { TabStore } from '../../background/types/Store.types';
import {
  HIGHLIGHT,
  REMOVE_HIGHLIGHT_MATCHES,
  ToLayoverMessage,
  UPDATED_STORE,
  UPDATE_HIGHLIGHTS,
} from '../../background/types/message.types';
import '../../tailwind.css';
import { LayoverContext } from '../contexts/LayoverContext';
import { TabStateContext } from '../contexts/TabStateContext';
import useActiveTabChange from '../hooks/useActiveTabChange';
import useEscapeKeyDown from '../hooks/useEscapeKeydown';
import useFindMatches from '../hooks/useFindMatches';
import useMessageHandler from '../hooks/useMessageHandler';
import useRemoveAllHighlightMatches from '../hooks/useRemoveAllHighlightMatches';
import { XPathTabState } from '../types/tab.types';
import removeAllHighlightMatches from '../utils/dom/removeAllHighlightMatches';
import restoreHighlightSpans from '../utils/dom/restoreHighlightSpans';
import deserializeTabState from '../utils/serialization/deserializeTabState';
import serializeTabState from '../utils/serialization/serializeTabState';
import DraggableContainer from './components/DraggableContainer';
import SearchInput from './components/SearchInput';
import { ResponseCallback } from '../../shared/types/shared.types';
import log from '../../shared/utils/logger';
import { ErrorBoundary } from 'react-error-boundary';

// @ts-ignore
// function fallbackRender({ error, resetErrorBoundary }) {
//   // Call resetErrorBoundary() to reset the error boundary and retry the render.
//   alert('Ctrl-F Plus - Something went wrong please reload extension');
//   return (
//     <div role="alert">
//       <p>Something went wrong:</p>
//       <pre style={{ color: 'red' }}>{error.message}</pre>
//     </div>
//   );
// }

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
  const updateContextFromStore = useCallback(async (tabStore: TabStore) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMessage = useCallback(
    async (
      message: ToLayoverMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: ResponseCallback
    ) => {
      log('Received message:', message);

      const { type } = message;
      let newState;

      switch (type) {
        case UPDATED_STORE: {
          const { tabStore } = message.payload;
          if (tabStore) {
            await updateContextFromStore(tabStore);
            sendResponse(true);
          }

          break;
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

  useMessageHandler(handleMessage);
  useEscapeKeyDown();
  useActiveTabChange();
  useRemoveAllHighlightMatches();

  return (
    <>
      {' '}
      {showLayover && (
        <div id="ctrl-f-plus-extension">
          <div className="font-open-sans ctrl-fixed ctrl-left-5 ctrl-top-10 ctrl-z-[9999] ctrl-w-screen">
            {' '}
            <DraggableContainer>
              {/* <ErrorBoundary fallbackRender={fallbackRender}> */}
              <SearchInput focus={showLayover} />
              {/* </ErrorBoundary> */}
            </DraggableContainer>
          </div>
        </div>
      )}
      ;
    </>
  );
}
export default Layover;
