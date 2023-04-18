export function htmlToOuterHtml(matchesObj, tabId) {
  const matchesArray = matchesObj[tabId];

  const matchesObjOuterHtml = matchesArray
    ? matchesArray.map((el) => el.outerHTML)
    : [];

  return matchesObjOuterHtml;
}

export function outerHtmlToHtml(matchesObjOuterHtml) {
  const matchesObjElements: HTMLElement[] = matchesObjOuterHtml.map((el) => {
    let wrapper = document.createElement('div');
    wrapper.innerHTML = el;
    return wrapper.firstChild as HTMLElement;
  });

  return matchesObjElements;
}
