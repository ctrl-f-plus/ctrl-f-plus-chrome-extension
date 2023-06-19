// __tests__/e2e/e2e.test.ts

import puppeteer, { Browser, Page } from 'puppeteer';
import { setupTest } from './testSetup';
// import { getInputValueFromSelector } from './helper';
const EXTENSION_PATH = 'dist/';
// const GOOD_SEARCH_QUERY = 'chavez';
const GOOD_SEARCH_QUERY = 'ben';
export const BAD_SEARCH_QUERY = 'falseSearchQuery';
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
const TIMEOUT = SLOW_MO ? 10000 : 5000;
const INPUT_SELECTOR = '#ctrl-f-plus-extension .form-div .input-style';
const MATCHING_COUNTS_SELECTOR =
  '#ctrl-f-plus-extension .form-div .matching-counts-wrapper .matching-counts';
const NUMBER_OF_TABS: number = 1;
const NEXT_BUTTON_SELECTOR = '#ctrl-f-plus-extension #next-match-btn';
const PREVIOUS_BUTTON_SELECTOR = '#ctrl-f-plus-extension #previous-match-btn';

// TODO: NEED TO ADD ACTUAL URLs. May need to add them to the tabScenarios' objects

const TEST_URLS_YES = [
  'https://benjamin-chavez.com',
  // 'http://127.0.0.1:5500/docs/index.html',
];

const TEST_URLS_NO_YES = [
  'https://www.google.com',

  'https://benjamin-chavez.com',
  // 'http://127.0.0.1:5500/docs/index.html',
];

const TEST_URLS_YES_NO_YES = [
  'https://benjamin-chavez.com',
  // 'http://127.0.0.1:5500/docs/index.html',
  'https://www.google.com',
  'https://github.com/bmchavez',
];

const TEST_URLS_YES_YES_YES = [
  'https://benjamin-chavez.com',
  // 'http://127.0.0.1:5500/docs/index.html',

  'https://benjamin-chavez.com',
  // 'http://127.0.0.1:5500/docs/index.html',

  'https://benjamin-chavez.com',
  // 'http://127.0.0.1:5500/docs/index.html',
];

const TEST_URLS_NO_NO_NO = [
  'https://www.google.com',
  'https://www.google.com',
  'https://www.google.com',
];

const TEST_URLS_NO_NO_YES_YES_NO_NO_YES_NO_NO = [
  'https://www.google.com',
  'https://www.google.com',

  'https://benjamin-chavez.com',
  // 'http://127.0.0.1:5500/docs/index.html',
  'https://github.com/bmchavez',
  'https://www.google.com',
  'https://www.google.com',

  'https://benjamin-chavez.com',
  // 'http://127.0.0.1:5500/docs/index.html',
  'https://www.google.com',
  'https://www.google.com',
];

