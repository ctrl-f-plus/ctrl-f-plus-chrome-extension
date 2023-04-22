// src/components/DraggableModal.tsx

import React from 'react';
import Draggable from 'react-draggable';

interface LayoverProps {
  children: React.ReactNode;
}

const Layover: React.FC<LayoverProps> = ({ children }) => {
  return (
    <Draggable>
      <div className="absolute w-[434px] rounded-lg cursor-move">
        {children}
      </div>
    </Draggable>
  );
};

export default Layover;
