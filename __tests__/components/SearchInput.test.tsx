//  Test that `currentMatchIndex` is not NaN
//  Test that the navigation buttons are disabled when search has not been submitted

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { LayoverContext } from '../../src/contexts/LayoverContext';
import { TabStateContext } from '../../src/contexts/TabStateContext';
import SearchInput from '../../src/layover/components/SearchInput';
import { sendMessageToBackground } from '../../src/utils/messaging/sendMessageToBackground';
import { REMOVE_ALL_STYLES } from '../../src/types/message.types';

jest.mock('../../src/utils/messageUtils/sendMessageToBackground');

describe('SearchInput', () => {
  const mockContextValues = {
    searchValue: '',
    showLayover: false,
    showMatches: false,
    lastSearchValue: '',
    totalMatchesCount: 0,
    setSearchValue: jest.fn(),
    setLastSearchValue: jest.fn(),
  };
  const mockTabStateContextValues = {
    tabStateContext: {
      globalMatchIdxStart: undefined,
      currentIndex: undefined,
    },
  };

  it('updates input field correctly on typing', () => {
    render(
      <LayoverContext.Provider value={mockContextValues}>
        <TabStateContext.Provider value={mockTabStateContextValues}>
          <SearchInput focus />
        </TabStateContext.Provider>
      </LayoverContext.Provider>
    );

    const inputElement = screen.getByPlaceholderText('Find on page');
    fireEvent.change(inputElement, { target: { value: 'New Value' } });

    expect(inputElement.value).toBe('New Value');
  });

  it('handles submit correctly', () => {
    const { getByTestId } = render(
      <LayoverContext.Provider value={mockContextValues}>
        <TabStateContext.Provider value={mockTabStateContextValues}>
          <SearchInput focus />
        </TabStateContext.Provider>
      </LayoverContext.Provider>
    );

    const formElement = getByTestId('inputForm');
    fireEvent.submit(formElement);

    // Add expectations based on what should happen on form submit
  });

  it('triggers previous and next match methods correctly', () => {
    render(
      <LayoverContext.Provider value={mockContextValues}>
        <TabStateContext.Provider value={mockTabStateContextValues}>
          <SearchInput focus />
        </TabStateContext.Provider>
      </LayoverContext.Provider>
    );

    fireEvent.click(screen.getByTestId('previous-match-btn'));
    fireEvent.click(screen.getByTestId('next-match-btn'));

    // Add expectations based on what should happen when previous and next buttons are clicked
  });

  it('calls closeSearchLayover method correctly', () => {
    render(
      <LayoverContext.Provider value={mockContextValues}>
        <TabStateContext.Provider value={mockTabStateContextValues}>
          <SearchInput focus />
        </TabStateContext.Provider>
      </LayoverContext.Provider>
    );

    fireEvent.click(screen.getByTestId('close-layover-btn'));

    expect(sendMessageToBackground).toHaveBeenCalledTimes(1);
    expect(sendMessageToBackground).toHaveBeenCalledWith({
      type: REMOVE_ALL_STYLES,
    });
  });

  // TODO: ***987 - FIX THIS
  // it('currentMatchIndex is not NaN', () => {
  //   const mockTabStateContextValuesWithNumbers = {
  //     tabStateContext: {
  //       globalMatchIdxStart: 0,
  //       currentIndex: 0,
  //       matchesObj: [],
  //     },
  //   };

  //   const { getByTestId } = render(
  //     <LayoverContext.Provider value={mockContextValues}>
  //       <TabStateContext.Provider value={mockTabStateContextValuesWithNumbers}>
  //         <SearchInput focus />
  //       </TabStateContext.Provider>
  //     </LayoverContext.Provider>
  //   );

  //   const formElement = getByTestId('inputForm');
  //   fireEvent.submit(formElement);
  //   const matchingCounts = screen.getByText(/\d+\/\d+/);
  //   const [currentMatchIndex] = matchingCounts.textContent.split('/');

  //   // expect(Number.isNaN(Number(currentMatchIndex))).toBeFalsy();
  //   expect(Number.isNaN(Number(currentMatchIndex))).toBe(false);
  // });
});
