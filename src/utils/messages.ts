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

export interface NextMatchMessage extends BaseMessage {
  type: 'next-match';
}

export interface PreviousMatchMessage extends BaseMessage {
  type: 'previous-match';
}

export type Messages =
  | ExampleMessage
  | GetInnerHtmlMessage
  | ExecuteContentScript
  | NextMatchMessage
  | PreviousMatchMessage;
