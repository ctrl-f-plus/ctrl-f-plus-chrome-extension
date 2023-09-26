// src/contentScripts/layover/components/SearchInput.tsx

import React, {
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { LayoverContext } from '../../contexts/LayoverContext';
import { TabStateContext } from '../../contexts/TabStateContext';
import useFindMatches from '../../hooks/useFindMatches';
import useSearchHandler from '../../hooks/useSearchHandler';
import {
  REMOVE_ALL_STYLES,
  RemoveAllStylesMsg,
} from '../../types/toBackgroundMessage.types';
import sendMessageToBackground from '../../utils/messaging/sendMessageToBackground';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from './Icons';

type SearchInputProps = {
  focus: boolean;
};

function SearchInput({ focus }: SearchInputProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const matchingCountsRef = useRef(null);
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

  const closeSearchLayover = () => {
    sendMessageToBackground<RemoveAllStylesMsg>({ type: REMOVE_ALL_STYLES });
  };

  // TODO: Add debounce
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
    <div className="h-[44px] w-[432px] rounded-[9px] bg-cod-gray/90 px-[16px]  ">
      <form
        onSubmit={handleSearchSubmit}
        className="flex h-full w-full flex-row items-center gap-[12px]"
        data-testid="inputForm"
      >
        <input
          ref={searchInputRef}
          type="text"
          value={localSearchValue}
          onChange={handleInputChange}
          className="leading-6-pp w-full shrink bg-transparent font-sans text-base-pp text-white placeholder:text-gray-400 focus:outline-none"
          placeholder="Find on page"
        />

        <button type="submit" className="hidden" aria-label="Submit" />

        <div className="flex h-full flex-shrink-0 flex-row items-center gap-[12px] focus:outline-none">
          <div className="pointer-events-none flex grow">
            <div
              ref={matchingCountsRef}
              data-testid="matching-counts"
              className={`leading-6-pp font-sans text-base-pp ${
                matchingCounts === '0/0' || localSearchValue !== lastSearchValue
                  ? 'text-gray-400'
                  : 'text-white'
              }

                `}
            >
              {matchingCounts}
            </div>
          </div>

          <div className="border-w ml-0 mr-0 h-[28px] border-l border-gray-400 pl-0 pr-0" />

          <button
            onClick={previousMatch}
            type="button"
            id="previous-match-btn"
            data-testid="previous-match-btn"
            className="inline-flex rounded-full p-[2px] text-white hover:bg-gray-500 active:ring-2 active:ring-white disabled:cursor-default disabled:text-gray-400 disabled:ring-0 disabled:hover:bg-transparent"
            disabled={matchingCounts === '0/0'}
          >
            <span className="sr-only">Previous</span>
            <ChevronUpIcon className="h-[20px] w-[20px]" aria-hidden="true" />
          </button>

          <button
            onClick={nextMatch}
            type="button"
            id="next-match-btn"
            data-testid="next-match-btn"
            className="inline-flex rounded-full p-[2px] text-white hover:bg-gray-500 active:ring-2 active:ring-white disabled:cursor-default disabled:text-gray-400 disabled:ring-0 disabled:hover:bg-transparent"
            disabled={matchingCounts === '0/0'}
          >
            <span className="sr-only">Next</span>
            <ChevronDownIcon className="h-[20px] w-[20px]" aria-hidden="true" />
          </button>

          <button
            onClick={closeSearchLayover}
            type="button"
            id="close-layover-btn"
            data-testid="close-layover-btn"
            className="inline-flex rounded-full p-[2px] text-white hover:bg-gray-500 focus:ring-2 focus:ring-bittersweet active:ring-2 active:ring-bittersweet"
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon
              className="h-[20px] w-[20px] active:text-bittersweet"
              aria-hidden="true"
            />
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchInput;
