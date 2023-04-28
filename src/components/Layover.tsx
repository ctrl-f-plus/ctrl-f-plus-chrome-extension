//@ts-nocheck
// src/components/DraggableModal.tsx

import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';

interface LayoverProps {
  children: React.ReactNode;
}

const Layover: React.FC<LayoverProps> = ({ children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // TODO: Move this function to storage util
    chrome.storage.local.get('overlayPosition', (data) => {
      if (data.overlayPosition) {
        setPosition(data.overlayPosition);
      }
    });
  }, []);

  const handleDragStop = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    chrome.storage.local.set({ overlayPosition: newPosition });
  };

  return (
    <Draggable position={position} onStop={handleDragStop}>
      <div className="absolute w-[434px] rounded-lg cursor-move">
        {children}
      </div>
    </Draggable>
  );
};

export default Layover;
