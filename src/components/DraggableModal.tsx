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
      {/* <div
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          padding: '.1rem',
          // border: '1px solid black',
          borderRadius: '5px',
          cursor: 'move',
        }}
      > */}
      <div className="absolute bg-red-500 p-5 rounded-lg cursor-move">
        {children}
      </div>
    </Draggable>
  );
};

export default DraggableModal;
