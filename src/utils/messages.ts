// src/utils/messages.ts
export interface BaseMessage {
  from: 'background' | 'content' | 'match-utils';
  // from?: 'content' | 'background' | 'popup';
  type: string;
  payload?: any;
}

export interface GetAllMatchesMessage extends BaseMessage {
  from: 'content';
  type: 'get-all-matches-msg';
  payload?: string;
}

export interface NextMatchMessage extends BaseMessage {
  // TODO: check to see if you ever pass findValue or if you can get rid of it here
  from: 'content';
  type: 'next-match';
  findValue?: string;
}

export interface PreviousMatchMessage extends BaseMessage {
  // TODO: check to see if you ever pass findValue or if you can get rid of it here
  from: 'content';
  type: 'prev-match';
  findValue?: string;
}

// export interface AllMatchesMessage extends BaseMessage {
//   type: 'all-matches';
//   allMatches: any[];
// }

export interface GetAllMatchesRequest {
  type: 'get-all-matches-req';
}

export interface RemoveStylesMessage extends BaseMessage {
  from: 'background' | 'content';
  type: 'remove_styles';
}

export interface MessageFixMe {
  type: string;
  findValue?: string;
  command?: string;
}

export interface RemoveStylesAllTabs extends BaseMessage {
  from: 'content';
  type: 'remove-styles-all-tabs';
}

export interface AddStylesAllTabs extends BaseMessage {
  from: 'content';
  type: 'add-styles-all-tabs';
}

export interface RemoveAllHighlightMatches extends BaseMessage {
  from: 'content';
  type: 'remove-all-highlight-matches';
}

export interface SwitchTab extends BaseMessage {
  from: 'match-utils';
  type: 'switch-tab';
  state: any; // Replace 'any' with the actual type of the 'state' object
  matchesObject: any; // Replace 'any' with the actual type of the 'matchesObject'
  prevIndex: number;
}

export interface UpdateHighlightsMessage extends BaseMessage {
  from: 'background';
  type: 'update-highlights';
  state: any; // Replace 'any' with the actual type of the 'state' object
  prevIndex: number;
}
export interface SwitchedActiveTabShowModal extends BaseMessage {
  from: 'background';
  type: 'switched-active-tab-show-modal';
}

export interface UpdateTabStatesObj extends BaseMessage {
  from: 'content';
  type: 'update-tab-states-obj';
  payload: any;
}

export type Messages =
  | NextMatchMessage
  | PreviousMatchMessage
  | GetAllMatchesMessage
  // | AllMatchesMessage
  | GetAllMatchesRequest
  | RemoveStylesMessage
  | RemoveStylesAllTabs
  | AddStylesAllTabs
  | RemoveAllHighlightMatches
  | SwitchTab
  | UpdateHighlightsMessage
  | SwitchedActiveTabShowModal
  | UpdateTabStatesObj;
