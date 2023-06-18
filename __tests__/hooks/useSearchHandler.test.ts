// __tests__ / hooks / useSearchHandler.test.ts

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { sendMessageToBackground } from '../../src/utils/messageUtils/sendMessageToBackground';
import { clearAllStoredTabs } from '../../src/utils/storage';
import useSearchHandler from '../../src/hooks/useSearchHandler';

jest.mock('../../src/utils/messageUtils/sendMessageToBackground');
jest.mock('../../src/utils/storage');

describe('useSearchHandler', () => {
  it('updates search and last search values', async () => {
    const setSearchValue = jest.fn();
    const setLastSearchValue = jest.fn();
    const contextValues = { setSearchValue, setLastSearchValue };

    // Mock the context
    jest.spyOn(React, 'useContext').mockImplementation(() => contextValues);

    const { result } = renderHook(useSearchHandler);

    const newSearchValue = 'New search value';

    await act(async () => {
      await result.current.handleSearch(newSearchValue);
    });

    expect(setSearchValue).toHaveBeenCalledWith(newSearchValue);
    expect(setLastSearchValue).toHaveBeenCalledWith(newSearchValue);

    // Verifying that the utility functions were called
    expect(clearAllStoredTabs).toHaveBeenCalled();
    expect(sendMessageToBackground).toHaveBeenCalledTimes(2);
    expect(sendMessageToBackground).toHaveBeenNthCalledWith(1, {
      from: 'content',
      type: 'remove-all-highlight-matches',
    });
    expect(sendMessageToBackground).toHaveBeenNthCalledWith(2, {
      from: 'content',
      type: 'get-all-matches',
      payload: {
        searchValue: newSearchValue,
      },
    });
  });
});
