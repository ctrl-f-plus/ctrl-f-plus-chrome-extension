// src/components/SearchInput.tsx

import React, { FormEvent, useRef, useState, useEffect } from 'react';
import { getStoredFindValue } from '../utils/storage';

interface SearchInputProps {
  onSubmit: (findValue: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  focus: boolean;

  // TODO: REVIEW THESE:
  onSearchValueChange: (searchValue: string) => void;
  // onClose: (searchValue: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSubmit,
  onNext,
  onPrevious,
  focus,
  onSearchValueChange,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  // const [matches, setMatches] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // TODO: ADD FUNCTIONALITY TO HIGHLIGHT ALL MATCHES ON CURRENT PAGE AS THE USER TYPES

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (searchInputRef.current) {
      const findValue = searchInputRef.current.value;
      console.log('SearchInput - onSubmit', findValue); // Add this line
      onSubmit(findValue);
    }
  };

  const handleNext = () => {
    console.log('SearchInput - onNext');
    onNext();
  };

  const handlePrevious = () => {
    console.log('SearchInput - onPrevious');
    onPrevious();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    setInitialLoad(false);
    // TODO: check if you still need onSearchValueChange:
    onSearchValueChange(newValue);
  };

  useEffect(() => {
    onSearchValueChange(searchValue);
    console.log('searchValue:', searchValue);
  }, [searchValue, onSearchValueChange]);

  useEffect(() => {
    const handleMessage = (message: any) => {
      // Receives message from background script
      // if (message.type === 'all-matches') {
      // setMatches(message.allMatches);
      // }
    };

    if (focus && searchInputRef.current) {
      searchInputRef.current.focus();

      if (searchValue && initialLoad) {
        searchInputRef.current.select();
        setInitialLoad(false);
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [focus, searchValue]);

  useEffect(() => {
    const fetchStoredFindValue = async () => {
      const storedFindValue = await getStoredFindValue();
      setSearchValue(storedFindValue);
    };

    fetchStoredFindValue();
  }, []);

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="inline-flex items-center p-2 text-white bg-black bg-opacity-75 rounded"
    >
      <input
        ref={searchInputRef}
        type="text"
        value={searchValue}
        // onChange={(e) => setSearchValue(e.target.value)}
        onChange={handleInputChange}
        className="mr-2 text-white placeholder-white bg-transparent focus:outline-none"
        placeholder="Find on page"
      />
      <button
        type="submit"
        className="bg-transparent hover:bg-opacity-75 focus:outline-none"
      >
        Search
      </button>
      <button
        type="button"
        onClick={handlePrevious}
        className="ml-2 bg-transparent hover:bg-opacity-75 focus:outline-none"
        disabled={searchValue === ''}
      >
        Previous
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="ml-2 bg-transparent hover:bg-opacity-75 focus:outline-none"
        disabled={searchValue === ''} //FIXME: review this functionality and style it
      >
        Next
      </button>
    </form>
  );
};

export default SearchInput;
