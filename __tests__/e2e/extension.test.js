// __tests__/e2e/extension.test.js

import puppeteer from 'puppeteer';
const EXTENSION_PATH = 'dist/';
const EXTENSION_ID = 'lpbjbjlijokjnkfojhegklacjjdejdjk';
const TEST_URL = 'https://benjamin-chavez.com';
const GOOD_SEARCH_QUERY = 'ben';
const BAD_SEARCH_QUERY = 'falseSearchQuery';
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
const TIMEOUT = SLOW_MO ? 10000 : 5000;

let browserArray = [];
let page;
describe('Ctrl-F Plus Chrome Extension E2E tests', () => {
  describe('Single-tab Search Tests', () => {
    describe('Initial State and Toggle Tests', () => {
      beforeAll(async () => {
        const browser = await puppeteer.launch({
          headless: false,
          devtools: true,
          slowMo: SLOW_MO,
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
          ],
        });
        browserArray.push(browser);
        [page] = await browser.pages();
        await page.goto(TEST_URL);
        await page.bringToFront();
      });

      it('should not display the search overlay on startup', async () => {
        const layoverElement = await page.evaluate(() =>
          document.querySelector('#cntrl-f-extension')
        );
        expect(layoverElement).toBeNull();
      });

      it('should toggle the search overlay from closed to open state after the hotkey is issued', async () => {
        const extensionUrl = `chrome-extension://${EXTENSION_ID}/_generated_background_page.html`;
        const backgroundPage = await browser.newPage();
        await backgroundPage.goto(extensionUrl);
        await page.bringToFront();

        await backgroundPage.evaluate(() => {
          toggleLayover();
        });

        await page.waitForSelector('#cntrl-f-extension');

        const layoverElement = await page.evaluate(() =>
          document.querySelector('#cntrl-f-extension')
        );
        expect(layoverElement).not.toBeNull();
      });

      afterAll(async () => {
        console.log('clean up');
        try {
          await Promise.all(
            browserArray.map(async (browser) => {
              try {
                const closeBrowser = await browser.close();
              } catch (error) {
                // no-op
              }
            })
          );
        } catch (error) {
          // no-op
        }
      });
    });

    describe.only('Highlight and Navigation Tests', () => {
      // beforeAll(async () => {
      beforeEach(async () => {
        const browser = await puppeteer.launch({
          headless: false,
          devtools: true,
          slowMo: SLOW_MO,
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
          ],
        });
        browserArray.push(browser);
        [page] = await browser.pages();
        await page.goto(TEST_URL);
        await page.bringToFront();
      });

      afterEach(async () => {
        console.log('clean up');
        try {
          await Promise.all(
            browserArray.map(async (browser) => {
              try {
                const closeBrowser = await browser.close();
              } catch (error) {
                // no-op
              }
            })
          );
        } catch (error) {
          // no-op
        }
      });

      // TODO: This test could be in its own describe block
      it('should not highlight any matches if the search query does not exist on the page', async () => {
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
          (el) => el.innerText
        );
        console.log(matchingCounts);
        expect(matchingCounts).toEqual('0/0');
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

        // console.log(bodyContent);

        const highlightRegex = new RegExp(
          `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${GOOD_SEARCH_QUERY}<\/span>`,
          'gi'
        );
        // await page.waitForTimeout(5000);
        // const GOOD_SEARCH_QUERY = 'ben';
        const searchQueryRegex = new RegExp(`${GOOD_SEARCH_QUERY}`, 'gi');
        // const benRegex = /\bben\b/g;

        const highlightCount = (content.match(highlightRegex) || []).length;
        const searchQueryCount = (bodyContent.match(searchQueryRegex) || [])
          .length;

        console.log(`hlr`, content.match(highlightRegex));
        console.log('sqr', bodyContent.match(searchQueryRegex));

        console.log(highlightCount);
        console.log('searchQueryCount: ', searchQueryCount);
        expect(highlightCount).toBe(searchQueryCount);
      });

      // it('should navigate to the next match and update the match count when the next button is clicked', async () => {
      //   // TODO:
      //   expect(false).toBe(true);
      // });
      // it('should navigate back to the first match and update the match count when next button is clicked on the last match', async () => {
      //   // TODO:
      //   expect(false).toBe(true);
      // });
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

      // afterAll(async () => {
      //   console.log('clean up');
      //   try {
      //     await Promise.all(
      //       browserArray.map(async (browser) => {
      //         try {
      //           const closeBrowser = await browser.close();
      //         } catch (error) {
      //           // no-op
      //         }
      //       })
      //     );
      //   } catch (error) {
      //     // no-op
      //   }
      // });
    });

    describe('Overlay Toggle and State Tests', () => {
      beforeAll(async () => {
        const browser = await puppeteer.launch({
          headless: false,
          devtools: true,
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
          ],
        });
        browserArray.push(browser);
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
      console.log('clean up');
      try {
        await Promise.all(
          browserArray.map(async (browser) => {
            try {
              const closeBrowser = await browser.close();
            } catch (error) {
              // no-op
            }
          })
        );
      } catch (error) {
        // no-op
      }
    });
  });

  // describe('Multi-tab Search Tests', () => {
  //   // TODO:
  //   expect(false).toBe(true);
  // });
});

// 'should not display the search overlay on startup'
// 'should toggle the search overlay from closed to open state after the hotkey is issued'
// 'should not display the search overlay when the hotkey is issued twice'
// 'should not display the search overlay when the escape key is issued'
// 'should display the search overlay when the hotkey is issued three times'
// 'should not display the search overlay after being closed'

// Tests the initial state of the search overlay
//  - overlay should not be visible on startup
//  - should be visible after being issued the `ctrl-shift-f` keyboard command
//  - should not have an input value
//  - count value should be `0/0`
//  - next button should be disabled
//  - previous button should be disabled
//  - close button should close the overlay

// Tests open/close functionality of the overlay
//  - overlay should not be visible on startup
//  - overlay should be visible after being issued the `ctrl-shift-f` keyboard command once
//  - overlay should NOT be visible after being issued the `ctrl-shift-f` keyboard command twice
//  - overlay should be visible after being issued the `ctrl-shift-f` keyboard command three times
//  - overlay should NOT be visible after being issued the `Escape` keyboard command
//  - closed overaly should open after being issued the `ctrl-shift-f` keyboard command three times

// Test next/prev buttons
//  - The next button should

// Should
