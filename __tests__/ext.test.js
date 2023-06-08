import puppeteer from 'puppeteer';
const EXTENSION_PATH = 'dist/';
const EXTENSION_ID = 'lpbjbjlijokjnkfojhegklacjjdejdjk';
const TEST_URL = 'https://benjamin-chavez.com';
const SEARCH_QUERY = 'ben';

let browserArray = [];
let page;
describe('Test Extension', () => {
  // beforeEach(async () => {
  //   const browser = await puppeteer.launch({
  //     headless: false,
  //     devtools: true,
  //     args: [
  //       `--disable-extensions-except=${EXTENSION_PATH}`,
  //       `--load-extension=${EXTENSION_PATH}`,
  //     ],
  //   });

  //   browserArray.push(browser);
  // });

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

  it('should successfully inject the extension into the page', async () => {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });

    browserArray.push(browser);
    [page] = await browser.pages();

    await page.goto(TEST_URL);
    await page.bringToFront();
    await page.waitForSelector('#cntrl-f-extension');

    const injectedElement = await page.$('#cntrl-f-extension');
    expect(injectedElement).not.toBeNull();
  });

  it('should allow the user to type in the search field', async () => {
    const inputSelector = '#cntrl-f-extension .form-div .input-style';
    await page.waitForSelector(inputSelector);
    await page.type(inputSelector, SEARCH_QUERY);
    const inputText = await page.$eval(inputSelector, (el) => el.value);
    expect(inputText).toBe(SEARCH_QUERY);
  });

  it('should add the highlight classes to all matches ', async () => {
    const inputSelector = '#cntrl-f-extension .form-div .input-style';
    await page.waitForSelector(inputSelector);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const content = await page.content();

    const highlightRegex =
      /<span class="(ctrl-f-highlight|ctrl-f-highlight ctrl-f-highlight-focus)">ben<\/span>/gi;

    const benRegex = /\bben\b/g;

    const highlightCount = (content.match(highlightRegex) || []).length;
    const benCount = (content.match(benRegex) || []).length;

    console.log(highlightCount);
    console.log('benCount: ', benCount);
    expect(highlightCount).toBe(benCount);
  });
});
