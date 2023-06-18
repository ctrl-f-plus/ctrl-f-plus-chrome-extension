// src/components/SearchInput.tsx

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
import { LayoverContext } from '../contexts/LayoverContext';
import { TabStateContext } from '../contexts/TabStateContext';
import useFindMatches from '../hooks/useFindMatches';
import useSearchHandler from '../hooks/useSearchHandler';
import { sendMessageToBackground } from '../utils/messageUtils/sendMessageToBackground';
import './SearchInputStyles.css';
import '../tailwind.css';

// FIXME: Test this to see if you can just use showLayover directly instead of focus
interface SearchInputProps {
  focus: boolean; // or whatever type `focus` is supposed to be
}

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
    sendMessageToBackground({
      from: 'content',
      type: 'remove-styles-all-tabs',
    });
  };

  // TODO: CLEANUP:
  //  - Add debounce
  //  - remove lastSearchValue and all realted code
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
  }, [focus, localSearchValue]);

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
    <div id="cntrl-f-search-input">
      <div className="overlay-wrapper">
        <form
          onSubmit={handleSearchSubmit}
          // className="w-full p-2 text-white bg-black bg-opacity-75 rounded grid grid-cols-4 divide-x divide-slate-200"
          className="form-wrapper"
        >
          <div
            // className="col-span-3 grid grid-cols-6 gap-0 "
            className="form-div"
          >
            <input
              ref={searchInputRef}
              type="text"
              value={localSearchValue}
              onChange={handleInputChange}
              // className="text-white placeholder-white bg-transparent focus:outline-none col-start-1 col-end-6 "
              className="input-style"
              placeholder="Find on page"
            />
            <div
              // className="mx-2 my-auto"
              className="matching-counts-wrapper"
            >
              <p
                // className="text-right float-right"
                className="matching-counts"
              >
                {matchingCounts}
              </p>
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
