// src/shared/utils/ctrlLogger.ts

interface CtrlLogger extends Console {
  info: (message?: any, ...optionalParams: any[]) => void;
  log: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
}

const ctrlLogger: CtrlLogger = {
  ...console,

  info(...args) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },

  log(...args) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },

  warn(...args) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
};

export default ctrlLogger;
