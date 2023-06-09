// __tests__/e2e/testSetup.ts

import puppeteer from 'puppeteer';
const EXTENSION_PATH = 'dist/';
const EXTENSION_ID = 'lpbjbjlijokjnkfojhegklacjjdejdjk';
const TEST_URL = 'https://benjamin-chavez.com';
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;
const TIMEOUT = SLOW_MO ? 10000 : 5000;

let browserArray: any = [];
let page;

export async function launchBrowser() {
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

  return { browser, page };
}

export async function cleanupBrowsers() {
  // console.log('clean up');
  try {
    await Promise.all(
      browserArray.map(async (browser: any) => {
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
