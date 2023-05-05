// src/components/DraggableModal.tsx

// TODO: There is a bug where the layover position doesn't update on some tab-switches

import React, { useEffect, useState } from 'react';
import Draggable, {
  DraggableData,
  DraggableEventHandler,
} from 'react-draggable';

// TODO: update so that the stored Position is coming from the background script's store object
import {
  TabId,
  getStoredLayoverPosition,
  setStoredLayoverPosition,
} from '../utils/storage';

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
  const [position, setPosition] = useState<LayoverPosition | null>(null);

  useEffect(() => {
    const fetchLayoverPosition = async () => {
      const storedLayoverPosition = await getStoredLayoverPosition();
      setPosition(storedLayoverPosition);
    };

    fetchLayoverPosition();
  }, [activeTabId]);

  const handleDragStop: DraggableEventHandler = (e, data: DraggableData) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);

    setStoredLayoverPosition(newPosition);
  };

  return position ? (
    <Draggable nodeRef={nodeRef} position={position} onStop={handleDragStop}>
      <div className="absolute w-[434px] rounded-lg cursor-move" ref={nodeRef}>
        {children}
      </div>
    </Draggable>
  ) : null;
};

export default Layover;
