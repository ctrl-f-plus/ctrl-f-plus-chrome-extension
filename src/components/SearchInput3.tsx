// src/components/SearchInput.tsx

import {
  faAngleDown,
  faAngleUp,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';

const additionalStyles0 = `
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

.pt-0\.5 {
  padding-top: 0.125rem/* 2px */ !important;
}

.pb-0\.5 {
  padding-bottom: 0.125rem/* 2px */ !important;
}

.text-white {
  --tw-text-opacity: 1 !important;
  color: rgb(255 255 255 / var(--tw-text-opacity)) !important;
}

.bg-white\/5 {
  background-color: rgb(255 255 255 / 0.05) !important;
}

.grid {
  display: grid !important;
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}


//
.w-full {
  width: 100% !important;
}

.h-full {
  height: 100% !important;
}

.text-white {
  --tw-text-opacity: 1 !important;
  color: rgb(255 255 255 / var(--tw-text-opacity)) !important;
}

.bg-black {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity)) !important;
}

.bg-opacity-75 {
  --tw-bg-opacity: 0.75 !important;
}

.rounded {
  border-radius: 0.25rem/* 4px */ !important;
}

.grid {
  display: grid !important;
}
.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}

.divide-x > :not([hidden]) ~ :not([hidden]) {
  --tw-divide-x-reverse: 0 !important;
  border-right-width: calc(1px * var(--tw-divide-x-reverse)) !important;
  border-left-width: calc(1px * calc(1 - var(--tw-divide-x-reverse))) !important;
}

.divide-slate-200 > :not([hidden]) ~ :not([hidden]) {
  --tw-divide-opacity: 1 !important;
  border-color: rgb(226 232 240 / var(--tw-divide-opacity)) !important;
}
`;

const additionalStyles = `
.testingtesting123 {
    width: 434px !important;
    height: 36px !important;
    position: fixed !important;
    top: 0px !important;
    right: 0px !important;
    z-index: 2147483647 !important;
    background-color: red !important;
    box-shadow: 0px 0px 5px #0000009e !important;
    padding: 0px !important;
    margin: 0px !important;
    --tw-bg-opacity: 1 !important;
    background-color: rgb(30 41 59 / var(--tw-bg-opacity)) !important;
    font-family: sans-serif;
}

.form-wrap {
  padding-top: 0.125rem /* 2px */ !important;
  padding-bottom: 0.125rem /* 2px */ !important;
  --tw-text-opacity: 1 !important;
  color: rgb(255 255 255 / var(--tw-text-opacity)) !important;
  --tw-text-opacity: 1 !important;
  color: rgb(255 255 255 / var(--tw-text-opacity)) !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}

.form-div {
  position: relative !important;
  display: grid !important;
  grid-column: span 3 / span 3 !important;
  grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
  gap: 0px !important;
}

.input-style {
  grid-column-start: 1 !important;
  grid-column-end: 6 !important;
  border-color: transparent !important;
  --tw-text-opacity: 1 !important;
  color: rgb(255 255 255 / var(--tw-text-opacity)) !important;
  background-color: transparent !important;
  font-size: 1rem /* 16px */ !important;
  line-height: 1.5rem /* 24px */ !important;
}


.input-style:focus {
  border-color: transparent !important;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000) !important;
}

.input-style::placeholder {
  --tw-placeholder-opacity: 1 !important;
  color: rgb(107 114 128 / var(--tw-placeholder-opacity)) !important;
}

.matching-counts-wrapper {
  pointer-events: none !important;
  position: absolute !important;
  top: 0px !important;
  bottom: 0px !important;
  top: 0px !important;
  bottom: 0px !important;
  display: flex !important;
}

.matching-counts {
  --tw-text-opacity: 1 !important;
  color: rgb(107 114 128 / var(--tw-text-opacity)) !important;
  font-size: 1rem /* 16px */ !important;
  line-height: 1.5rem /* 24px */ !important;
}

.hidden {
  display: none !important;
}

.btn-group {
  display: flex !important;
  justify-content: space-evenly !important;
  align-items: center !important;
}

.divider-x {
  border-left-width: 1px !important;
  height: 1.75rem /* 28px */ !important;
  margin-top: auto !important;
  margin-bottom: auto !important;
  margin-top: auto !important;
  margin-bottom: auto !important;
  --tw-border-opacity: 1 !important;
  border-color: rgb(107 114 128 / var(--tw-border-opacity)) !important;
}

.next-prev-btn {
   display: inline-flex !important;
  border-radius: 9999px !important;
    padding: 0.125rem/* 2px */ !important;
     --tw-text-opacity: 1 !important;
  color: rgb(255 255 255 / var(--tw-text-opacity)) !important;
}

.next-prev-btn:hover {
   --tw-bg-opacity: 1 !important;
  background-color: rgb(107 114 128 / var(--tw-bg-opacity)) !important;
}

.next-prev-btn:focus {
  outline: 2px solid transparent !important;
  outline-offset: 2px !important;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000) !important;
  --tw-ring-opacity: 1 !important;
  --tw-ring-color: rgb(255 255 255 / var(--tw-ring-opacity)) !important;
}

.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border-width: 0 !important;
}

.h-5 {
  height: 1.25rem/* 20px */ !important;
}

.w-5 {
  width: 1.25rem/* 20px */ !important;
}


.x-mark-btn {
  display: inline-flex !important;
  border-radius: 9999px !important;
  padding: 0.125rem /* 2px */ !important;
  --tw-text-opacity: 1 !important;
  color: rgb(255 255 255 / var(--tw-text-opacity)) !important;
}

.x-mark-btn:hover {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(107 114 128 / var(--tw-bg-opacity)) !important;
  --tw-text-opacity: 1 !important;
  color: rgb(248 113 113 / var(--tw-text-opacity)) !important;
}

.x-mark-btn:focus {
  outline: 2px solid transparent !important;
  outline-offset: 2px !important;
}

`;

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
      <form onSubmit={handleSearchSubmit} className="form-wrap">
        <div className="form-div">
          <input
            type="text"
            ref={searchInputRef}
            value={localSearchValue}
            onChange={handleInputChange}
            placeholder="Find on page"
            className="input-style"
          />
          {/* <div className="mx-2 my-auto">
            <p className="text-gray-500 text-right float-right">{matchingCounts}</p>
            <p className="text-gray-500 text-right float-right font-medium">
              0/10
            </p>
          </div> */}
          <div className="matching-counts-wrapper">
            <span className="text-gray-500 text-base">{matchingCounts}</span>
          </div>
        </div>

        <button type="submit" className="hidden" aria-label="Submit" />

        <div className="btn-group">
          <div className="divider-x" />

          <button
            onClick={previousMatch}
            type="button"
            className="next-prev-btn"
            disabled={localSearchValue === ''}
          >
            <span className="sr-only">Previous</span>
            <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            onClick={nextMatch}
            type="button"
            className="next-prev-btn"
            disabled={localSearchValue === ''}
          >
            <span className="sr-only">Previous</span>
            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            onClick={closeSearchLayover}
            type="button"
            className="x-mark-btn"
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchInput;
