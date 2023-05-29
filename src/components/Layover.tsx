// src/components/DraggableModal.tsx

import React, { useContext, useEffect } from 'react';
import Draggable, {
  DraggableData,
  DraggableEventHandler,
} from 'react-draggable';
import Frame from 'react-frame-component';
import { LayoverContext } from '../contexts/LayoverContext';
import { LayoverPosition, LayoverProps } from '../types/Layover.types';
import { UpdateLayoverPositionMsg } from '../types/message.types';
import { createUpdateLayoverPositionMsg } from '../utils/messageUtils/createMessages';
import { sendMsgToBackground } from '../utils/messageUtils/sendMessageToBackground';

const additionalStyles = `
body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
}

#testingtesting {
    width: 434px !important;
    height: 36px !important;
    position: fixed !important;
    top: 0px !important;
    right: 0px !important;
    z-index: 2147483647 !important;
    /*background-color: red !important;*/
    box-shadow: 0px 0px 5px #0000009e !important;
}

#testingtesting iframe {
    width: 100% !important;
    height: 100% !important;
    border: none !important;
}

`;

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

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);
  }, []);

  return layoverPosition ? (
    <Draggable
      nodeRef={nodeRef}
      position={layoverPosition}
      onStop={handleDragStop}
    >
      <div className="absolute w-[434px] cursor-move rounded-lg" ref={nodeRef}>
        {children}
      </div>
    </Draggable>
  ) : null;
}

export default Layover;
