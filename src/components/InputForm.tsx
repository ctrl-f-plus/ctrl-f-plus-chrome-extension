import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import React from 'react';

export default function InputForm() {
  return (
    <div className="">
      <form className="pt-0.5 pb-0.5 text-white bg-white/5 grid grid-cols-4 ">
        <div className="relative col-span-3 grid grid-cols-6 gap-0 ">
          <input
            type="text"
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
            // focus:ring-offset-2
            // focus:ring-offset-red-50
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
