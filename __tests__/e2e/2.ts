it('should navigate to the previous match and update the match count when the previous button is clicked', async () => {
  const previousButtonSelector = '#cntrl-f-extension #cfp-previous-match-btn';
  await page.waitForSelector(previousButtonSelector);

  initialIndex = await page.evaluate(() => {
    const nodeList = document.querySelectorAll('.ctrl-f-highlight');
    const elements = Array.from(nodeList);
    return elements.findIndex((el) =>
      el.classList.contains('ctrl-f-highlight-focus')
    );
  });

  await page.click(previousButtonSelector);
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

  expect(finalIndex).toBe(initialIndex - 1);
});

it('should navigate to the last match and update the match count when the previous button is clicked on the first match', async () => {
  const previousButtonSelector = '#cntrl-f-extension #cfp-previous-match-btn';
  await page.waitForSelector(previousButtonSelector);

  const matchingCountsSelector =
    '#cntrl-f-extension .form-div .matching-counts-wrapper .matching-counts';
  await page.waitForSelector(matchingCountsSelector);
  let matchingCounts = await page.$eval(
    matchingCountsSelector,
    (el: Element) => (el as HTMLElement).innerText
  );
  let currentMatchCount = matchingCounts.split('/')[0];

  while (currentMatchCount !== '1') {
    await page.click(previousButtonSelector);
    await page.waitForTimeout(1000);

    matchingCounts = await page.$eval(
      matchingCountsSelector,
      (el: Element) => (el as HTMLElement).innerText
    );
    currentMatchCount = matchingCounts.split('/')[0];
  }

  await page.click(previousButtonSelector);
  await page.waitForTimeout(1000);

  matchingCounts = await page.$eval(
    matchingCountsSelector,
    (el: Element) => (el as HTMLElement).innerText
  );

  let totalMatchCount = matchingCounts.split('/')[1];
  expect(matchingCounts).toEqual(`${totalMatchCount}/${totalMatchCount}`); // FIXME: This should be dynamic

  let finalIndex = await page.evaluate(() => {
    const nodeList = document.querySelectorAll('.ctrl-f-highlight');
    const elements = Array.from(nodeList);
    return elements.findIndex((el) =>
      el.classList.contains('ctrl-f-highlight-focus')
    );
  });

  expect(finalIndex).toBe(parseInt(totalMatchCount) - 1);
});
