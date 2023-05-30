// src/components/DraggableModal.tsx

import React, { useContext } from 'react';
import Draggable, {
  DraggableData,
  DraggableEventHandler,
} from 'react-draggable';
import { LayoverContext } from '../contexts/LayoverContext';
import { LayoverPosition, LayoverProps } from '../types/Layover.types';
import { UpdateLayoverPositionMsg } from '../types/message.types';
import { createUpdateLayoverPositionMsg } from '../utils/messageUtils/createMessages';
import { sendMsgToBackground } from '../utils/messageUtils/sendMessageToBackground';
import './SearchInputStyles.css';

function Layover({ children }: LayoverProps): React.ReactElement | null {
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
      <div
        className="ctrl-absolute ctrl-w-[434px] ctrl-cursor-move ctrl-rounded-lg ctrl-shadow-lg ctrl-ring-1 ctrl-ring-gray-900/5 ctrl-ring-white/10 "
        ref={nodeRef}
      >
        {children}
      </div>
    </Draggable>
  ) : null;
}

export default Layover;
