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

const additionalStyles = `
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
/*
body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
}

.testingtesting123 {
    width: 434px !important;
    height: 36px !important;
    position: fixed !important;
    top: 0px !important;
    right: 0px !important;
    z-index: 2147483647 !important;
    background-color: red !important;
    box-shadow: 0px 0px 5px #0000009e !important;
}
*/
`;

// FIXME: Test this to see if you can just use showLayover directly instead of focus
interface SearchInputProps {
  focus: boolean; // or whatever type `focus` is supposed to be
}

function SearchInput2({ focus }: SearchInputProps) {
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

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="testingtesting123">
      {' '}
      <form
        onSubmit={handleSearchSubmit}
        className="pt-0.5 pb-0.5 text-white bg-white/5 grid grid-cols-4 "
      >
        <div className="relative col-span-3 grid grid-cols-6 gap-0 ">
          <input
            type="text"
            ref={searchInputRef}
            value={localSearchValue}
            onChange={handleInputChange}
            placeholder="Find on page"
            className="col-start-1 col-end-6 border-transparent focus:border-transparent focus:ring-0 text-white bg-transparent placeholder-gray-500 text-base"
          />
          {/* <div className="mx-2 my-auto">
            <p className="text-gray-500 text-right float-right">{matchingCounts}</p>
            <p className="text-gray-500 text-right float-right font-medium">
              0/10
            </p>
          </div> */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 text-base">{matchingCounts}</span>
          </div>
        </div>

        <button type="submit" className="hidden" aria-label="Submit" />

        <div className="flex justify-evenly items-center">
          <div className="border-l h-7 my-auto mx-0 px-0 border-gray-500" />

          <button
            onClick={previousMatch}
            type="button"
            className="inline-flex rounded-full p-0.5 text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-white
            "
            disabled={localSearchValue === ''}
          >
            <span className="sr-only">Previous</span>
            <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            onClick={nextMatch}
            type="button"
            className="inline-flex rounded-full p-0.5 text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            disabled={localSearchValue === ''}
          >
            <span className="sr-only">Previous</span>
            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            onClick={closeSearchLayover}
            type="button"
            className="inline-flex rounded-full p-0.5 text-white hover:bg-gray-500 hover:outline-none hover:ring-2 hover:ring-red-600
            hover:text-red-400"
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchInput2;
