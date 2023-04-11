export interface BaseMessage {
  from: 'background' | 'content';
  type: string;
  payload?: any;
}

// export enum Messages {
//   TOGGLE_OVERLAY,
// }

export interface ExampleMessage extends BaseMessage {
  type: 'example-message';
  payload: string;
}

export interface GetInnerHtmlMessage extends BaseMessage {
  type: 'get-inner-html';
  payload: {
    title: string;
    innerHtml: string;
  };
}

export interface ExecuteContentScript extends BaseMessage {
  type: 'execute-content-script';
  payload: string;
}

export interface HighlightMatchesMessage extends BaseMessage {
  type: 'highlight-matches';
  findValue: string;
}

export interface NextMatchMessage extends BaseMessage {
  from: 'content';
  type: 'next-match';
  findValue: string;
}

export interface PreviousMatchMessage extends BaseMessage {
  from: 'content';
  type: 'previous-match';
  findValue: string;
}

export type Messages =
  | ExampleMessage
  | GetInnerHtmlMessage
  | ExecuteContentScript
  | HighlightMatchesMessage
  | NextMatchMessage
  | PreviousMatchMessage;