describe('Tab Navigation Extension', () => {
  const tabScenarios = [
    {
      name: 'Single Tab: Basic Match Navigation',
      tabCount: 1,
      testUrls: TEST_URLS_YES,
      expectedTabPath: [0],
    },
    {
      name: 'Two Tabs: Tab Switching and Skipping',
      tabCount: 2,
      testUrls: TEST_URLS_NO_YES,
      expectedTabPath: [1],
    },
    {
      name: 'Three Tabs: Multiple Tab Switching and Skipping',
      tabCount: 3,
      testUrls: TEST_URLS_YES_NO_YES,
      expectedTabPath: [0, 2, 0], // <- correct
    },
    {
      name: 'Three Tabs: All Tabs with Matches',
      tabCount: 3,
      testUrls: TEST_URLS_YES_YES_YES,
      expectedTabPath: [0, 1, 2, 0],
    },
    {
      name: 'Three Tabs: No Matches in Any Tab',
      tabCount: 3,
      testUrls: TEST_URLS_NO_NO_NO,
      expectedTabPath: [0],
    },
    {
      name: 'Eight Tabs: Mixed Matches',
      tabCount: 9,
      testUrls: TEST_URLS_NO_NO_YES_YES_NO_NO_YES_NO_NO,
      expectedTabPath: [2, 3, 6, 2],
    },
  ];

  for (const scenario of tabScenarios) {
    let browserArray: Browser[] = [];
    let browser: Browser;
    let pages: Page[];
    let page: Page;

    let query: string;
    let queryMatchCount: number;
    let navigatedTabPath: number[] = [];

    let totalHighlightCount: number;
    let totalMatchesCount: number;

    describe(scenario.name, () => {
      beforeAll(async () => {
        browser = await puppeteer.launch({
          headless: false,
          devtools: true,
          slowMo: 15,
          defaultViewport: null,
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
          ],
        });

        totalHighlightCount = 0;
        totalMatchesCount = 0;
        const testUrls = scenario.testUrls;
        browserArray.push(browser);
        pages = await browser.pages();
        page = pages[0];
        await page.goto(testUrls[0]);

        for (let i = 1; i < scenario.tabCount; i++) {
          let newPage = await browser.newPage();
          pages.push(newPage);

          await newPage.goto(testUrls[i]);
          await newPage.bringToFront();
        }

        await page.bringToFront();
        query = GOOD_SEARCH_QUERY;
      });

      afterAll(async () => {
        browserArray.map(async (browser: Browser) => {
          await browser.close();
        });
      });

      describe('Match Highlighting', () => {
        test('Extension finds and highlights correct number of matches', async () => {
          queryMatchCount = await countQueryMatches(pages, query);

          // async function performSearch(page: Page, query: string) {
          await typeInSearch(page, query);
          await validateSearchInput(page, query);
          await submitSearchForm(page);
          // }

          page = await getActiveTab(pages);
          const activeTabIndex = await getActiveTabIndex(pages);
          navigatedTabPath.push(activeTabIndex);

          totalHighlightCount = await countHighlightedMatches(pages, query);
          expect(totalHighlightCount).toBe(queryMatchCount);
        });
      });

      describe('Count Display', () => {
        test('Total Matches Count is accurate', async () => {
          let matchingCounts = await getInnerTextFromSelector(
            page,
            MATCHING_COUNTS_SELECTOR
          );

          totalMatchesCount = parseInt(matchingCounts.split('/')[1]);

          expect(totalMatchesCount).toBe(totalHighlightCount);
        });
      });

      describe('Navigation Methods', () => {
        describe('Navigation works correctly with nextButton', () => {
          test('Navigation works correctly with nextButton', async () => {
            await navigationTest(
              pages,
              scenario.expectedTabPath,
              totalMatchesCount,
              navigateMatchesWithNextButton,
              true
            );
          });
        });

        describe('Navigation works correctly with Enter Key', () => {
          test('Navigation works correctly with Enter key', async () => {
            navigatedTabPath = [];
            const activeTabIndex = await getActiveTabIndex(pages);
            navigatedTabPath.push(activeTabIndex);

            await navigationTest(
              pages,
              scenario.expectedTabPath,
              totalMatchesCount,
              navigateMatchesWithEnterKey,
              true
            );
          });
        });

        describe('Navigation works correctly with Previous Button', () => {
          test('Navigation works correctly with previousButton', async () => {
            const isNavigatingFowards = false;
            navigatedTabPath = [];
            const activeTabIndex = await getActiveTabIndex(pages);
            navigatedTabPath.push(activeTabIndex);

            await navigationTest(
              pages,
              scenario.expectedTabPath,
              totalMatchesCount,
              navigateMatchesWithPreviousButton,
              isNavigatingFowards
            );
          });
        });
      });

      describe('Closing the Search Input', () => {
        beforeAll(async () => {
          page = await getActiveTab(pages);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        });

        test('closing the search input hides the overlay', async () => {
          const searchInput = await page.$(INPUT_SELECTOR); // TODO: Consider making this a loop too (to check all tabs)
          expect(searchInput).toBeNull();
        });

        test('closing the search input unhighlights all matches', async () => {
          await page.waitForTimeout(1000);
          const totalHighlightCount = await countHighlightedMatches(
            pages,
            query
          );
          // expect(isOverlayVisible(page)).toBeFalsy();
          expect(totalHighlightCount).toBe(0);
        });
      });
    });
  }
});

// Helper Functions
// async function checkMatchIndexAccuracy(
//   page: Page,
//   currentIndex: number,
//   expectedIndex: number
// ) {
//   //  TODO:
//   const matchIndex = await page.evaluate(() => currentIndex);
//   expect(matchIndex).toBe(expectedIndex);
// }

async function typeInSearch(page: Page, query: string) {
  await page.waitForSelector(INPUT_SELECTOR);
  await page.type(INPUT_SELECTOR, query);
}

async function validateSearchInput(page: Page, expectedQuery: string) {
  const inputValue = await getInputValueFromSelector(page);
  expect(inputValue).toBe(expectedQuery);
}

async function submitSearchForm(page: Page) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
}

export async function getInputValueFromSelector(
  page: Page,
  selector: string = INPUT_SELECTOR
) {
  return await page.$eval(selector, (el) => (el as HTMLInputElement).value);
}

async function countQueryMatches(pages: Page[], query: string) {
  let totalMatches = 0;

  for (const page of pages) {
    const matchCount = await countMatchesOnPage(page, query);
    totalMatches += matchCount;
  }
  return totalMatches;
}

async function countMatchesOnPage(page: Page, query: string) {
  // const content = await page.content();
  const bodyContent = await page.evaluate(() => document.body.innerText);

  const searchQueryRegex = new RegExp(`${query}`, 'gi');
  const searchQueryCount = (bodyContent.match(searchQueryRegex) || []).length;

  return searchQueryCount;
}

