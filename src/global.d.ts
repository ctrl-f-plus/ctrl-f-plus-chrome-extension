// src/global.d.ts

declare global {
  interface Window {
    __LAYOVER_SCRIPT_INJECTED__?: boolean;
    __HIGHLIGHT_STYLES_SCRIPT_INJECTED__?: boolean;
    find: (
      string: string,
      caseSensitive?: boolean,
      backwards?: boolean,
      wrapAround?: boolean,
      wholeWord?: boolean,
      searchInFrames?: boolean,
      showDialog?: boolean
    ) => boolean;
    toggleLayover: () => void;
  }
}

declare module '*.shadow.css';

export {};
