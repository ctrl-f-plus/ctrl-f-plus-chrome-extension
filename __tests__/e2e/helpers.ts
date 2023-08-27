/* eslint-disable no-await-in-loop */
// __tests__/e2e/helpers.ts

import { Page } from 'puppeteer';

export const EXTENSION_PATH = 'dist/';
export const GOOD_SEARCH_QUERY = 'ben';
export const BAD_SEARCH_QUERY = 'falseSearchQuery';
// const INPUT_SELECTOR = '#ctrl-f-plus-extension .form-div .input-style';
// const INPUT_SELECTOR = '[data-testid="inputForm"] input[type="text"]';

// const inputElement = await page.$(
//   '[data-testid="inputForm"] input[type="text"]'
// );

// const MATCHING_COUNTS_SELECTOR =
//   '#ctrl-f-plus-extension .form-div .matching-counts-wrapper .matching-counts';
// const NEXT_BUTTON_SELECTOR = '#ctrl-f-plus-extension #next-match-btn';
// const PREVIOUS_BUTTON_SELECTOR = '#ctrl-f-plus-extension #previous-match-btn';

export const SHADOW_HOST_SELECTOR = '#ctrl-f-plus-shadow-host';
export const INPUT_SELECTOR = '[data-testid="inputForm"]';
export const MATCHING_COUNTS_SELECTOR = '[data-testid="matching-counts"]';
export const NEXT_BUTTON_SELECTOR = '[data-testid="next-match-btn"]';
export const PREVIOUS_BUTTON_SELECTOR = '[data-testid="previous-match-btn"]';

export async function queryShadowRoot(page: Page) {
  const shadowHost = await page.$(SHADOW_HOST_SELECTOR);
  const shadowRoot = await page.evaluateHandle(
    (el) => el?.shadowRoot,
    shadowHost
  );

  return shadowRoot;
}

export async function typeInSearch(page: Page, query: string) {
  // const shadowHost = await page.$(SHADOW_HOST_SELECTOR);
  // const shadowRoot = await page.evaluateHandle(
  //   (el) => el?.shadowRoot,
  //   shadowHost
  // );
  const shadowRoot = await queryShadowRoot(page);
  const inputForm = await shadowRoot.$(INPUT_SELECTOR);
  await inputForm.type(query);
}

export async function getInputValueFromSelector(
  page: Page,
  selector: string = INPUT_SELECTOR
) {
  // return page.$eval(selector, (el) => (el as HTMLInputElement).value);
  const shadowRoot = await queryShadowRoot(page);
  const inputValue = await shadowRoot.$eval(
    selector,
    (el: HTMLInputElement) => el.value
  );

  return inputValue;
}

export async function validateSearchInput(page: Page, expectedQuery: string) {
  const inputValue = await getInputValueFromSelector(page);
  expect(inputValue).toBe(expectedQuery);
}

export async function submitSearchForm(page: Page) {
  const shadowRoot = await queryShadowRoot(page);
  const inputElement = await shadowRoot.$(INPUT_SELECTOR);

  // await page.keyboard.press('Enter');
  // await page.waitForTimeout(1000);

  if (inputElement) {
    await inputElement.focus();
    await page.keyboard.press('Enter');

    await page.waitForTimeout(1000);
  }
}

export async function countMatchesOnPage(page: Page, query: string) {
  const bodyContent = await page.evaluate(() => document.body.innerText);

  const searchQueryRegex = new RegExp(`${query}`, 'gi');
  const searchQueryCount = (bodyContent.match(searchQueryRegex) || []).length;

  return searchQueryCount;
}

export async function countQueryMatches(pages: Page[], query: string) {
  let totalMatches = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const page of pages) {
    // eslint-disable-next-line no-await-in-loop
    const matchCount = await countMatchesOnPage(page, query);
    totalMatches += matchCount;
  }

  return totalMatches;
}

export async function countHighlightsOnPage(page: Page, query: string) {
  const content = await page.content();

  const highlightRegex = new RegExp(
    `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${query}<\/span>`,
    'gi'
  );
  const totalHighlightCount = (content.match(highlightRegex) || []).length;

  return totalHighlightCount;
}

