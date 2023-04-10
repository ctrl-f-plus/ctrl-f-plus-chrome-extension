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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Find on page"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchInput;
