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
import { FaAngleUp } from 'react-icons/fa';
import { TfiAngleUp } from 'react-icons/tfi';

const SearchInput: React.FC<SearchInputProps> = ({
  onSubmit,
  onNext,
  onPrevious,
  focus,
  onSearchValueChange,
  onClose,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // TODO: ADD FUNCTIONALITY TO HIGHLIGHT ALL MATCHES ON CURRENT PAGE AS THE USER TYPES

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // const storedFindValue = await getStoredFindValue();

    if (searchInputRef.current) {
      const findValue = searchInputRef.current.value;

      // if (storedFindValue !== findValue && TODO: NOTHING IS HIGHLIGHTED/NO MATCHES EXIST) {
      onSubmit(findValue);
      // } else {
      // handleNext();
      // }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setSearchValue(newValue);
    setInitialLoad(false);
    // TODO: check if you still need onSearchValueChange() and compare to setSearchValue():
    onSearchValueChange(newValue);
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
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
    <>
      <form
        onSubmit={handleSearchSubmit}
        className="w-full p-2 text-white bg-black bg-opacity-75 rounded grid grid-cols-4 divide-x divide-slate-200"
      >
        <div className="col-span-3 grid grid-cols-6 gap-0 ">
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            className="text-white placeholder-white bg-transparent focus:outline-none col-start-1 col-end-6 "
            placeholder="Find on page"
          />
          <div className="mx-2">
            {/* <p className=" bg-red-500 text-right float-right">1/10000</p> */}
          </div>
        </div>

        <button type="submit" className="hidden" />

        <div className=" flex justify-evenly">
          <button
            type="button"
            onClick={handlePrevious}
            className="bg-transparent hover:bg-opacity-75 focus:outline-none"
            disabled={searchValue === ''}
          >
            <FontAwesomeIcon icon={faAngleUp} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="bg-transparent hover:bg-opacity-75 focus:outline-none"
            disabled={searchValue === ''} //FIXME: review this functionality and style it
          >
            <FontAwesomeIcon icon={faAngleDown} />
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="bg-transparent hover:bg-opacity-75 focus:outline-none"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      </form>
    </>
  );
};

export default SearchInput;
