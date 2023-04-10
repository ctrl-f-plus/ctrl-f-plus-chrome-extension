// import react, {useState} from 'react';
import * as React from 'react';
import { useState } from 'react';

interface SearchInputProps {
  onSubmit: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSubmit }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(searchValue);
    setSearchValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black bg-opacity-75 text-white inline-flex items-center p-2 rounded"
    >
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="bg-transparent focus:outline-none text-white placeholder-white mr-2"
        placeholder="Find on page"
      />
      <button
        type="submit"
        className="bg-transparent hover:bg-opacity-75 focus:outline-none"
      >
        Search
      </button>
    </form>
  );
};

export default SearchInput;
