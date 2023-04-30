//@ts-nocheck
// src/components/DraggableModal.tsx

import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';

interface LayoverProps {
  children: React.ReactNode;
}

const Layover: React.FC<LayoverProps> = ({ children }) => {
  const nodeRef = React.useRef(null);
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
    <Draggable nodeRef={nodeRef} position={position} onStop={handleDragStop}>
      <div className="absolute w-[434px] rounded-lg cursor-move" ref={nodeRef}>
        {children}
      </div>
    </Draggable>
  );
};

export default Layover;
