// src/utils/messageUtils/createMessages.ts

import { LayoverPosition } from '../../types/Layover.types';
import {
  HighlightMsg,
  UpdateLayoverPositionMsg,
} from '../../types/message.types';
import { ValidTabId } from '../../types/tab.types';

/**
 * FROM: Background
 * TO: Content
 */
export function createHighlightMsg(
  searchValue: string,
  tabId: ValidTabId,
  foundFirstMatch: boolean
): HighlightMsg {
  return {
    async: true,
    from: 'background',
    type: 'highlight',
    payload: {
      findValue: searchValue,
      foundFirstMatch,
      tabId,
    },
  };
}

/**
 * FROM: Content
 * TO: Background
 */
export function createUpdateLayoverPositionMsg(
  newPosition: LayoverPosition
): UpdateLayoverPositionMsg {
  return {
    from: 'content:layover-component',
    type: 'update-layover-position',
    payload: {
      newPosition,
    },
  };
}
