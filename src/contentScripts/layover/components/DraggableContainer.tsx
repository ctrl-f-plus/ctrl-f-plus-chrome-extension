// src/contentScripts/layover/components/DraggableContainer.tsx

import React, { useContext } from 'react';
import Draggable, {
  DraggableData,
  DraggableEventHandler,
} from 'react-draggable';
import { LayoverPosition } from '../../../shared/types/shared.types';
import { LayoverContext } from '../../contexts/LayoverContext';
import {
  UPDATE_LAYOVER_POSITION,
  UpdateLayoverPositionMsg,
} from '../../types/toBackgroundMessage.types';
import sendMessageToBackground from '../../utils/messaging/sendMessageToBackground';

export interface DraggableContainerProps {
  children: React.ReactNode;
}

function DraggableContainer({
  children,
}: DraggableContainerProps): React.ReactElement | null {
  const nodeRef = React.useRef(null);

  const { layoverPosition, setLayoverPosition } = useContext(LayoverContext);

  const handleDragStop: DraggableEventHandler = (e, data: DraggableData) => {
    const newPosition: LayoverPosition = { x: data.x, y: data.y };

    setLayoverPosition(newPosition);
    if (
      layoverPosition &&
      layoverPosition.x === newPosition.x &&
      layoverPosition.y === newPosition.y
    ) {
      return;
    }

    const msg: UpdateLayoverPositionMsg = {
      type: UPDATE_LAYOVER_POSITION,
      payload: {
        newPosition,
      },
    };
    sendMessageToBackground<UpdateLayoverPositionMsg>(msg);
  };

  return layoverPosition ? (
    <Draggable
      nodeRef={nodeRef}
      position={layoverPosition}
      onStop={handleDragStop}
    >
      <div
        className="absolute w-[432px] cursor-move rounded-lg shadow-lg ring-1 ring-white/10"
        ref={nodeRef}
      >
        {children}
      </div>
    </Draggable>
  ) : null;
}

export default DraggableContainer;
