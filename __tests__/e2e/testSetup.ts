// __tests__/e2e/testSetup.ts

import puppeteer, { Browser, Page } from 'puppeteer';
const EXTENSION_PATH = 'dist/';
const EXTENSION_ID = 'lpbjbjlijokjnkfojhegklacjjdejdjk';
const TEST_URL = 'https://benjamin-chavez.com';
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
const TIMEOUT = SLOW_MO ? 10000 : 5000;

let browserArray: any = [];
let pages: Page[];

export async function launchBrowser(numberOfTabs: number) {
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
  pages = await browser.pages();
  await pages[0].goto(TEST_URL);
  await pages[0].bringToFront();
  if (numberOfTabs > 1) {
    const newPage = await browser.newPage();
    await newPage.goto(`https://github.com/bmchavez`);
    pages.push(newPage);
  }

  return { browser, pages };
}

export async function cleanupBrowsers() {
  try {
    await Promise.all(
      browserArray.map(async (browser: Browser) => {
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
}
