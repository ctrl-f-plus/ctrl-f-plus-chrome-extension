// src/contentScripts/layover/components/SearchInput.tsx

import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import React, {
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import '../../../tailwind.css';
import { LayoverContext } from '../../contexts/LayoverContext';
import { TabStateContext } from '../../contexts/TabStateContext';
import useFindMatches from '../../hooks/useFindMatches';
import useSearchHandler from '../../hooks/useSearchHandler';
import {
  REMOVE_ALL_STYLES,
  RemoveAllStylesMsg,
} from '../../types/toBackgroundMessage.types';
import sendMessageToBackground from '../../utils/messaging/sendMessageToBackground';
import '../styles.css';

type SearchInputProps = {
  focus: boolean;
};

function SearchInput({ focus }: SearchInputProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const {
    searchValue,
    showLayover,
    showMatches,
    lastSearchValue,
    totalMatchesCount,
  } = useContext(LayoverContext);
  const { tabStateContext } = useContext(TabStateContext);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  const [matchingCounts, setMatchingCounts] = useState('0/0');

  const { nextMatch, previousMatch } = useFindMatches();
  const { handleSearch } = useSearchHandler();

  // TODO: Review to decide if you want to handle this in another way
  const closeSearchLayover = () => {
    sendMessageToBackground<RemoveAllStylesMsg>({ type: REMOVE_ALL_STYLES });
  };

  // TODO: CLEANUP:
  //  - Add debounce
  //  - remove lastSearchValue and all related code
  //  - try adding e.preventDefault to handleNext()
  //  - update searchInput count
  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (searchInputRef.current) {
      if (localSearchValue === lastSearchValue) {
        nextMatch();
      } else {
        handleSearch(localSearchValue);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setLocalSearchValue(newValue);
    setInitialLoad(false);
  };

  useEffect(() => {
    if (focus && searchInputRef.current) {
      searchInputRef.current.focus();

      if (localSearchValue && initialLoad) {
        searchInputRef.current.select();
        setInitialLoad(false);
      }
    }
  }, [focus, initialLoad, localSearchValue]);

  useEffect(() => {
    if (
      tabStateContext.globalMatchIdxStart !== undefined &&
      tabStateContext.currentIndex !== undefined
    ) {
      const currentMatchIndex =
        tabStateContext.globalMatchIdxStart + tabStateContext.currentIndex + 1;

      setMatchingCounts(`${currentMatchIndex}/${totalMatchesCount}`);
    }
  }, [totalMatchesCount, tabStateContext, showLayover, showMatches]);

  return (
    <div id="ctrl-f-search-input">
      <div className="overlay-wrapper">
        <form
          onSubmit={handleSearchSubmit}
          className="form-wrapper"
          data-testid="inputForm"
        >
          <div className="form-div">
            <input
              ref={searchInputRef}
              type="text"
              value={localSearchValue}
              onChange={handleInputChange}
              className="input-style"
              placeholder="Find on page"
            />
            <div className="matching-counts-wrapper">
              <p className="matching-counts">{matchingCounts}</p>
            </div>
          </div>

          <button type="submit" className="hidden" aria-label="Submit" />

          <div className="btn-group">
            <div className="divider-x" />

            {/* FIXME: Hacky, intermixing custom css and tailwind css on button elements to implement the active:rings */}
            <button
              onClick={previousMatch}
              type="button"
              id="previous-match-btn"
              data-testid="previous-match-btn"
              className="next-prev-btn active:ctrl-ring-2 active:ctrl-ring-white"
              disabled={localSearchValue === ''}
            >
              <span className="sr-only">Previous</span>
              <ChevronUpIcon className="btn-icon" aria-hidden="true" />
            </button>

            <button
              onClick={nextMatch}
              type="button"
              id="next-match-btn"
              data-testid="next-match-btn"
              className="next-prev-btn active:ctrl-ring-2 active:ctrl-ring-white"
              disabled={localSearchValue === ''}
            >
              <span className="sr-only">Next</span>
              <ChevronDownIcon className="btn-icon" aria-hidden="true" />
            </button>

            <button
              onClick={closeSearchLayover}
              type="button"
              id="close-layover-btn"
              data-testid="close-layover-btn"
              className="x-mark-btn focus:ctrl-ring-2 focus:ctrl-ring-red-600"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="btn-icon" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SearchInput;