export async function countHighlightedMatches(pages: Page[], query: string) {
  let totalHighlights = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const page of pages) {
    const totalHighlightCount = await countHighlightsOnPage(page, query);
    totalHighlights += totalHighlightCount;
  }

  return totalHighlights;
}

export async function getInnerTextFromSelector(
  page: Page,
  selector: string = MATCHING_COUNTS_SELECTOR
) {
  const shadowRoot = await queryShadowRoot(page);
  const element = await shadowRoot.$(selector);
  return page.evaluate((el) => (el as HTMLElement).innerText, element);
}

export async function navigateMatchesWithNextButton(page: Page) {
  const shadowRoot = await queryShadowRoot(page);
  const nextButton = await shadowRoot.$(NEXT_BUTTON_SELECTOR);
  await nextButton.click();
}

export async function navigateMatchesWithEnterKey(page: Page) {
  const shadowRoot = await queryShadowRoot(page);
  const inputElement = await shadowRoot.$(INPUT_SELECTOR);

  if (inputElement) {
    await inputElement.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }
}

export async function navigateMatchesWithPreviousButton(page: Page) {
  const shadowRoot = await queryShadowRoot(page);
  const previousButton = await shadowRoot.$(PREVIOUS_BUTTON_SELECTOR);

  if (previousButton) {
    await previousButton.click();
  }
}

export async function getActiveTab(pages: Page[]) {
  const visibilityStates = await Promise.all(
    pages.map((page) => page.evaluate(() => document.visibilityState))
  );

  const visiblePages = pages.filter(
    (_, i) => visibilityStates[i] === 'visible'
  );

  return visiblePages[0];
}

export async function getActiveTabIndex(pages: Page[]) {
  for (let i = 0; i < pages.length; i += 1) {
    const state = await pages[i].evaluate(() => document.visibilityState);
    if (state === 'visible') {
      return i;
    }
  }

  return -1;
}

export async function getHighlightFocusMatchIndex(page: Page): Promise<number> {
  return page.evaluate(() => {
    const nodeList = document.querySelectorAll('.ctrl-f-highlight');
    const elements = Array.from(nodeList);

    return elements.findIndex((el) =>
      el.classList.contains('ctrl-f-highlight-focus')
    );
  });
}

export async function getHighlightFocusMatchGlobalIndex(
  currentPage: Page,
  pages: Page[]
): Promise<number> {
  let globalIndex = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const page of pages) {
    if (page === currentPage) {
      break;
    }

    globalIndex += await countHighlightsOnPage(page, GOOD_SEARCH_QUERY);
  }

  const addIndex = await currentPage.evaluate(() => {
    const nodeList = document.querySelectorAll('.ctrl-f-highlight');
    const elements = Array.from(nodeList);

    return elements.findIndex((el) =>
      el.classList.contains('ctrl-f-highlight-focus')
    );
  });

  return globalIndex + addIndex + 1;
}

