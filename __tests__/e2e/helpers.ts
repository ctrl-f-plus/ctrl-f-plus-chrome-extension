/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
// __tests__/e2e/helpers.ts

import { Page } from 'puppeteer';
// import { getInputValueFromSelector } from './helper';
export const EXTENSION_PATH = 'dist/';
// const GOOD_SEARCH_QUERY = 'chavez';
export const GOOD_SEARCH_QUERY = 'ben';
export const BAD_SEARCH_QUERY = 'falseSearchQuery';
// const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
// const TIMEOUT = SLOW_MO ? 10000 : 5000;
const INPUT_SELECTOR = '#ctrl-f-plus-extension .form-div .input-style';
const MATCHING_COUNTS_SELECTOR =
  '#ctrl-f-plus-extension .form-div .matching-counts-wrapper .matching-counts';
// const NUMBER_OF_TABS = 1;
const NEXT_BUTTON_SELECTOR = '#ctrl-f-plus-extension #next-match-btn';
const PREVIOUS_BUTTON_SELECTOR = '#ctrl-f-plus-extension #previous-match-btn';

export async function typeInSearch(page: Page, query: string) {
  await page.waitForSelector(INPUT_SELECTOR);
  await page.type(INPUT_SELECTOR, query);
}

export async function getInputValueFromSelector(
  page: Page,
  selector: string = INPUT_SELECTOR
) {
  return page.$eval(selector, (el) => (el as HTMLInputElement).value);
}

export async function validateSearchInput(page: Page, expectedQuery: string) {
  const inputValue = await getInputValueFromSelector(page);
  expect(inputValue).toBe(expectedQuery);
}

export async function submitSearchForm(page: Page) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
}

export async function countMatchesOnPage(page: Page, query: string) {
  const bodyContent = await page.evaluate(() => document.body.innerText);

  const searchQueryRegex = new RegExp(`${query}`, 'gi');
  const searchQueryCount = (bodyContent.match(searchQueryRegex) || []).length;

  return searchQueryCount;
}

export async function countQueryMatches(pages: Page[], query: string) {
  let totalMatches = 0;

  for (const page of pages) {
    const matchCount = await countMatchesOnPage(page, query);
    totalMatches += matchCount;
  }

  return totalMatches;
}

export async function countHighlightsOnPage(page: Page, query: string) {
  // const bodyContent = await page.evaluate(() => document.body.innerText);
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
  await page.waitForSelector(MATCHING_COUNTS_SELECTOR);
  return page.$eval(selector, (el) => (el as HTMLElement).innerText);
}

export async function navigateMatchesWithNextButton(page: Page) {
  await page.waitForSelector(NEXT_BUTTON_SELECTOR);
  await page.click(NEXT_BUTTON_SELECTOR);
  // await page.waitForTimeout(1000);
}

export async function navigateMatchesWithEnterKey(page: Page) {
  // await page.focus(INPUT_SELECTOR);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
}

export async function navigateMatchesWithPreviousButton(page: Page) {
  await page.waitForSelector(PREVIOUS_BUTTON_SELECTOR);
  await page.click(PREVIOUS_BUTTON_SELECTOR);
  // await page.waitForTimeout(1000);
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
      // (previousHighlightIndex + 1) % totalMatchesCount //**FWD - 0-indexed
    } else {
      expectedValue =
        (previousHighlightIndex - 1 + totalMatchesCount) % totalMatchesCount ||
        totalMatchesCount; //* *BCKWD
    }

    expect(currentHighlightIndex).toBe(
      expectedValue
      // (previousHighlightIndex % totalMatchesCount) + 1 //**FWD - 1-indexed
      // (previousHighlightIndex + 1) % totalMatchesCount //**FWD - 0-indexed
      // (previousHighlightIndex - 1 + totalMatchesCount) %
      //   totalMatchesCount || totalMatchesCount //**BCKWD
    );
  }

  let expectedNavPath = expectedTabPath;
  if (!isNavigatingFowards) {
    expectedNavPath = expectedNavPath.reverse(); //* *BCKWD
  }

  expect(navigatedTabPath2).toStrictEqual(expectedNavPath);
}

/// //////

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
  await page.waitForSelector(INPUT_SELECTOR);
  await page.type(INPUT_SELECTOR, query);

  const inputValue = await getInputValueFromSelector(page);

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

// TESTS
export function verifyAllMatchesAreHighlighted(
  highlightCount: number,
  searchQueryCount: number
) {
  it('should have matching counts for highlighted matches and search query matches', () => {
    expect(highlightCount).toBe(searchQueryCount);
  });
}
