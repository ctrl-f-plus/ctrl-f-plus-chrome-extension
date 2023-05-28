// src/components/InputForm.tsx

import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import React, { useEffect, useRef, useState } from 'react';
import { PopupMessage } from '../types/message.types';

export default function InputForm() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // FIXME:
  let searchValue = '';
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // useEffect(() => {
  //   setLocalSearchValue(searchValue);
  // }, [searchValue]);

  // FormEvent;????
  const handleAction = (action: string) => {
    return (e: React.SyntheticEvent) => {
      e.preventDefault();

      const message: PopupMessage = {
        from: 'popup',
        type: 'popup-message',
        payload: {
          action,
          searchValue: localSearchValue,
        },
      };

      if (action === 'closeSearchLayover') {
        window.close();
      }

      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0].id !== undefined) {
          chrome.tabs.sendMessage(tabs[0].id, message);
        }
      });
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setLocalSearchValue(newValue);
    setInitialLoad(false);
  };

  return (
    <div className="">
      <form
        // onSubmit={handleSearchSubmit}
        onSubmit={handleAction('handleSearchSubmit')}
        className="pt-0.5 pb-0.5 text-white bg-white/5 grid grid-cols-4 "
      >
        <div className="relative col-span-3 grid grid-cols-6 gap-0 ">
          <input
            type="text"
            ref={searchInputRef}
            value={localSearchValue}
            onChange={handleInputChange}
            placeholder="Find on page"
            className="col-start-1 col-end-6 border-transparent focus:border-transparent focus:ring-0 text-white bg-transparent placeholder-gray-500 text-base"
          />
          {/* <div className="mx-2 my-auto">
            <p className="text-gray-500 text-right float-right">{matchingCounts}</p>
            <p className="text-gray-500 text-right float-right font-medium">
              0/10
            </p>
          </div> */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 text-base">0/10</span>
          </div>
        </div>

        <button type="submit" className="hidden" aria-label="Submit" />

        <div className="flex justify-evenly items-center">
          <div className="border-l h-7 my-auto mx-0 px-0 border-gray-500" />

          <button
            // onClick={previousMatch}
            onClick={handleAction('previousMatch')}
            type="button"
            className="inline-flex rounded-full p-0.5 text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-white
            "
            // disabled={localSearchValue === ''}
          >
            <span className="sr-only">Previous</span>
            <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            // onClick={nextMatch}
            onClick={handleAction('nextMatch')}
            type="button"
            className="inline-flex rounded-full p-0.5 text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-white
            "
            // disabled={localSearchValue === ''}
          >
            <span className="sr-only">Previous</span>
            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            // onClick={closeSearchLayover}
            onClick={handleAction('closeSearchLayover')}
            type="button"
            className="inline-flex rounded-full p-0.5 text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600
            hover:text-red-400"
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}