export async function navigationTest(
  pages: Page[],
  expectedTabPath: number[],
  totalMatchesCount: number,
  navigationFunction: (page: Page) => void,
  isNavigatingFowards = true
) {
  const navigatedTabPath2 = [];
  let globalMatchIndex = 0;
  let previousPage: Page = await getActiveTab(pages);
  let currentPage: Page = await getActiveTab(pages);
  let previousHighlightIndex = 0;
  let currentHighlightIndex = await getHighlightFocusMatchGlobalIndex(
    currentPage,
    pages
  );
  let activeTabIndex = await getActiveTabIndex(pages);
  navigatedTabPath2.push(activeTabIndex);

  for (let i = 0; i < totalMatchesCount; i += 1) {
    previousPage = currentPage;
    previousHighlightIndex = currentHighlightIndex;

    await navigationFunction(currentPage);

    currentPage = await getActiveTab(pages);

    if (currentPage !== previousPage) {
      const previousTabFinalHighlightIndex = await getHighlightFocusMatchIndex(
        previousPage
      );

      expect(previousTabFinalHighlightIndex).toBe(-1);

      activeTabIndex = await getActiveTabIndex(pages);
      navigatedTabPath2.push(activeTabIndex);
    }

    currentPage = await getActiveTab(pages);

    currentHighlightIndex = await getHighlightFocusMatchGlobalIndex(
      currentPage,
      pages
    );

    if (isNavigatingFowards) {
      globalMatchIndex = (globalMatchIndex + 1) % totalMatchesCount; //* *FWD
    } else {
      globalMatchIndex =
        (globalMatchIndex - 1 + totalMatchesCount) % totalMatchesCount; //* *BCKWD
    }

    const matchingCounts = await getInnerTextFromSelector(
      currentPage,
      MATCHING_COUNTS_SELECTOR
    );

    const currentMatchIndex = parseInt(matchingCounts.split('/')[0], 10);

    expect(globalMatchIndex).toBe(currentMatchIndex - 1);

    let expectedValue;
    if (isNavigatingFowards) {
      expectedValue = (previousHighlightIndex % totalMatchesCount) + 1; //* *FWD - 1-indexed
    } else {
      expectedValue =
        (previousHighlightIndex - 1 + totalMatchesCount) % totalMatchesCount ||
        totalMatchesCount; //* *BCKWD
    }

    expect(currentHighlightIndex).toBe(expectedValue);
  }

  let expectedNavPath = expectedTabPath;
  if (!isNavigatingFowards) {
    expectedNavPath = expectedNavPath.reverse(); //* *BCKWD
  }

  expect(navigatedTabPath2).toStrictEqual(expectedNavPath);
}

export function parseMatchingCounts(matchingCounts: string) {
  const [currentMatchIndex, totalMatchesCount] = matchingCounts
    .split('/')
    .map(Number);
  return { currentMatchIndex, totalMatchesCount };
}

export async function waitForElementTextChange(
  page: Page,
  selector: string,
  initialText: string
): Promise<string> {
  await page.waitForFunction(
    (selector: string, initialText: string) => {
      const newText = document.querySelector(selector)?.textContent;
      return newText !== initialText;
    },
    {},
    selector,
    initialText
  );

  return page.$eval(selector, (el: Element) => (el as HTMLElement).innerText);
}

export async function navigateToLastMatch(
  page: Page,
  navigateFunction: (page: Page) => Promise<void>
) {
  let matchingCounts = await getInnerTextFromSelector(page);
  let { currentMatchIndex, totalMatchesCount } =
    parseMatchingCounts(matchingCounts);

  while (currentMatchIndex !== totalMatchesCount) {
    await navigateFunction(page);

    matchingCounts = await waitForElementTextChange(
      page,
      MATCHING_COUNTS_SELECTOR,
      matchingCounts
    );

    ({ currentMatchIndex, totalMatchesCount } =
      parseMatchingCounts(matchingCounts));
  }
}

export async function searchAndHighlightMatches(page: Page, query: string) {
  const shadowRoot = await queryShadowRoot(page);
  const inputForm = await shadowRoot.$(INPUT_SELECTOR);
  await inputForm.type(query);

  const inputValue = await getInputValueFromSelector(page, INPUT_SELECTOR);

  expect(inputValue).toBe(query);

  await navigateMatchesWithEnterKey(page); // FIXME: consider renaming as this is actually submitting the form
}

export async function getMatchCountsFromHtml(page: Page, query: string) {
  const content = await page.content();
  const bodyContent = await page.evaluate(() => document.body.innerText);

  const highlightRegex = new RegExp(
    `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${query}<\/span>`,
    'gi'
  );

  const searchQueryRegex = new RegExp(`${query}`, 'gi');

  const highlightCount = (content.match(highlightRegex) || []).length;
  const searchQueryCount = (bodyContent.match(searchQueryRegex) || []).length;

  return { highlightCount, searchQueryCount };
}

export function verifyAllMatchesAreHighlighted(
  highlightCount: number,
  searchQueryCount: number
) {
  it('should have matching counts for highlighted matches and search query matches', () => {
    expect(highlightCount).toBe(searchQueryCount);
  });
}
