// src/components/DraggableModal.tsx

import React, { useContext } from 'react';
import Draggable, {
  DraggableData,
  DraggableEventHandler,
} from 'react-draggable';
import { sendMsgToBackground } from '../utils/messageUtils/sendMessageToBackground';

// TODO: update so that the stored Position is coming from context store object. Need to make sure background script is sending out the new store on each update
import { LayoverContext } from '../contexts/LayoverContext';
import { UpdateLayoverPositionMsg } from '../types/message.types';
import { TabId } from '../types/tab.types';
import { createUpdateLayoverPositionMsg } from '../utils/messageUtils/createMessages';

export interface LayoverPosition {
  x: number;
  y: number;
}

interface LayoverProps {
  children: React.ReactNode;
  activeTabId: TabId;
}

const Layover: React.FC<LayoverProps> = ({ children, activeTabId }) => {
  const nodeRef = React.useRef(null);

  const { layoverPosition, setLayoverPosition } = useContext(LayoverContext);

  const handleDragStop: DraggableEventHandler = (e, data: DraggableData) => {
    // debugger;
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
