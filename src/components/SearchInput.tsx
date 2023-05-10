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
import { useSearchHandler } from '../hooks/useSearchHandler';
import { SearchInputProps } from '../types/searchInput.types';
import { getStoredFindValue, getStoredLastSearchValue } from '../utils/storage';

const SearchInput: React.FC<SearchInputProps> = ({ focus }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const {
    searchValue,
    setSearchValue,
    lastSearchValue,
    setLastSearchValue,
    toggleSearchLayover,
    totalMatchesCount,
    globalMatchIdx,
  } = useContext(LayoverContext);

  const [matchingCounts, setMatchingCounts] = useState(
    `${globalMatchIdx}/${totalMatchesCount}`
  );

  const { handleSearch, handleNext, handlePrevious } = useSearchHandler();

  // TODO: ADD FUNCTIONALITY TO HIGHLIGHT ALL MATCHES ON CURRENT PAGE AS THE USER TYPES

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setSearchValue(newValue);
    setInitialLoad(false);
  };

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

    const fetchStoredLastSearchValue = async () => {
      const storedLastSearchValue = await getStoredLastSearchValue();
      setLastSearchValue(storedLastSearchValue);
    };

    fetchStoredFindValue();
    fetchStoredLastSearchValue();
  }, []);

  useEffect(() => {
    setMatchingCounts(`${globalMatchIdx}/${totalMatchesCount}`);
  }, [globalMatchIdx, totalMatchesCount]);

  return (
    <>
      {' '}
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
          <div className="mx-2 my-auto">
            <p className="text-right float-right">{matchingCounts}</p>
          </div>
        </div>

        <button type="submit" className="hidden" />

        <div className=" flex justify-evenly items-center">
          <button
            type="button"
            onClick={handlePrevious}
            className="group relative focus:outline-none w-5 h-5 p-1 rounded-full"
            disabled={searchValue === ''}
          >
            {' '}
            <div className="flex items-center justify-center h-full">
              <FontAwesomeIcon
                size="sm"
                icon={faAngleUp}
                className="text-slate-200 z-10 group-hover:text-white group-disabled:text-slate-200"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-30 transition-opacity"></div>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="group relative focus:outline-none w-5 h-5 p-1 rounded-full"
            disabled={searchValue === ''}
          >
            {' '}
            <div className="flex items-center justify-center h-full">
              <FontAwesomeIcon
                size="sm"
                icon={faAngleDown}
                className="text-slate-200 z-10 group-hover:text-white mt-0.5"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-30 transition-opacity"></div>
          </button>

          <button
            onClick={() => toggleSearchLayover()}
            type="button"
            className="group relative focus:outline-none w-5 h-5 p-1 rounded-full"
          >
            {' '}
            <div className="flex items-center justify-center h-full">
              <FontAwesomeIcon
                size="sm"
                icon={faXmark}
                className="text-slate-200 z-10 group-hover:text-red-400"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-30 transition-opacity"></div>
          </button>
        </div>
      </form>
    </>
  );
};

export default SearchInput;

// // src/components/SearchInput.tsx

// import {
//   faAngleDown,
//   faAngleUp,
//   faXmark,
// } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import React, {
//   FormEvent,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from 'react';
// import { LayoverContext } from '../contexts/LayoverContext';
// import { useSearchHandler } from '../hooks/useSearchHandler';
// import { SearchInputProps } from '../types/searchInput.types';
// import { getStoredFindValue, getStoredLastSearchValue } from '../utils/storage';

// const SearchInput: React.FC<SearchInputProps> = ({ focus }) => {
//   const searchInputRef = useRef<HTMLInputElement>(null);
//   const [initialLoad, setInitialLoad] = useState(true);

//   const {
//     searchValue,
//     setSearchValue,
//     lastSearchValue,
//     setLastSearchValue,
//     toggleSearchLayover,
//     totalMatchesCount,
//     globalMatchIdx,
//   } = useContext(LayoverContext);

//   const [matchingCounts, setMatchingCounts] = useState(
//     `${globalMatchIdx}/${totalMatchesCount}`
//   );

