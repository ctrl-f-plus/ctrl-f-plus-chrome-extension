// src/components/SearchInput.tsx

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

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
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (focus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focus]);

  return (
    <form
      onSubmit={handleSubmit}
      className="inline-flex items-center p-2 text-white bg-black bg-opacity-75 rounded"
    >
      <input
        ref={inputRef}
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
