/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
// __tests__/e2e/e2e.test.ts

import puppeteer, { Browser, Page } from 'puppeteer';
import { setupTest } from './testSetup';
import {
  countHighlightedMatches,
  countQueryMatches,
  getActiveTab,
  getActiveTabIndex,
  getInnerTextFromSelector,
  navigateMatchesWithEnterKey,
  navigateMatchesWithNextButton,
  navigateMatchesWithPreviousButton,
  navigationTest,
  submitSearchForm,
  typeInSearch,
  validateSearchInput,
} from './helpers';
// import { getInputValueFromSelector } from './helper';
const EXTENSION_PATH = 'dist/';
// const GOOD_SEARCH_QUERY = 'chavez';
const GOOD_SEARCH_QUERY = 'ben';
const BAD_SEARCH_QUERY = 'falseSearchQuery';
// const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
// const TIMEOUT = SLOW_MO ? 10000 : 5000;
const INPUT_SELECTOR = '#ctrl-f-plus-extension .form-div .input-style';
const MATCHING_COUNTS_SELECTOR =
  '#ctrl-f-plus-extension .form-div .matching-counts-wrapper .matching-counts';
// const NUMBER_OF_TABS = 1;
const NEXT_BUTTON_SELECTOR = '#ctrl-f-plus-extension #next-match-btn';
const PREVIOUS_BUTTON_SELECTOR = '#ctrl-f-plus-extension #previous-match-btn';

// TODO: NEED TO ADD ACTUAL URLs. May need to add them to the tabScenarios' objects

const TEST_URLS_YES = ['https://benjamin-chavez.com'];

const TEST_URLS_NO_YES = [
  'https://www.google.com',

  'https://benjamin-chavez.com',
];

const TEST_URLS_YES_NO_YES = [
  'https://benjamin-chavez.com',
  'https://www.google.com',
  'https://github.com/bmchavez',
];

const TEST_URLS_YES_YES_YES = [
  'https://benjamin-chavez.com',

  'https://benjamin-chavez.com',

  'https://benjamin-chavez.com',
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
  'https://github.com/bmchavez',
  'https://www.google.com',
  'https://www.google.com',

  'https://benjamin-chavez.com',
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
    const browserArray: Browser[] = [];
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
        const { testUrls } = scenario;
        browserArray.push(browser);
        pages = await browser.pages();
        page = pages[0];
        await page.goto(testUrls[0]);

        for (let i = 1; i < scenario.tabCount; i += 1) {
          const newPage = await browser.newPage();
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
          const matchingCounts = await getInnerTextFromSelector(
            page,
            MATCHING_COUNTS_SELECTOR
          );

          totalMatchesCount = parseInt(matchingCounts.split('/')[1], 10);

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
