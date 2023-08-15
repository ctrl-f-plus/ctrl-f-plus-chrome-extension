/* eslint-disable no-console */
// src/helpers/CtrlLogger.ts

// export default function ctrlLog(
//   // message: string
//   // level?: 'info' | 'warn' | 'error' = 'info',
//   ...messages: any[]
// ) {
//   if (process.env.NODE_ENV === 'development') {
//     // console[level](message);

//     // eslint-disable-next-line no-console
//     console.log(...messages);
//   }
// }

// interface CtrlLogger extends Console {
//   log: (...args: unknown[]) => void;
// }

interface CtrlLogger extends Console {
  info: (message?: any, ...optionalParams: any[]) => void;
  log: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
}

const ctrlLogger: CtrlLogger = {
  ...console,

  info(...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },

  log(...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },

  warn(...args) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
};

export default ctrlLogger;
