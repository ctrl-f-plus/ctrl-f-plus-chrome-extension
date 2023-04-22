// src/components/DraggableModal.tsx

import React from 'react';
import Draggable from 'react-draggable';

interface DraggableModalProps {
  children: React.ReactNode;
}

const DraggableModal: React.FC<DraggableModalProps> = ({ children }) => {
  return (
    <Draggable>
      <div className="absolute w-[434px] rounded-lg cursor-move">
        {children}
      </div>
    </Draggable>
  );
};

export default DraggableModal;
