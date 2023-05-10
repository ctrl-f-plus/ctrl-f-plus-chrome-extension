// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import './options.css';

// const App: React.FC<{}> = () => {
//   return (
//     <div>
//       <h1>Options Page</h1>
//     </div>
//   );
// };

// const root = document.createElement('div');
// document.body.appendChild(root);

// const reactRoot = createRoot(root);
// reactRoot.render(<App />);
// src/popup/popup.tsx

import React, { FormEvent, useContext, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../tailwind.css';
// import './popup.css';
import SearchInput2 from '../components/SearchInput2';
import { LayoverContext } from '../contexts/LayoverContext';
import { useSearchHandler } from '../hooks/useSearchHandler';

const App: React.FC<{}> = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    searchValue,
    setSearchValue,
    lastSearchValue,
    setLastSearchValue,
    toggleSearchLayover,
    totalMatchesCount,
    globalMatchIdx,
  } = useContext(LayoverContext);

  const { handleSearch, handleNext, handlePrevious } = useSearchHandler();

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (searchInputRef.current) {
      if (searchValue === lastSearchValue) {
        handleNext();
      } else {
        handleSearch(searchValue);
      }
    }
  };

  return (
    <>
      <div id="cntrl-f-extension" className="m-0">
        <div className="fixed ">
          <SearchInput2 />
          {/* <form
          onSubmit={handleSearchSubmit}
          // className="p-2 text-white bg-black bg-opacity-75 rounded  divide-x divide-slate-200"
        >
          <div className=" ">
            <input
              type="text"
              placeholder="Find on page"
              className="text-white placeholder-white focus:outline-none"
            />
            <button className="px-4 py-2 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700">
              Click me!
            </button>
          </div>
        </form> */}
        </div>
      </div>
    </>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);

const reactRoot = createRoot(root);
reactRoot.render(<App />);
