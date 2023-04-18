// src/components/SearchInput.tsx

import {
  faAngleDown,
  faAngleUp,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { SearchInputProps } from '../interfaces/searchInput.types';
import { getStoredFindValue } from '../utils/storage';

const SearchInput: React.FC<SearchInputProps> = ({
  onSubmit,
  onNext,
  onPrevious,
  focus,
  onSearchValueChange,
  onClose,
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
      onSubmit(findValue);
    }
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    setInitialLoad(false);
    // TODO: check if you still need onSearchValueChange() and compare to setSearchValue():
    onSearchValueChange(newValue);
  };

  const handleClose = () => {
    onClose(searchValue);
  };

  useEffect(() => {
    onSearchValueChange(searchValue);
  }, [searchValue, onSearchValueChange]);

  useEffect(() => {
    if (focus && searchInputRef.current) {
      searchInputRef.current.focus();

      if (searchValue && initialLoad) {
        searchInputRef.current.select();
        setInitialLoad(false);
      }
    }
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
        onChange={handleInputChange}
        className="mr-2 text-white placeholder-white bg-transparent focus:outline-none"
        placeholder="Find on page"
      />
      <button
        type="submit"
        className="bg-transparent hover:bg-opacity-75 focus:outline-none"
      >
        {/* Search */}
      </button>
      <button
        type="button"
        onClick={handlePrevious}
        className="ml-2 bg-transparent hover:bg-opacity-75 focus:outline-none"
        disabled={searchValue === ''}
      >
        <FontAwesomeIcon icon={faAngleUp} />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="ml-2 bg-transparent hover:bg-opacity-75 focus:outline-none"
        disabled={searchValue === ''} //FIXME: review this functionality and style it
      >
        <FontAwesomeIcon icon={faAngleDown} />
      </button>
      <button
        type="button"
        onClick={handleClose}
        className="ml-2 bg-transparent hover:bg-opacity-75 focus:outline-none"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </form>
  );
};

// RxCaretUp;
// RxCaretDown;

export default SearchInput;
