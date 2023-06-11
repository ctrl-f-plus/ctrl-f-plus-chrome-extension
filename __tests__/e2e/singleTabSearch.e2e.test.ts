// __tests__/e2e/singleTabSearch.e2e.test.ts

import { Browser, Page } from 'puppeteer';
import { cleanupBrowsers, launchBrowser } from './testSetup';
const EXTENSION_PATH = 'dist/';
const EXTENSION_ID = 'lpbjbjlijokjnkfojhegklacjjdejdjk';
const TEST_URL = 'https://benjamin-chavez.com';
const GOOD_SEARCH_QUERY = 'ben';
const BAD_SEARCH_QUERY = 'falseSearchQuery';
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
const TIMEOUT = SLOW_MO ? 10000 : 5000;
const INPUT_SELECTOR = '#cntrl-f-extension .form-div .input-style';
const MATCHING_COUNTS_SELECTOR =
  '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';

describe('Ctrl-F Plus Chrome Extension E2E tests', () => {
  describe('Single-tab Search Tests', () => {
    let browser: Browser;
    let page: Page;

    describe('Highlight and Navigation Tests', () => {
      describe('When Matches DO NOT Exist', () => {
        beforeAll(async () => {
          ({ browser, page } = await launchBrowser());
        });

        it('should NOT highlight any matches if the search query does not exist on the page', async () => {
          await page.waitForSelector(INPUT_SELECTOR);
          await page.type(INPUT_SELECTOR, BAD_SEARCH_QUERY);

          const inputValue = await getInputValueFromSelector(page);
          expect(inputValue).toBe(BAD_SEARCH_QUERY);

          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);

          const content = await page.content();
          const highlightRegex = new RegExp(
            `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${BAD_SEARCH_QUERY}<\/span>`,
            'gi'
          );

          const highlightCount = (content.match(highlightRegex) || []).length;
          expect(highlightCount).toBe(0);

          await page.waitForSelector(MATCHING_COUNTS_SELECTOR);
          const matchingCounts = await getInnerTextFromSelector(page);

          expect(matchingCounts).toEqual('0/0');
        });

        afterAll(async () => {
          await cleanupBrowsers();
        });
      });

      let initialIndex;
      describe('When Matches Exist', () => {
        // it('should correctly highlight matches in the tab when a query is entered', async () => {
        //   ({ browser, page } = await launchBrowser());
        //   await highlightMatches(page, GOOD_SEARCH_QUERY);
        //   await cleanupBrowsers();
        // });

        describe('Navigation with Next Button', () => {
          const nextButtonSelector = '#cntrl-f-extension #next-match-btn';

          beforeAll(async () => {
            ({ browser, page } = await launchBrowser());
            await highlightMatches(page, GOOD_SEARCH_QUERY);
          });

          afterAll(async () => {
            await cleanupBrowsers();
          });

          it('should navigate to the next match and update the match count when the next button is clicked', async () => {
            initialIndex = await getHighlightFocusMatchIndex(page);

            await page.waitForSelector(nextButtonSelector);
            await page.click(nextButtonSelector);
            await page.waitForTimeout(1000);

            await page.waitForSelector(MATCHING_COUNTS_SELECTOR);
            const matchingCounts = await getInnerTextFromSelector(page);

            expect(matchingCounts).toEqual('2/3'); // FIXME: This should be dynamic

            const finalIndex = await getHighlightFocusMatchIndex(page);

            expect(finalIndex).toBe(initialIndex + 1);
          });

          it('should navigate back to the first match and update the match count when next button is clicked on the last match', async () => {
            await page.waitForSelector(nextButtonSelector);

            await page.waitForSelector(MATCHING_COUNTS_SELECTOR);
            let matchingCounts = await getInnerTextFromSelector(page);

            let currentMatchCount = matchingCounts.split('/')[0];
            let totalMatchCount = matchingCounts.split('/')[1];

            while (currentMatchCount !== totalMatchCount) {
              await page.click(nextButtonSelector);
              matchingCounts = await waitForElementTextChange(
                page,
                MATCHING_COUNTS_SELECTOR,
                matchingCounts
              );
              currentMatchCount = matchingCounts.split('/')[0];
              totalMatchCount = matchingCounts.split('/')[1];
            }

            await page.click(nextButtonSelector);
            matchingCounts = await waitForElementTextChange(
              page,
              MATCHING_COUNTS_SELECTOR,
              matchingCounts
            );

            expect(matchingCounts).toEqual('1/3'); // FIXME: This should be dynamic

            // currentMatchCount = matchingCounts.split('/')[0];
            // totalMatchCount = matchingCounts.split('/')[1];

            const finalIndex = await getHighlightFocusMatchIndex(page);

            expect(finalIndex).toBe(0);
          });
        });

        describe('Navigation with Enter Key', () => {
          beforeAll(async () => {
            ({ browser, page } = await launchBrowser());
            await highlightMatches(page, GOOD_SEARCH_QUERY);
          });

          afterAll(async () => {
            await cleanupBrowsers();
          });

          it('should navigate to the next match and update the match count when the enter key is pressed', async () => {
            await page.waitForSelector(MATCHING_COUNTS_SELECTOR);
            initialIndex = await getHighlightFocusMatchIndex(page);

            await page.focus(INPUT_SELECTOR);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);

            await page.waitForSelector(MATCHING_COUNTS_SELECTOR);
            const matchingCounts = await getInnerTextFromSelector(page);

            expect(matchingCounts).toEqual('2/3'); //FIXME: this should be dynamic

            const finalIndex = await getHighlightFocusMatchIndex(page);
            expect(finalIndex).toBe(initialIndex + 1);
          });

          it('should navigate back to the first match and update the match count when the enter key is pressed on the last match', async () => {
            const INPUT_SELECTOR = `#cntrl-f-extension .form-div .input-style`;

            await page.focus(INPUT_SELECTOR);
            await page.waitForSelector(MATCHING_COUNTS_SELECTOR);

            let matchingCounts = await getInnerTextFromSelector(page);
            let currentMatchCount = matchingCounts.split('/')[0];
            let totalMatchCount = matchingCounts.split('/')[1];

            while (currentMatchCount !== totalMatchCount) {
              await page.keyboard.press('Enter');

              matchingCounts = await waitForElementTextChange(
                page,
                MATCHING_COUNTS_SELECTOR,
                matchingCounts
              );

              currentMatchCount = matchingCounts.split('/')[0];
              totalMatchCount = matchingCounts.split('/')[1];
            }

            await page.keyboard.press('Enter');

            matchingCounts = await waitForElementTextChange(
              page,
              MATCHING_COUNTS_SELECTOR,
              matchingCounts
            );

            expect(matchingCounts).toEqual('1/3'); // FIXME: This should be dynamic

            const finalIndex = await getHighlightFocusMatchIndex(page);
            expect(finalIndex).toBe(0);
          });
        });

        describe('Navigation with Previous Button', () => {
          const previousButtonSelector =
            '#cntrl-f-extension #previous-match-btn';

          beforeAll(async () => {
            ({ browser, page } = await launchBrowser());
            await highlightMatches(page, GOOD_SEARCH_QUERY);
          });

          afterAll(async () => {
            await cleanupBrowsers();
          });

          it('should navigate to the last match and update the match count when the previous button is clicked on the first match', async () => {
            await page.waitForSelector(MATCHING_COUNTS_SELECTOR);

            let matchingCounts = await getInnerTextFromSelector(page);

            await page.waitForSelector(previousButtonSelector);
            await page.click(previousButtonSelector);

            matchingCounts = await waitForElementTextChange(
              page,
              MATCHING_COUNTS_SELECTOR,
              matchingCounts
            );
            let currentMatchCount = matchingCounts.split('/')[0];
            // let currentMatchCount = parseInt(matchingCounts.split('/')[0]);
            let totalMatchCount = matchingCounts.split('/')[1];

            expect(currentMatchCount).toEqual(totalMatchCount); // FIXME: This should be dynamic

            const finalIndex = await getHighlightFocusMatchIndex(page);

            expect(finalIndex).toBe(2);
          });

          it('should navigate to the previous match and update the match count when the previous button is clicked', async () => {
            initialIndex = await getHighlightFocusMatchIndex(page);

            await page.waitForSelector(MATCHING_COUNTS_SELECTOR);
            let matchingCounts = await getInnerTextFromSelector(page);

            expect(matchingCounts).toEqual('3/3'); // FIXME: This should be dynamic

            await page.waitForSelector(previousButtonSelector);
            await page.click(previousButtonSelector);

            matchingCounts = await waitForElementTextChange(
              page,
              MATCHING_COUNTS_SELECTOR,
              matchingCounts
            );

            expect(matchingCounts).toEqual('2/3'); // FIXME: This should be dynamic

            const finalIndex = await getHighlightFocusMatchIndex(page);

            expect(finalIndex).toBe(initialIndex - 1); //FIXME: review this logic
          });
        });
      });
    });
  });
});

