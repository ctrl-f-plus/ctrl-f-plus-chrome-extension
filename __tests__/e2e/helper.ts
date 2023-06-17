// __tests__/e2e/helper.ts

import { Browser, Page } from 'puppeteer';
import { cleanupBrowsers, launchBrowser } from './testSetup';
// const GOOD_SEARCH_QUERY = 'ben';
export const BAD_SEARCH_QUERY = 'falseSearchQuery';
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
const TIMEOUT = SLOW_MO ? 10000 : 5000;
const INPUT_SELECTOR = '#cntrl-f-extension .form-div .input-style';
const MATCHING_COUNTS_SELECTOR =
  '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';
const NEXT_BUTTON_SELECTOR = '#cntrl-f-extension #next-match-btn';
const PREVIOUS_BUTTON_SELECTOR = '#cntrl-f-extension #previous-match-btn';

export function parseMatchingCounts(matchingCounts: string) {
  const [currentMatchIndex, totalMatchesCount] = matchingCounts
    .split('/')
    .map(Number);
  return { currentMatchIndex, totalMatchesCount };
}

export async function navigateMatchesWithNextButton(page: Page) {
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

export async function getHighlightFocusMatchIndex(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const nodeList = document.querySelectorAll('.ctrl-f-highlight');
    const elements = Array.from(nodeList);
    return elements.findIndex((el) =>
      el.classList.contains('ctrl-f-highlight-focus')
    );
  });
}

export async function getInputValueFromSelector(
  page: Page,
  selector: string = INPUT_SELECTOR
) {
  return await page.$eval(selector, (el) => (el as HTMLInputElement).value);
}

export async function getInnerTextFromSelector(
  page: Page,
  selector: string = MATCHING_COUNTS_SELECTOR
) {
  return await page.$eval(selector, (el) => (el as HTMLElement).innerText);
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

export // async function waitForCondition(page, condition, timeout = 30000) {
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
// export function verifyAllMatchesAreHighlighted(
//   highlightCount: number,
//   searchQueryCount: number
// ) {
//   it('should have matching counts for highlighted matches and search query matches', () => {
//     expect(highlightCount).toBe(searchQueryCount);
//   });
// }

export function getActiveTab(pages: Page[]) {
  const visiblePages = pages.filter(async (p) => {
    const state = await p.evaluate(() => document.visibilityState);
    return state === 'visible';
  });

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
