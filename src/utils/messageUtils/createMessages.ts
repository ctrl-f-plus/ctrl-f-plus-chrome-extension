// src/utils/messageUtils/createMessages.ts

import { LayoverPosition } from '../../components/Layover';
import {
  HighlightMsg,
  UpdateHighlightsMsg,
  UpdateLayoverPositionMsg,
} from '../../types/message.types';
import { ValidTabId } from '../../types/tab.types';

/**
 * FROM: Background
 * TO: Content
 */

export function createHighlightMsg(
  findValue: string,
  tabId: ValidTabId,
  foundFirstMatch: boolean
): HighlightMsg {
  return {
    async: true,
    from: 'background',
    type: 'highlight',
    findValue: findValue,
    foundFirstMatch,
    tabId: tabId,
    tabState: {},
  };
}

export function createUpdateHighlightsMsg(tabId: number): UpdateHighlightsMsg {
  return {
    from: 'background',
    type: 'update-highlights',
    prevIndex: undefined,
    payload: {
      tabId: tabId,
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
