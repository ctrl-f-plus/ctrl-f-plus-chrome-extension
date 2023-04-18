export interface MatchUtilsBase {
  currentIndex?: number;
  matches: HTMLElement[];
  matchesObj: MatchesObject;
  tabId: number;
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
  findValue: string;
  callback?: () => void;
}

export type MatchesObject = {
  [tabId: number]: HTMLElement[];
};
