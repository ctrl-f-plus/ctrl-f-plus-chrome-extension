// import React from 'react';
// import { createRoot } from 'react-dom/client';
// // import './options.css';
// import '../tailwind.css';

// function App() {
//   return (
//     <div id="cntrl-f-extension">
//       <div className="w-screen h-screen p-0 m-0 border-0">
//         <div className="w-full h-full bg-slate-100">
//           <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
//             Options Page
//           </h2>
//           <p>text</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// const root = document.createElement('div');
// document.body.appendChild(root);

// const reactRoot = createRoot(root);
// reactRoot.render(<App />);

/* eslint-disable jsx-a11y/label-has-associated-control */
// import { Switch } from '@headlessui/react';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../tailwind.css';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function App() {
  return (
    <div id="cntrl-f-extension">
      {/* bg-white */}
      <div className="isolate px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center ">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ctrl-F Plus
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Extension Settings
          </p>
        </div>

        {/* FORM */}
        <div className="bg-gray-900 p-5">
          <div className="mx-auto mt-16 max-w-xl sm:mt-20">
            <form action="#" method="POST">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-indigo-500 sm:text-sm
                       sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* My Component */}
      <div className="isolate bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
        <div className=" p-5">
          <div className="mx-auto mt-16 max-w-xl  sm:mt-20">
            {/*
             *
             * FORM
             *
             */}
            <form className="grid grid-cols-4 bg-red-200 bg-white/5 pb-0.5 pt-0.5 text-white">
              <div className="relative col-span-3 grid grid-cols-6 gap-0 ">
                <input
                  type="text"
                  placeholder="Tailwind's"
                  className="col-start-1 col-end-6 block w-full rounded-md border-0 border-transparent bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:border-transparent focus:ring-0 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
                {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-base text-gray-500">0/10</span>
                </div> */}
              </div>
            </form>

            <div className="my-3" />
            <form className="grid grid-cols-4 rounded-md   bg-white/5 pb-0.5 pt-0.5  text-white shadow-sm">
              <div className="relative col-span-3 grid grid-cols-6 gap-0 ">
                <input
                  type="text"
                  placeholder="Ben's"
                  // placeholder="Tailwind's"
                  //text-base
                  // sm:text-sm
                  //  bg-white/5
                  className="col-start-1 col-end-6 block w-full rounded-md border-0 border-transparent bg-transparent px-3.5  py-2 text-base text-white  placeholder:text-gray-400 focus:outline-none"
                />

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-base text-gray-500">0/10</span>
                </div>
              </div>
              {/* <input type="text" className="focus:outline-none" /> */}

              <button type="submit" className="hidden" aria-label="Submit" />

              <div className="flex items-center justify-evenly">
                <div className="mx-0 my-auto h-7 border-l border-gray-500 px-0" />

                <button
                  type="button"
                  className="inline-flex rounded-full p-0.5 text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-white
            "
                >
                  <span className="sr-only">Previous</span>
                  <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="inline-flex rounded-full p-0.5 text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-white
"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="inline-flex rounded-full p-0.5 text-white hover:bg-gray-500 hover:text-red-400 focus:outline-none focus:ring-2
            focus:ring-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = document.createElement('div');
document.body.appendChild(root);

const reactRoot = createRoot(root);
reactRoot.render(<App />);
