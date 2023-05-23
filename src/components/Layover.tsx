// src/components/DraggableModal.tsx

import React, { useContext, FC } from 'react';
import Draggable, {
  DraggableData,
  DraggableEventHandler,
} from 'react-draggable';
import { LayoverContext } from '../contexts/LayoverContext';
import { UpdateLayoverPositionMsg } from '../types/message.types';
import { createUpdateLayoverPositionMsg } from '../utils/messageUtils/createMessages';
import { sendMsgToBackground } from '../utils/messageUtils/sendMessageToBackground';
import { LayoverPosition, LayoverProps } from '../types/Layover.types';

const Layover: React.FC<LayoverProps> = ({ children }) => {
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

    const msg = createUpdateLayoverPositionMsg(newPosition);
    sendMsgToBackground<UpdateLayoverPositionMsg>(msg);
  };

  return layoverPosition ? (
    <Draggable
      nodeRef={nodeRef}
      position={layoverPosition}
      onStop={handleDragStop}
    >
      <div className="absolute w-[434px] rounded-lg cursor-move" ref={nodeRef}>
        {children}
      </div>
    </Draggable>
  ) : null;
};

export default Layover;
