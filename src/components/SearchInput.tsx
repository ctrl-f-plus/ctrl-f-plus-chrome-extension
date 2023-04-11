// src/components/SearchInput.tsx

import React, { FormEvent, useRef, useState, useEffect } from 'react';

interface SearchInputProps {
  onSubmit: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  focus: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSubmit,
  onNext,
  onPrevious,
  focus,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  // const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (searchInputRef.current) {
      const findValue = searchInputRef.current.value;
      chrome.runtime.sendMessage({ type: 'get-all-matches', findValue });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(searchValue);
    // setSearchValue('');
  };

  const handleNext = () => {
    onNext();
    chrome.runtime.sendMessage({ from: 'content', type: 'next-match' });
  };

  const handlePrevious = () => {
    onPrevious();
    chrome.runtime.sendMessage({ from: 'content', type: 'previous-match' });
  };

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'all-matches') {
        setMatches(message.allMatches);
      }
    };

    if (focus && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [focus]);
  // }, []);

  return (
    <form
      // onSubmit={handleSubmit}
      onSubmit={handleSearchSubmit}
      className="inline-flex items-center p-2 text-white bg-black bg-opacity-75 rounded"
    >
      <input
        // ref={inputRef}
        ref={searchInputRef}
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
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
