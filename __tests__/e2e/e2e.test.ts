// Import puppeteer
import puppeteer, { Browser, Page } from 'puppeteer';
// import { getInputValueFromSelector } from './helper';
const EXTENSION_PATH = 'dist/';
const GOOD_SEARCH_QUERY = 'ben';
export const BAD_SEARCH_QUERY = 'falseSearchQuery';
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
const TIMEOUT = SLOW_MO ? 10000 : 5000;
const INPUT_SELECTOR = '#cntrl-f-extension .form-div .input-style';
const MATCHING_COUNTS_SELECTOR =
  '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';
const NUMBER_OF_TABS: number = 1;
const NEXT_BUTTON_SELECTOR = '#cntrl-f-extension #next-match-btn';
const PREVIOUS_BUTTON_SELECTOR = '#cntrl-f-extension #previous-match-btn';

// TODO: NEED TO ADD ACTUAL URLs. May need to add them to the tabScenarios' objects
const TEST_URLS = [
  'https://benjamin-chavez.com',
  'https://github.com/bmchavez',
  'https://benjamin-chavez.com',
  'https://benjamin-chavez.com',
  'https://benjamin-chavez.com',
  'https://benjamin-chavez.com',
  'https://benjamin-chavez.com',
  'https://benjamin-chavez.com',
  'https://benjamin-chavez.com',
  'https://benjamin-chavez.com',
];

describe('Tab Navigation Extension', () => {
  const tabScenarios = [
    { name: 'Single Tab: Basic Match Navigation', tabCount: 1 },
    { name: 'Two Tabs: Tab Switching and Skipping', tabCount: 2 },
    { name: 'Three Tabs: Multiple Tab Switching and Skipping', tabCount: 3 },
    { name: 'Three Tabs: All Tabs with Matches', tabCount: 3 },
    { name: 'Three Tabs: No Matches in Any Tab', tabCount: 3 },
    { name: 'Eight Tabs: Mixed Matches', tabCount: 8 },
  ];

  for (const scenario of tabScenarios) {
    let browserArray: Browser[];
    let browser: Browser;

    let pages: Page[];
    let page: Page;
    let query: string;

    describe(scenario.name, () => {
      beforeAll(async () => {
        browser = await puppeteer.launch({
          headless: false,
          devtools: true,
          slowMo: 250,
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
          ],
        });

        // browserArray.push(browser);
        pages = await browser.pages();
        page = pages[0];
        await page.goto(TEST_URLS[0]);

        for (let i = 1; i < scenario.tabCount; i++) {
          let newPage = await browser.newPage();
          pages.push(newPage);

          await newPage.goto(TEST_URLS[i]);
          await newPage.bringToFront();
        }

        await page.bringToFront();
        query = GOOD_SEARCH_QUERY;
      });

      afterAll(async () => {
        await browser.close();
      });

      describe('Match Highlighting', () => {
        test('Extension finds and highlights correct number of matches', async () => {
          // page = pages[0];
          // Get the actual count of query matches - Iterate through the tabs and count the number of query matches
          const queryMatchCount = await countQueryMatches(pages, query);

          // async function performSearch(page: Page, query: string) {
          await typeInSearch(page, query);
          await validateSearchInput(page, query);
          await submitSearchForm(page);
          // }

          // Get the count of all highlighted matches - Iterate through the tabs and count elements that have the .highlight class
          const highlightCount = await countHighlightedMatches(pages, query);

          expect(highlightCount).toBe(queryMatchCount);
        });
      });

      // describe('Navigation Methods', () => {
      //   test('Navigation works correctly with nextButton', async () => {
      //     // Test code here...
      //     // for (let i = 0; i < totalMatches; i++) {
      //     //   await checkMatchIndexAccuracy(page, currentIndex, expectedIndex);
      //     // }
      //   });

      //   test('Navigation works correctly with previousButton', async () => {
      //     // Test code here...
      //     // for (let i = totalMatches - 1; i >= 0; i--) {
      //     //   // Trigger 'previousButton' navigation...
      //     //   await checkMatchIndexAccuracy(page, currentIndex, expectedIndex);
      //     // }
      //   });

      //   test('Navigation works correctly with Enter key', async () => {
      //     // Test code here...
      //     // for (let i = 0; i < totalMatches; i++) {
      //     //   // Trigger 'Enter' key navigation...
      //     //   await checkMatchIndexAccuracy(page, currentIndex, expectedIndex);
      //     // }
      //   });
      // });

      // TODO: START HERE TODO: START HERE TODO: START HERE TODO: START HERE TODO: START HERE TODO: START HERE
      // TODO: START HERE TODO: START HERE TODO: START HERE TODO: START HERE TODO: START HERE TODO: START HERE
      // TODO: 1) Finish this `Count Display` test.
      // TODO: 2) Update the testing URLs.
      // TODO: 2) Move on to the navigation methods tests
      describe('Count Display', () => {
        test.todo('Total Matches Count is accurate');
      });

      describe('Closing the Search Input', () => {
        beforeAll(async () => {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        });

        test('closing the search input hides the overlay', async () => {
          const searchInput = await page.$(INPUT_SELECTOR); // TODO: Consider making this a loop too (to check all tabs)
          expect(searchInput).toBe(null);
          // expect(searchInput).toBeNull();
        });

        test('closing the search input unhighlights all matches', async () => {
          const highlightCount = await countHighlightedMatches(pages, query);
          expect(highlightCount).toBe(0);
        });
      });
    });
  }
});

// Helper Functions
async function checkMatchIndexAccuracy(
  page: Page,
  currentIndex: number,
  expectedIndex: number
) {
  //  TODO:
  const matchIndex = await page.evaluate(() => currentIndex);
  expect(matchIndex).toBe(expectedIndex);
}

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
    const highlightCount = await countHighlightsOnPage(page, query);
    totalHighlights += highlightCount;
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
  const highlightCount = (content.match(highlightRegex) || []).length;

  return highlightCount;
}
