// __tests__/e2e/extension.test.js

import { Browser, Page } from 'puppeteer';
import { cleanupBrowsers, launchBrowser } from './testSetup';
const EXTENSION_PATH = 'dist/';
const EXTENSION_ID = 'lpbjbjlijokjnkfojhegklacjjdejdjk';
const TEST_URL = 'https://benjamin-chavez.com';
const GOOD_SEARCH_QUERY = 'ben';
const BAD_SEARCH_QUERY = 'falseSearchQuery';
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
const TIMEOUT = SLOW_MO ? 10000 : 5000;

// let browserArray = [];
// let page;
describe('Ctrl-F Plus Chrome Extension E2E tests', () => {
  describe('Single-tab Search Tests', () => {
    let browser: Browser;
    let page: Page;

    // TODO: KEYBOARD COMMANDS WON'T WORK TO TOGGLE LAYOVER - REVIEW THESE TESTS
    // describe('Initial State and Toggle Tests', () => {
    //   beforeAll(async () => {
    //     const browser = await puppeteer.launch({
    //       headless: false,
    //       devtools: true,
    //       slowMo: SLOW_MO,
    //       args: [
    //         `--disable-extensions-except=${EXTENSION_PATH}`,
    //         `--load-extension=${EXTENSION_PATH}`,
    //       ],
    //     });
    //     browserArray.push(browser);
    //     [page] = await browser.pages();
    //     await page.goto(TEST_URL);
    //     await page.bringToFront();
    //   });

    //   it('should not display the search overlay on startup', async () => {
    //     const layoverElement = await page.evaluate(() =>
    //       document.querySelector('#cntrl-f-extension')
    //     );
    //     expect(layoverElement).toBeNull();
    //   });

    //   it('should toggle the search overlay from closed to open state after the hotkey is issued', async () => {
    //     const extensionUrl = `chrome-extension://${EXTENSION_ID}/_generated_background_page.html`;
    //     const backgroundPage = await browser.newPage();
    //     await backgroundPage.goto(extensionUrl);
    //     await page.bringToFront();

    //     await backgroundPage.evaluate(() => {
    //       toggleLayover();
    //     });

    //     await page.waitForSelector('#cntrl-f-extension');

    //     const layoverElement = await page.evaluate(() =>
    //       document.querySelector('#cntrl-f-extension')
    //     );
    //     expect(layoverElement).not.toBeNull();
    //   });

    //   afterAll(async () => {
    //     console.log('clean up');
    //     try {
    //       await Promise.all(
    //         browserArray.map(async (browser) => {
    //           try {
    //             const closeBrowser = await browser.close();
    //           } catch (error) {
    //             // no-op
    //           }
    //         })
    //       );
    //     } catch (error) {
    //       // no-op
    //     }
    //   });
    // });

    describe('Highlight and Navigation Tests When Matches DO NOT Exist', () => {
      beforeAll(async () => {
        ({ browser, page } = await launchBrowser());
      });

      // TODO: This test could be in its own describe block
      it('should NOT highlight any matches if the search query does not exist on the page', async () => {
        const inputSelector = '#cntrl-f-extension .form-div .input-style';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, BAD_SEARCH_QUERY);
        const inputText = await page.$eval(inputSelector, (el) => el.value);
        expect(inputText).toBe(BAD_SEARCH_QUERY);

        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        const content = await page.content();

        const highlightRegex = new RegExp(
          `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${BAD_SEARCH_QUERY}<\/span>`,
          'gi'
        );

        const highlightCount = (content.match(highlightRegex) || []).length;
        console.log(highlightCount);
        expect(highlightCount).toBe(0);

        const matchingCountsSelector =
          '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';
        await page.waitForSelector(matchingCountsSelector);
        const matchingCounts = await page.$eval(
          matchingCountsSelector,
          (el: Element) => (el as HTMLElement).innerText
        );
        console.log(matchingCounts);
        expect(matchingCounts).toEqual('0/0');
      });

      afterAll(async () => {
        await cleanupBrowsers();
      });
    });

    let initialIndex;
    describe.only('Highlight and Navigation Tests When Matches Exist', () => {
      beforeAll(async () => {
        ({ browser, page } = await launchBrowser());
      });

      it('should correctly highlight matches in the tab when a query is entered', async () => {
        const inputSelector = '#cntrl-f-extension .form-div .input-style';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, GOOD_SEARCH_QUERY);
        const inputText = await page.$eval(inputSelector, (el) => el.value);
        expect(inputText).toBe(GOOD_SEARCH_QUERY);

        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        const content = await page.content();
        const bodyContent = await page.evaluate(() => document.body.innerText);

        const highlightRegex = new RegExp(
          `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${GOOD_SEARCH_QUERY}<\/span>`,
          'gi'
        );

        const searchQueryRegex = new RegExp(`${GOOD_SEARCH_QUERY}`, 'gi');

        const highlightCount = (content.match(highlightRegex) || []).length;
        const searchQueryCount = (bodyContent.match(searchQueryRegex) || [])
          .length;

        expect(highlightCount).toBe(searchQueryCount);
      });

      it('should navigate to the next match and update the match count when the next button is clicked', async () => {
        initialIndex = await page.evaluate(() => {
          const nodeList = document.querySelectorAll('.ctrl-f-highlight');
          const elements = Array.from(nodeList);
          return elements.findIndex((el) =>
            el.classList.contains('ctrl-f-highlight-focus')
          );
        });

        const nextButtonSelector = '#cntrl-f-extension #cfp-next-match-btn';
        await page.waitForSelector(nextButtonSelector);
        await page.click(nextButtonSelector);
        await page.waitForTimeout(1000);

        const matchingCountsSelector =
          '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';
        await page.waitForSelector(matchingCountsSelector);
        const matchingCounts = await page.$eval(
          matchingCountsSelector,
          (el: Element) => (el as HTMLElement).innerText
        );

        expect(matchingCounts).toEqual('2/3'); // FIXME: This should be dynamic

        let finalIndex = await page.evaluate(() => {
          const nodeList = document.querySelectorAll('.ctrl-f-highlight');
          const elements = Array.from(nodeList);
          return elements.findIndex((el) =>
            el.classList.contains('ctrl-f-highlight-focus')
          );
        });

        expect(finalIndex).toBe(initialIndex + 1);
      });

      it('should navigate back to the first match and update the match count when next button is clicked on the last match', async () => {
        const nextButtonSelector = '#cntrl-f-extension #cfp-next-match-btn';
        await page.waitForSelector(nextButtonSelector);

        const matchingCountsSelector =
          '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';
        await page.waitForSelector(matchingCountsSelector);
        let matchingCounts = await page.$eval(
          matchingCountsSelector,
          (el: Element) => (el as HTMLElement).innerText
        );
        let currentMatchCount = matchingCounts.split('/')[0];
        let totalMatchCount = matchingCounts.split('/')[1];
        while (currentMatchCount !== totalMatchCount) {
          await page.click(nextButtonSelector);
          await page.waitForTimeout(1000);

          matchingCounts = await page.$eval(
            matchingCountsSelector,
            (el: Element) => (el as HTMLElement).innerText
          );
          currentMatchCount = matchingCounts.split('/')[0];
          totalMatchCount = matchingCounts.split('/')[1];
        }

        await page.click(nextButtonSelector);
        await page.waitForTimeout(1000);

        matchingCounts = await page.$eval(
          matchingCountsSelector,
          (el: Element) => (el as HTMLElement).innerText
        );
        // currentMatchCount = matchingCounts.split('/')[0];
        // totalMatchCount = matchingCounts.split('/')[1];

        expect(matchingCounts).toEqual('1/3'); // FIXME: This should be dynamic

        let finalIndex = await page.evaluate(() => {
          const nodeList = document.querySelectorAll('.ctrl-f-highlight');
          const elements = Array.from(nodeList);
          return elements.findIndex((el) =>
            el.classList.contains('ctrl-f-highlight-focus')
          );
        });

        expect(finalIndex).toBe(0);
      });

      // it('should navigate to the next match and update the match count when the enter key is pressed', async () => {
      //   // TODO:
      //   expect(false).toBe(true);
      // });
      // it('should navigate back to the first match and update the match count when the enter key is pressed on the last match', async () => {
      //   // TODO:
      //   expect(false).toBe(true);
      // });
      // it('should navigate to the previous match and update the match count when the previous button is clicked', async () => {
      //   // TODO:
      //   expect(false).toBe(true);
      // });
      // it('should navigate to the last match and update the match count when the previous button is clicked on the first match', async () => {
      //   // TODO:
      //   expect(false).toBe(true);
      // });

      // it('should toggle the search overlay from open to closed state after the hotkey is issued', async () => {
      //   // TODO:
      //   expect(false).toBe(true);
      // });
      // it('should not have any highlighted matches after closing the overlay', async () => {
      //   // TODO:
      //   expect(false).toBe(true);
      // });

      afterAll(async () => {
        await cleanupBrowsers();
      });
    });

    describe('Overlay Toggle and State Tests', () => {
      beforeAll(async () => {
        ({ browser, page } = await launchBrowser());
      });

      it('should toggle the search overlay from closed to open state after the hotkey is issued', async () => {
        // TODO:
        expect(false).toBe(true);
      });

      it('should restore the same highlighted matches and current position after reopening the overlay', async () => {
        // TODO:
        expect(false).toBe(true);
      });
      it('should toggle the search overlay from open to closed state after the Escape key is issued', async () => {
        // TODO:
        expect(false).toBe(true);
      });

      // TODO: Add some additional edge cases
      // 'should not navigate to next match when next button is clicked without a search query'
      // 'should not navigate to previous match when previous button is clicked without a search query'
    });

    afterAll(async () => {
      await cleanupBrowsers();
    });
  });

  // describe('Multi-tab Search Tests', () => {
  //   // TODO:
  //   expect(false).toBe(true);
  // });
});
