// src/interfaces/message.types.ts

export interface BaseMessage {
  from: 'background' | 'content' | 'match-utils' | 'inner-match-utils';
  // from?: 'content' | 'background' | 'popup';
  type: string;
  payload?: any;
  serializedState2?: any;
}

export interface GetAllMatchesMessage extends BaseMessage {
  from: 'content';
  type: 'get-all-matches-msg';
  payload: string;
}

export interface NextMatchMessage extends BaseMessage {
  // TODO: check to see if you ever pass findValue or if you can get rid of it here
  from: 'content';
  type: 'next-match';
  findValue?: string;
  serializedState2?: any;
}

export interface NextMatchMessageFromBack extends BaseMessage {
  // TODO: check to see if you ever pass findValue or if you can get rid of it here
  from: 'background';
  type: 'next-match';
  findValue?: string;
}

export interface PreviousMatchMessage extends BaseMessage {
  // TODO: check to see if you ever pass findValue or if you can get rid of it here
  from: 'content';
  type: 'prev-match';
  findValue?: string;
  serializedState2?: any;
}

export interface RemoveStylesMessage extends BaseMessage {
  from: 'background' | 'content';
  type: 'remove_styles';
}

export interface MessageFixMe {
  type: string;
  findValue?: string;
  command?: string;
  payload?: any;
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
  state?: any; // Replace 'any' with the actual type of the 'state' object
  serializedState2?: any;
  prevIndex: number;
}

export interface UpdateHighlightsMessage extends BaseMessage {
  from: 'background';
  type: 'update-highlights';
  state: any; // Replace 'any' with the actual type of the 'state' object
  prevIndex: number | undefined;
}
export interface SwitchedActiveTabShowLayover extends BaseMessage {
  from: 'background';
  type: 'switched-active-tab-show-layover';
}

export interface SwitchedActiveTabHideLayover extends BaseMessage {
  from: 'background';
  type: 'switched-active-tab-hide-layover';
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
  | RemoveStylesMessage
  | RemoveStylesAllTabs
  | AddStylesAllTabs
  | RemoveAllHighlightMatches
  | SwitchTab
  | UpdateHighlightsMessage
  | SwitchedActiveTabShowLayover
  | SwitchedActiveTabHideLayover
  | UpdateTabStatesObj;