// src/utils/messages.ts
export interface BaseMessage {
  from: 'background' | 'content';
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
  from: 'content';
  type: 'next-match';
  findValue: string;
}

export interface PreviousMatchMessage extends BaseMessage {
  from: 'content';
  type: 'prev-match';
  findValue: string;
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

// export type Messages = {
//   from?: 'content' | 'popup' | 'background';
// } & (
//   | NextMatchMessage
//   | PreviousMatchMessage
//   // | GetAllMatchesMessage
//   // | AllMatchesMessage
//   | GetAllMatchesRequest
//   | RemoveStylesMessage
// );

export type Messages =
  | NextMatchMessage
  | PreviousMatchMessage
  | GetAllMatchesMessage
  // | AllMatchesMessage
  | GetAllMatchesRequest
  | RemoveStylesMessage
  | RemoveStylesAllTabs
  | AddStylesAllTabs;
