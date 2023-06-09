it('should navigate to the previous match and update the match count when the previous button is clicked', async () => {
  const prevButtonSelector = '#cntrl-f-extension #cfp-prev-match-btn';
  await page.waitForSelector(prevButtonSelector);

  // Move to second highlight initially to test the previous button
  const nextButtonSelector = '#cntrl-f-extension #cfp-next-match-btn';
  await page.click(nextButtonSelector);
  await page.waitForTimeout(1000);

  initialIndex = await page.evaluate(() => {
    const nodeList = document.querySelectorAll('.ctrl-f-highlight');
    const elements = Array.from(nodeList);
    return elements.findIndex((el) =>
      el.classList.contains('ctrl-f-highlight-focus')
    );
  });

  await page.click(prevButtonSelector);
  await page.waitForTimeout(1000);

  const matchingCountsSelector =
    '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';
  await page.waitForSelector(matchingCountsSelector);
  const matchingCounts = await page.$eval(
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

  expect(finalIndex).toBe(initialIndex - 1);
});

it('should navigate to the last match and update the match count when the previous button is clicked on the first match', async () => {
  const prevButtonSelector = '#cntrl-f-extension #cfp-prev-match-btn';
  await page.waitForSelector(prevButtonSelector);

  const matchingCountsSelector =
    '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';
  await page.waitForSelector(matchingCountsSelector);
  let matchingCounts = await page.$eval(
    matchingCountsSelector,
    (el: Element) => (el as HTMLElement).innerText
  );
  let currentMatchCount = matchingCounts.split('/')[0];

  if (currentMatchCount !== '1') {
    throw new Error(
      'Test setup error: should be on the first match before executing this test'
    );
  }

  await page.click(prevButtonSelector);
  await page.waitForTimeout(1000);

  matchingCounts = await page.$eval(
    matchingCountsSelector,
    (el: Element) => (el as HTMLElement).innerText
  );

  expect(matchingCounts).toEqual('3/3'); // FIXME: This should be dynamic

  let finalIndex = await page.evaluate(() => {
    const nodeList = document.querySelectorAll('.ctrl-f-highlight');
    const elements = Array.from(nodeList);
    return elements.findIndex((el) =>
      el.classList.contains('ctrl-f-highlight-focus')
    );
  });

  expect(finalIndex).toBe(2); // 2 is the index of the last element in a 3-element array
});