//   const { handleSearch, handleNext, handlePrevious } = useSearchHandler();

//   // TODO: ADD FUNCTIONALITY TO HIGHLIGHT ALL MATCHES ON CURRENT PAGE AS THE USER TYPES

//   const handleSearchSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     if (searchInputRef.current) {
//       if (searchValue === lastSearchValue) {
//         handleNext();
//       } else {
//         handleSearch(searchValue);
//       }
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;

//     setSearchValue(newValue);
//     setInitialLoad(false);
//   };

//   useEffect(() => {
//     if (focus && searchInputRef.current) {
//       searchInputRef.current.focus();

//       if (searchValue && initialLoad) {
//         searchInputRef.current.select();
//         setInitialLoad(false);
//       }
//     }
//   }, [focus, searchValue]);

//   useEffect(() => {
//     const fetchStoredFindValue = async () => {
//       const storedFindValue = await getStoredFindValue();
//       setSearchValue(storedFindValue);
//     };

//     const fetchStoredLastSearchValue = async () => {
//       const storedLastSearchValue = await getStoredLastSearchValue();
//       setLastSearchValue(storedLastSearchValue);
//     };

//     fetchStoredFindValue();
//     fetchStoredLastSearchValue();
//   }, []);

//   useEffect(() => {
//     setMatchingCounts(`${globalMatchIdx}/${totalMatchesCount}`);
//   }, [globalMatchIdx, totalMatchesCount]);

//   // padding: 16
//   // 418x24

//   return (
//     <>
//       {' '}
//       <form onSubmit={handleSearchSubmit}>
//         <div className="w-full p-2 text-white bg-black bg-opacity-75 rounded grid grid-cols-4 divide-x divide-slate-200">
//           <div className="col-span-3 grid grid-cols-6 gap-0 ">
//             <input
//               ref={searchInputRef}
//               type="text"
//               value={searchValue}
//               onChange={handleInputChange}
//               // className="text-white placeholder-white bg-transparent focus:outline-none col-start-1 col-end-6 border-transparent focus:border-transparent focus:ring-0"
//               className="text-white placeholder-white bg-transparent focus:outline-none col-start-1 col-end-6 border-none focus:ring-0"
//               placeholder="Find on page"
//             />
//             <div className="mx-2 my-auto">
//               <p className="text-right float-right">{matchingCounts}</p>
//             </div>
//           </div>

//           <button type="submit" className="hidden" />

//           <div className=" flex justify-evenly items-center">
//             <button
//               type="button"
//               onClick={handlePrevious}
//               className="group relative focus:outline-none w-5 h-5 p-1 rounded-full"
//               disabled={searchValue === ''}
//             >
//               {' '}
//               <div className="flex items-center justify-center h-full">
//                 <FontAwesomeIcon
//                   size="sm"
//                   icon={faAngleUp}
//                   className="text-slate-200 z-10 group-hover:text-white group-disabled:text-slate-200"
//                 />
//               </div>
//               <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-30 transition-opacity"></div>
//             </button>

//             <button
//               type="button"
//               onClick={handleNext}
//               className="group relative focus:outline-none w-5 h-5 p-1 rounded-full"
//               disabled={searchValue === ''}
//             >
//               {' '}
//               <div className="flex items-center justify-center h-full">
//                 <FontAwesomeIcon
//                   size="sm"
//                   icon={faAngleDown}
//                   className="text-slate-200 z-10 group-hover:text-white mt-0.5"
//                 />
//               </div>
//               <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-30 transition-opacity"></div>
//             </button>

//             <button
//               onClick={() => toggleSearchLayover()}
//               type="button"
//               className="group relative focus:outline-none w-5 h-5 p-1 rounded-full"
//             >
//               {' '}
//               <div className="flex items-center justify-center h-full">
//                 <FontAwesomeIcon
//                   size="sm"
//                   icon={faXmark}
//                   className="text-slate-200 z-10 group-hover:text-red-400"
//                 />
//               </div>
//               <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-30 transition-opacity"></div>
//             </button>
//           </div>
//         </div>
//       </form>
//     </>
//   );
// };

// export default SearchInput;
