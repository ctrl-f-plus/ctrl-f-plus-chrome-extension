// src/components/DraggableModal.tsx

import React, { useContext } from 'react';
import Draggable, {
  DraggableData,
  DraggableEventHandler,
} from 'react-draggable';
import { sendMessageToBackground } from '../utils/messageUtils/sendMessageToBackground';

// TODO: update so that the stored Position is coming from context store object. Need to make sure background script is sending out the new store on each update
import { LayoverContext } from '../contexts/LayoverContext';
import { UpdateLayoverPositionMessage } from '../types/message.types';
import { TabId } from '../types/tab.types';

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

  const { layoverPosition } = useContext(LayoverContext);

  const handleDragStop: DraggableEventHandler = (e, data: DraggableData) => {
    const newPosition: LayoverPosition = { x: data.x, y: data.y };

    const msg: UpdateLayoverPositionMessage = {
      from: 'content:layover-component',
      type: 'update-layover-position',
      payload: {
        newPosition,
      },
    };
    sendMessageToBackground(msg);
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
