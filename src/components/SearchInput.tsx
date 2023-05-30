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
      const curIdxRENAME_ME =
        tabStateContext.globalMatchIdxStart + tabStateContext.currentIndex + 1;

      setMatchingCounts(`${curIdxRENAME_ME}/${totalMatchesCount}`);
      // console.log(`${new Date().getTime()}`, ': ', matchingCounts);
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

          <div
            // className=" flex justify-evenly items-center"
            className="btn-group"
          >
            <div className="divider-x" />

            {/* <button
              type="button"
              onClick={previousMatch}
              className="group relative focus:outline-none w-5 h-5 p-1 rounded-full"
              disabled={localSearchValue === ''}
            >
              {' '}
              <div className="flex items-center justify-center h-full">
                <FontAwesomeIcon
                  size="sm"
                  icon={faAngleUp}
                  className="text-slate-200 z-10 group-hover:text-white group-disabled:text-slate-200"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
            </button>

            <button
              type="button"
              onClick={nextMatch}
              className="group relative focus:outline-none w-5 h-5 p-1 rounded-full"
              disabled={localSearchValue === ''}
            >
              {' '}
              <div className="flex items-center justify-center h-full">
                <FontAwesomeIcon
                  size="sm"
                  icon={faAngleDown}
                  className="text-slate-200 z-10 group-hover:text-white mt-0.5"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
            </button>

            <button
              onClick={closeSearchLayover}
              type="button"
              className="group relative focus:outline-none w-5 h-5 p-1 rounded-full"
            >
              {' '}
              <div className="flex items-center justify-center h-full">
                <FontAwesomeIcon
                  size="sm"
                  icon={faXmark}
                  className="text-slate-200 z-10 group-hover:text-red-400"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
            </button> */}

            <button
              onClick={previousMatch}
              type="button"
              className="next-prev-btn"
              disabled={localSearchValue === ''}
            >
              <span className="sr-only">Previous</span>
              <ChevronUpIcon className="h5w5" aria-hidden="true" />
            </button>

            <button
              onClick={nextMatch}
              type="button"
              className="next-prev-btn"
              disabled={localSearchValue === ''}
            >
              <span className="sr-only">Previous</span>
              <ChevronDownIcon className="h5w5" aria-hidden="true" />
            </button>

            <button
              onClick={closeSearchLayover}
              type="button"
              className="x-mark-btn"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h5w5" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SearchInput;
