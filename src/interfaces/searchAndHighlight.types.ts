export interface MatchUtilsBase {
  currentIndex?: number;
  matchesObj: MatchesObject;
  tabId: chrome.tabs.Tab['id'] | undefined;
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
  findValue: string;
  callback?: () => void;
}

export type MatchesObject =
  | Array<HTMLElement>
  | {
      [tabId: number]: Array<HTMLElement>;
    };
