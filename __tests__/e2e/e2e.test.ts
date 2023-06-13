// Import puppeteer
import puppeteer, { Browser, Page } from 'puppeteer';
const EXTENSION_PATH = 'dist/';

describe('Tab Navigation Extension', () => {
  let browser: Browser;
  let page: Page;

  const tabScenarios = [
    'Single Tab: Basic Match Navigation',
    'Two Tabs: Tab Switching and Skipping',
    'Three Tabs: Multiple Tab Switching and Skipping',
    'Three Tabs: All Tabs with Matches',
    'Three Tabs: No Matches in Any Tab',
    'Eight Tabs: Mixed Matches',
  ];

  // Dynamically generate a describe block for each tab scenario
  tabScenarios.forEach((scenario) => {
    describe(scenario, () => {
      beforeAll(async () => {
        browser = await puppeteer.launch({
          headless: false,
          devtools: true,
          slowMo: 0,
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
          ],
        });
      });

      afterAll(async () => {
        await browser.close();
      });

      describe('Match Highlighting', () => {
        test('Extension finds and highlights correct number of matches', async () => {
          // Test code here...
        });
      });

      describe('Navigation Methods', () => {
        // Helper function
        async function checkMatchIndexAccuracy(currentIndex, expectedIndex) {
          //  TODO:
          // const matchIndex = await page.evaluate(() => currentIndex);
          // expect(matchIndex).toBe(expectedIndex);
        }

        test('Navigation works correctly with nextButton', async () => {
          // Test code here...
          for (let i = 0; i < totalMatches; i++) {
            // Trigger 'nextButton' navigation...
            await checkMatchIndexAccuracy(currentIndex, expectedIndex);
          }
        });

        test('Navigation works correctly with previousButton', async () => {
          // Test code here...
          for (let i = totalMatches - 1; i >= 0; i--) {
            // Trigger 'previousButton' navigation...
            await checkMatchIndexAccuracy(currentIndex, expectedIndex);
          }
        });

        test('Navigation works correctly with Enter key', async () => {
          // Test code here...
          for (let i = 0; i < totalMatches; i++) {
            // Trigger 'Enter' key navigation...
            await checkMatchIndexAccuracy(currentIndex, expectedIndex);
          }
        });
      });

      describe('Count Display', () => {
        test('Total Matches Count is accurate', async () => {
          // Test code here...
        });
      });
    });
  });
});
