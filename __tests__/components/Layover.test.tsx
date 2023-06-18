// __tests__/components/Layover.test.tsx

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { LayoverContext } from '../../src/contexts/LayoverContext';
import Layover from '../../src/components/Layover';
import { LayoverPosition } from '../../src/types/Layover.types';

jest.mock('../../src/utils/messageUtils/sendMessageToBackground');

describe('Layover', () => {
  const setLayoverPosition = jest.fn();
  const defaultLayoverPosition: LayoverPosition = { x: 0, y: 0 };
  const contextValue = {
    showLayover: false,
    setShowLayover: jest.fn(),
    lastSearchValue: '',
    setLastSearchValue: jest.fn(),
    searchValue: '',
    setSearchValue: jest.fn(),
    showMatches: false,
    setShowMatches: jest.fn(),
    totalMatchesCount: 0,
    setTotalMatchesCount: jest.fn(),
    globalMatchIdx: 0,
    setGlobalMatchIdx: jest.fn(),
    layoverPosition: defaultLayoverPosition,
    setLayoverPosition: jest.fn(),
    activeTabId: undefined,
    setActiveTabId: jest.fn(),
    incrementMatchIndices: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <LayoverContext.Provider value={contextValue}>
        <Layover>
          <div>Test Child</div>
        </Layover>
      </LayoverContext.Provider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  // TODO: Fix this test (potential reference: https://github.com/react-grid-layout/react-draggable/issues/313)
  // it('calls setLayoverPosition with a new position when dragged', () => {
  //   const { container } = render(
  //     <LayoverContext.Provider value={contextValue}>
  //       <Layover>
  //         <div>Test Child</div>
  //       </Layover>
  //     </LayoverContext.Provider>
  //   );

  //   const newPosition: LayoverPosition = { x: 200, y: 200 };
  //   const draggable = container.firstChild;

  //   expect(draggable).not.toBeNull();

  //   fireEvent.dragEnd(draggable as Element, {
  //     clientX: newPosition.x,
  //     clientY: newPosition.y,
  //   });

  //   expect(setLayoverPosition).toHaveBeenCalledWith(newPosition);
  // });
});