async function getHighlightFocusMatchIndex(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const nodeList = document.querySelectorAll('.ctrl-f-highlight');
    const elements = Array.from(nodeList);
    return elements.findIndex((el) =>
      el.classList.contains('ctrl-f-highlight-focus')
    );
  });
}

async function getInputValueFromSelector(
  page: Page,
  selector: string = INPUT_SELECTOR
) {
  return await page.$eval(selector, (el) => (el as HTMLInputElement).value);
}

async function getInnerTextFromSelector(
  page: Page,
  selector: string = MATCHING_COUNTS_SELECTOR
) {
  return await page.$eval(selector, (el) => (el as HTMLElement).innerText);
}

async function waitForElementTextChange(
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

// async function waitForCondition(page, condition, timeout = 30000) {
//   try {
//     await page.waitForFunction(condition, { timeout });
//   } catch (error) {
//     console.error(`Error waiting for condition: ${error}`);
//   }
// }

async function highlightMatches(page: Page, query: string) {
  await page.waitForSelector(INPUT_SELECTOR);
  await page.type(INPUT_SELECTOR, query);

  const inputValue = await getInputValueFromSelector(page);

  expect(inputValue).toBe(query);

  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  const content = await page.content();
  const bodyContent = await page.evaluate(() => document.body.innerText);

  const highlightRegex = new RegExp(
    `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${query}<\/span>`,
    'gi'
  );

  const searchQueryRegex = new RegExp(`${query}`, 'gi');

  const highlightCount = (content.match(highlightRegex) || []).length;
  const searchQueryCount = (bodyContent.match(searchQueryRegex) || []).length;

  expect(highlightCount).toBe(searchQueryCount);
}
