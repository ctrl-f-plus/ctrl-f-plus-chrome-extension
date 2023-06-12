// __tests__/e2e/multiTabSearch.e2e.test.ts.ts

import { Browser, Page } from 'puppeteer';
import { cleanupBrowsers, launchBrowser } from './testSetup';
const EXTENSION_PATH = 'dist/';
const NUMBER_OF_TABS: number = 2;

describe('Ctrl-F Plus Chrome Extension E2E tests', () => {
  describe('Multi-tab Search Tests', () => {
    let browser: Browser;
    let pages: Page[];
    let page1: Page;
    let page2: Page;

    describe('Highlight and Navigation Tests', () => {
      describe('When Matches DO NOT Exist On Any Tabs (Tab1 or Tab2)', () => {
        beforeAll(async () => {
          ({ browser, pages } = await launchBrowser(NUMBER_OF_TABS));
          page1 = pages[0];
          page2 = pages[0];
        });

        afterAll(async () => {
          await cleanupBrowsers();
        });

        test.todo('should NOT change the active tab');
        test.todo('should NOT highlight any matches');
      });

      describe('When Matches Exist On One Out Of Two Tabs', () => {
        describe('When Matches Exist On Tab1 And DO NOT Exist On Tab2', () => {
          beforeAll(async () => {
            ({ browser, pages } = await launchBrowser(NUMBER_OF_TABS));
            page1 = pages[0];
            page2 = pages[0];
          });

          afterAll(async () => {
            await cleanupBrowsers();
          });

          test.todo('should NOT change the active tab');
          test.todo('should highlight matches on Tab1');
          test.todo('should NOT highlight any matches on Tab2');

          describe(
            'Single Tab Navigation with Next Button',
            singleTabNavigationWithNextButtonTests
          );

          describe(
            'Single Tab Navigation with Enter Key',
            singleTabNavigationWithEnterKeyTests
          );

          describe(
            'Single Tab Navigation with Previous Button',
            singleTabNavigationWithPreviousButtonTests
          );
        });

        describe('When Matches Exist On Tab2 And DO NOT Exist On Tab1', () => {
          beforeAll(async () => {
            ({ browser, pages } = await launchBrowser(NUMBER_OF_TABS));
            page1 = pages[0];
            page2 = pages[0];
          });

          afterAll(async () => {
            await cleanupBrowsers();
          });

          test.todo(
            'should change the active tab to the next tab that has a match'
          );
          test.todo('should highlight matches in the newly active tab');
          test.todo(
            'should NOT highlight matches in the originally active tab'
          );

          describe(
            'Single Tab Navigation with Next Button',
            singleTabNavigationWithNextButtonTests
          );

          describe(
            'Single Tab Navigation with Enter Key',
            singleTabNavigationWithEnterKeyTests
          );

          describe(
            'Single Tab Navigation with Previous Button',
            singleTabNavigationWithPreviousButtonTests
          );
        });
      });

      let initialIndex;
      describe('When Matches Exist On Two Out Of Two Tabs', () => {
        beforeAll(async () => {
          ({ browser, pages } = await launchBrowser(NUMBER_OF_TABS));
          page1 = pages[0];
          page2 = pages[0];
        });

        afterAll(async () => {
          await cleanupBrowsers();
        });

        test.todo('should highlight matches on Tab1 and Tab2');

        describe(
          'Multi Tab Navigation with Next Button',
          multiTabNavigationWithNextButtonTests
        );

        describe(
          'multi Tab Navigation with Enter Key',
          multiTabNavigationWithEnterKeyTests
        );

        describe(
          'Navigation with Previous Button',
          multiTabNavigationWithPreviousButtonTests
        );
      });
    });
  });
});

function singleTabNavigationWithNextButtonTests() {
  it('should navigate to the next match and update the match count when the next button is clicked', async () => {});

  it('should navigate back to the first match on Tab 2 and update the match count when next button is clicked on the last match', async () => {});
}

function singleTabNavigationWithEnterKeyTests() {
  it('should navigate to the next match and update the match count when the enter key is pressed', async () => {});

  it('should navigate back to the first match and update the match count when the enter key is pressed on the last match', async () => {});
}

function singleTabNavigationWithPreviousButtonTests() {
  it('should navigate to the last match and update the match count when the previous button is clicked on the first match', async () => {});

  it('should navigate to the previous match and update the match count when the previous button is clicked', async () => {});
}

function multiTabNavigationWithNextButtonTests() {
  it('should navigate to the next match and update the match count when the next button is clicked', async () => {});

  it('should navigate to the first match on Tab 2 and update the match count when the next button is clicked on the last match', async () => {});

  it('should navigate back to the first match on Tab1 and update the match count when next button is clicked on the last match of Tab2', async () => {});
}

function multiTabNavigationWithEnterKeyTests() {
  it('should navigate to the next match and update the match count when the enter key is pressed', async () => {});
  it('should navigate to the first match on Tab 2 and update the match count when the enter key is pressed on the last match', async () => {});
  it('should navigate back to the first match on Tab1 and update the match count when Enter Key is pressed on the last match of Tab2', async () => {});
}

function multiTabNavigationWithPreviousButtonTests() {
  it('should navigate to the last match and update the match count when the previous button is clicked on the first match', async () => {});

  // FIXME: review use of `(Tab 2)`
  it('should navigate to the first match on the previous tab (Tab 2) and update the match count when the previous button is clicked on the first match', async () => {});

  it('should navigate to the last match on Tab2 and update the match count when previous button is clicked on the first match of Tab1', async () => {});
}

function getActiveTab(pages: Page[]) {
  const visiblePages = pages.filter(async (p) => {
    const state = await p.evaluate(() => document.visibilityState);
    return state === 'visible';
  });

  return visiblePages[0];
}

async function getActiveTabIndex(pages: Page[]) {
  for (let i = 0; i < pages.length; i++) {
    const state = await pages[i].evaluate(() => document.visibilityState);
    if (state === 'visible') {
      return i;
    }
  }

  return -1;
}
