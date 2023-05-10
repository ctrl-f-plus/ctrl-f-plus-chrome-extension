import { TabState } from './tab.types';

// src/types/searchAndHighlight.types.ts
export interface MatchUtilsBase {
  currentIndex?: number;
  // matchesObj: MatchesObject;
  // tabId: chrome.tabs.Tab['id'] | undefined;
  state2?: any;
}

export interface CreateHighlightSpanProps {
  matchText: string;
}

export interface UpdateMatchesObjectProps extends MatchUtilsBase {
  span: HTMLElement;
}

export interface GetAllTextNodesToProcessProps {
  regex: RegExp;
}

export interface ProcessTextNodeProps extends MatchUtilsBase {
  textNode: Node;
  regex: RegExp;
}

export interface SearchAndHighlightProps extends MatchUtilsBase {
  // findValue: string;
  // callback?: () => void;
  state2: TabState;
  findValue: string;
  callback?: () => void;
}

export type MatchesObject = Array<HTMLElement>;
// | Array<HTMLElement>
// | {
//     [tabId: number]: Array<HTMLElement>;
//   };
