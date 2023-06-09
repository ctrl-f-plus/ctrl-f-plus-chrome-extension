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

    describe('Highlight and Navigation Tests', () => {
      describe('When Matches DO NOT Exist', () => {
        beforeAll(async () => {
          ({ browser, page } = await launchBrowser());
        });

        // TODO: This test could be in its own describe block
        it('should NOT highlight any matches if the search query does not exist on the page', async () => {
          const inputSelector = '#cntrl-f-extension .form-div .input-style';
          await page.waitForSelector(inputSelector);
          await page.type(inputSelector, BAD_SEARCH_QUERY);
          const inputText = await page.$eval(
            inputSelector,
            (el) => (el as HTMLInputElement).value
          );
          expect(inputText).toBe(BAD_SEARCH_QUERY);

          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);

          const content = await page.content();

          const highlightRegex = new RegExp(
            `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${BAD_SEARCH_QUERY}<\/span>`,
            'gi'
          );

          const highlightCount = (content.match(highlightRegex) || []).length;

          expect(highlightCount).toBe(0);

          const matchingCountsSelector =
            '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';
          await page.waitForSelector(matchingCountsSelector);
          const matchingCounts = await page.$eval(
            matchingCountsSelector,
            (el: Element) => (el as HTMLElement).innerText
          );

          expect(matchingCounts).toEqual('0/0');
        });

        afterAll(async () => {
          await cleanupBrowsers();
        });
      });

      let initialIndex;
      describe('When Matches Exist', () => {
        // it('should correctly highlight matches in the tab when a query is entered', async () => {
        //   const inputSelector = '#cntrl-f-extension .form-div .input-style';
        //   await page.waitForSelector(inputSelector);
        //   await page.type(inputSelector, GOOD_SEARCH_QUERY);
        //   const inputText = await page.$eval(inputSelector, (el) => el.value);
        //   expect(inputText).toBe(GOOD_SEARCH_QUERY);

        //   await page.keyboard.press('Enter');
        //   await page.waitForTimeout(1000);

        //   const content = await page.content();
        //   const bodyContent = await page.evaluate(
        //     () => document.body.innerText
        //   );

        //   const highlightRegex = new RegExp(
        //     `<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">${GOOD_SEARCH_QUERY}<\/span>`,
        //     'gi'
        //   );

        //   const searchQueryRegex = new RegExp(`${GOOD_SEARCH_QUERY}`, 'gi');

        //   const highlightCount = (content.match(highlightRegex) || []).length;
        //   const searchQueryCount = (bodyContent.match(searchQueryRegex) || [])
        //     .length;

        //   expect(highlightCount).toBe(searchQueryCount);
        // });

        describe('Navigation with Next Button', () => {
          beforeAll(async () => {
            ({ browser, page } = await launchBrowser());
            await highlightMatches(page, GOOD_SEARCH_QUERY);
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

          // TODO: REFACTOR
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

          afterAll(async () => {
            await cleanupBrowsers();
          });
        });

        describe('Navigation with Enter Key', () => {
          beforeAll(async () => {
            ({ browser, page } = await launchBrowser());
            await highlightMatches(page, GOOD_SEARCH_QUERY);
          });

          it('should navigate to the next match and update the match count when the enter key is pressed', async () => {
            const inputSelector = '#cntrl-f-extension .form-div .input-style';
            const matchingCountsSelector =
              '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';

            initialIndex = await page.evaluate(() => {
              const nodeList = document.querySelectorAll('.ctrl-f-highlight');
              const elements = Array.from(nodeList);
              return elements.findIndex((el) => {
                el.classList.contains('ctrl-f-highlight-focus');
              });
            });

            await page.focus(inputSelector);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);

            await page.waitForSelector(matchingCountsSelector);

            const matchingCounts = await page.$eval(
              matchingCountsSelector,
              (el: Element) => (el as HTMLElement).innerText
            );

            expect(matchingCounts).toEqual('2/3'); //FIXME: this should be dynamic

            let finalIndex = await page.evaluate(() => {
              const nodeList = document.querySelectorAll('.ctrl-f-highlight');
              const elements = Array.from(nodeList);
              return elements.findIndex((el) => {
                el.classList.contains('ctrl-f-highlight-focus');
              });
            });

            expect(finalIndex).toBe(initialIndex + 1);
          });

          it('should navigate back to the first match and update the match count when the enter key is pressed on the last match', async () => {
            const inputSelector = `#cntrl-f-extension .form-div .input-style`;
            await page.focus(inputSelector);

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
              await page.keyboard.press('Enter');
              await page.waitForTimeout(1000);

              matchingCounts = await page.$eval(
                matchingCountsSelector,
                (el: Element) => (el as HTMLElement).innerText
              );
              currentMatchCount = matchingCounts.split('/')[0];
              totalMatchCount = matchingCounts.split('/')[1];
            }

            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);

            matchingCounts = await page.$eval(
              matchingCountsSelector,
              (el: Element) => (el as HTMLElement).innerText
            );

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

          afterAll(async () => {
            await cleanupBrowsers();
          });
        });

        describe('Navigation with Previous Button', () => {
          beforeAll(async () => {
            ({ browser, page } = await launchBrowser());
            await highlightMatches(page, GOOD_SEARCH_QUERY);
          });

          // TODO: REFACTOR
          it('should navigate to the last match and update the match count when the previous button is clicked on the first match', async () => {
            const previousButtonSelector =
              '#cntrl-f-extension #cfp-previous-match-btn';
            const matchingCountsSelector =
              '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';

            await page.waitForSelector(previousButtonSelector);
            await page.waitForSelector(matchingCountsSelector);

            let matchingCounts = await page.$eval(
              matchingCountsSelector,
              (el: Element) => (el as HTMLElement).innerText
            );

            await page.click(previousButtonSelector);
            await page.waitForTimeout(1000);

            matchingCounts = await page.$eval(
              matchingCountsSelector,
              (el: Element) => (el as HTMLElement).innerText
            );

            // let currentMatchCount = matchingCounts.split('/')[0];
            // let totalMatchCount = matchingCounts.split('/')[1];

            expect(matchingCounts).toEqual('3/3'); // FIXME: This should be dynamic

            let finalIndex = await page.evaluate(() => {
              const nodeList = document.querySelectorAll('.ctrl-f-highlight');
              const elements = Array.from(nodeList);
              return elements.findIndex((el) =>
                el.classList.contains('ctrl-f-highlight-focus')
              );
            });

            expect(finalIndex).toBe(2);
          });

          // it('should navigate to the previous match and update the match count when the previous button is clicked', async () => {});

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
      });
    });

    afterAll(async () => {
      await cleanupBrowsers();
    });
  });

  // describe('Overlay Toggle and State Tests', () => {
  //   expect(false).toBe(true);

  //   // beforeAll(async () => {
  //   //   ({ browser, page } = await launchBrowser());
  //   // });

  //   // it('should toggle the search overlay from closed to open state after the hotkey is issued', async () => {
  //   //   // TODO:
  //   //   expect(false).toBe(true);
  //   // });

  //   // it('should restore the same highlighted matches and current position after reopening the overlay', async () => {
  //   //   // TODO:
  //   //   expect(false).toBe(true);
  //   // });
  //   // it('should toggle the search overlay from open to closed state after the Escape key is issued', async () => {
  //   //   // TODO:
  //   //   expect(false).toBe(true);
  //   // });

  //   // TODO: Add some additional edge cases
  //   // 'should not navigate to next match when next button is clicked without a search query'
  //   // 'should not navigate to previous match when previous button is clicked without a search query'
  // });

  // describe('Multi-tab Search Tests', () => {
  //   // TODO:
  //   expect(false).toBe(true);
  // });
});

async function highlightMatches(page: Page, query: string) {
  const inputSelector = '#cntrl-f-extension .form-div .input-style';
  await page.waitForSelector(inputSelector);
  await page.type(inputSelector, query);
  const inputText = await page.$eval(inputSelector, (el) => el.value);
  expect(inputText).toBe(query);

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
