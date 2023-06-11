// __tests__/e2e/multiTabSearch.e2e.test.ts.ts

import { Browser, Page } from 'puppeteer';
import { cleanupBrowsers, launchBrowser } from './testSetup';
const EXTENSION_PATH = 'dist/';

describe('Ctrl-F Plus Chrome Extension E2E tests', () => {
  describe('Multi-tab Search Tests', () => {
    let browser: Browser;
    let page: Page;

    describe('Highlight and Navigation Tests', () => {
      describe('When Matches DO NOT Exist In Current Tab', () => {
        describe('When Matches DO NOT Exist In Any Other Tab', () => {
          test.todo('should NOT change the active tab');
          test.todo(
            'should NOT highlight any matches if the search query does not exist on the page'
          );
        });

        describe('When matches exist in the tab with index i+1', () => {
          test.todo(
            'should change the active tab to the next tab that has a match'
          );
          test.todo('should highlight matches in the newly active tab');
          test.todo(
            'should NOT highlight matches in the originally active tab'
          );
        });

        describe('When matches exist in the tab with index i+2', () => {
          test.todo(
            'should change the active tab to the next tab that has a match'
          );
          test.todo('should highlight matches in the newly active tab');
          test.todo(
            'should NOT highlight matches in the originally active tab (index-2)'
          );
          test.todo(
            'should NOT highlight matches in the previous tab (index-1)'
          );
        });
      });

      let initialIndex;
      describe('When Matches Exist In The Current Tab', () => {
        describe('Navigation with Next Button', () => {
          it('should navigate to the next match and update the match count when the next button is clicked', async () => {});
          it('should navigate to the first match on the next tab and update the match count when the next button is clicked on the last match', async () => {});
        });

        describe('Navigation with Enter Key', () => {
          it('should navigate to the next match and update the match count when the enter key is pressed', async () => {});
          it('should navigate to the first match on the next tab and update the match count when the enter key is pressed on the last match', async () => {});
        });

        describe('Navigation with Previous Button', () => {
          it('should navigate to the last match and update the match count when the previous button is clicked on the first match', async () => {});
          it('should navigate to the first match on the previous tab and update the match count when the previous button is clicked', async () => {});
        });
      });
    });
  });
});
