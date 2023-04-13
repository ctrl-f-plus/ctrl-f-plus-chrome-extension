// src/components/SearchInput.tsx

import React, { FormEvent, useRef, useState, useEffect } from 'react';
import { getStoredFindValue, setStoredFindValue } from '../utils/storage';

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
  const [matches, setMatches] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // TODO: ADD FUNCTIONALITY TO HIGHLIGHT ALL MATCHES ON CURRENT PAGE AS THE USER TYPES

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (searchInputRef.current) {
      const findValue = searchInputRef.current.value;

      setStoredFindValue(findValue);

      chrome.runtime.sendMessage({ type: 'get-all-matches-msg', findValue });
    }
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   onSubmit(searchValue);
  //   // setSearchValue('');
  // };

  const handleNext = () => {
    onNext();
    chrome.runtime.sendMessage({ from: 'content', type: 'next-match' });
  };

  const handlePrevious = () => {
    onPrevious();
    chrome.runtime.sendMessage({ from: 'content', type: 'prev-match' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    // TODO: check if you still need onSearchValueChange:
    onSearchValueChange(newValue);
  };

  useEffect(() => {
    onSearchValueChange(searchValue);
    console.log('searchValue:', searchValue);
  }, [searchValue, onSearchValueChange]);

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'all-matches') {
        setMatches(message.allMatches);
      }
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
    // }, [focus]);
  }, [focus, searchValue]);
  // }, []);

  useEffect(() => {
    const fetchStoredFindValue = async () => {
      const storedFindValue = await getStoredFindValue();
      setSearchValue(storedFindValue);
    };

    fetchStoredFindValue();
  }, []);

  return (
    <form
      // onSubmit={handleSubmit}
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
      >
        Previous
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="ml-2 bg-transparent hover:bg-opacity-75 focus:outline-none"
      >
        Next
      </button>
    </form>
  );
};

export default SearchInput;
