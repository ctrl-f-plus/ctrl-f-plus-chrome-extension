// src/types/searchAndHighlight.types.ts

import { TabState } from './tab.types';
export interface MatchUtilsBase {
  currentIndex?: number;
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
  state2: TabState;
  findValue: string;
  callback?: () => void;
}

export type MatchesObject = Array<HTMLElement>;