async function countHighlightedMatches(pages: Page[], query: string) {
  let totalHighlights = 0;

  for (const page of pages) {
    const totalHighlightCount = await countHighlightsOnPage(page, query);
    totalHighlights += totalHighlightCount;
  }

  return totalHighlights;
}

async function countHighlightsOnPage(page: Page, query: string) {
  // const bodyContent = await page.evaluate(() => document.body.innerText);
  const content = await page.content();

  const highlightRegex = new RegExp(
    `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${query}<\/span>`,
    'gi'
  );
  const totalHighlightCount = (content.match(highlightRegex) || []).length;

  return totalHighlightCount;
}

async function getInnerTextFromSelector(
  page: Page,
  selector: string = MATCHING_COUNTS_SELECTOR
) {
  await page.waitForSelector(MATCHING_COUNTS_SELECTOR);
  return await page.$eval(selector, (el) => (el as HTMLElement).innerText);
}

async function navigateMatchesWithNextButton(page: Page) {
  await page.waitForSelector(NEXT_BUTTON_SELECTOR);
  await page.click(NEXT_BUTTON_SELECTOR);
  // await page.waitForTimeout(1000);
}

const navigateMatchesWithEnterKey = async (page: Page) => {
  // await page.focus(INPUT_SELECTOR);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
};

const navigateMatchesWithPreviousButton = async (page: Page) => {
  await page.waitForSelector(PREVIOUS_BUTTON_SELECTOR);
  await page.click(PREVIOUS_BUTTON_SELECTOR);
  // await page.waitForTimeout(1000);
};

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
  for (let i = 0; i < pages.length; i++) {
    const state = await pages[i].evaluate(() => document.visibilityState);
    if (state === 'visible') {
      return i;
    }
  }

  return -1;
}

async function getHighlightFocusMatchIndex(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const nodeList = document.querySelectorAll('.ctrl-f-highlight');
    const elements = Array.from(nodeList);

    return elements.findIndex((el) =>
      el.classList.contains('ctrl-f-highlight-focus')
    );
  });
}

async function getHighlightFocusMatchGlobalIndex(
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

  return (globalIndex += addIndex + 1);
}

async function navigationTest(
  pages: Page[],
  expectedTabPath: number[],
  totalMatchesCount: number,
  navigationFunction: Function,
  isNavigatingFowards: boolean = true
) {
  let navigatedTabPath2 = [];
  let globalMatchIndex = 0;
  let previousPage: Page = await getActiveTab(pages);
  let currentPage: Page = await getActiveTab(pages);
  let previousHighlightIndex: number = 0;
  let currentHighlightIndex = await getHighlightFocusMatchGlobalIndex(
    currentPage,
    pages
  );
  let activeTabIndex = await getActiveTabIndex(pages);
  navigatedTabPath2.push(activeTabIndex);

  for (let i = 0; i < totalMatchesCount; i++) {
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
      globalMatchIndex = (globalMatchIndex + 1) % totalMatchesCount; //**FWD
    } else {
      globalMatchIndex =
        (globalMatchIndex - 1 + totalMatchesCount) % totalMatchesCount; //**BCKWD
    }

    let matchingCounts = await getInnerTextFromSelector(
      currentPage,
      MATCHING_COUNTS_SELECTOR
    );

    let currentMatchIndex = parseInt(matchingCounts.split('/')[0]);

    expect(globalMatchIndex).toBe(currentMatchIndex - 1);

    let expectedValue;
    if (isNavigatingFowards) {
      expectedValue = (previousHighlightIndex % totalMatchesCount) + 1; //**FWD - 1-indexed
      // (previousHighlightIndex + 1) % totalMatchesCount //**FWD - 0-indexed
    } else {
      expectedValue =
        (previousHighlightIndex - 1 + totalMatchesCount) % totalMatchesCount ||
        totalMatchesCount; //**BCKWD
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
    expectedNavPath = expectedNavPath.reverse(); //**BCKWD
  }

  expect(navigatedTabPath2).toStrictEqual(expectedNavPath);
}

/////////

export function parseMatchingCounts(matchingCounts: string) {
  const [currentMatchIndex, totalMatchesCount] = matchingCounts
    .split('/')
    .map(Number);
  return { currentMatchIndex, totalMatchesCount };
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

  return await page.$eval(
    selector,
    (el: Element) => (el as HTMLElement).innerText
  );
}

//export  async function waitForCondition(page, condition, timeout = 30000) {
//   try {
//     await page.waitForFunction(condition, { timeout });
//   } catch (error) {
//     console.error(`Error waiting for condition: ${error}`);
//   }
// }

async function searchAndHighlightMatches(page: Page, query: string) {
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
