// Cntrl - F / src / components / DraggableModal.tsx
import React from 'react';
import Draggable from 'react-draggable';
import '../tailwind.css';

interface DraggableModalProps {
  children: React.ReactNode;
}

const DraggableModal: React.FC<DraggableModalProps> = ({ children }) => {
  return (
    <Draggable>
      <div className="absolute p-1 rounded-lg cursor-move">{children}</div>
    </Draggable>
  );
};

export default DraggableModal;
