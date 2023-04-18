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

// function getXPathForElement(element) {
//   const parts = [];
//   for (
//     ;
//     element && element.nodeType === Node.ELEMENT_NODE;
//     element = element.parentNode
//   ) {
//     let part = element.nodeName.toLowerCase();
//     if (element.id) {
//       part += `[@id="${element.id}"]`;
//     } else {
//       const index =
//         Array.prototype.indexOf.call(element.parentNode.children, element) + 1;
//       part += `[${index}]`;
//     }
//     parts.unshift(part);
//   }
//   return parts.length ? '/' + parts.join('/') : null;
// }

// // Function to get an HTMLElement by its XPath
// function getElementByXPath(xpath) {
//   return document.evaluate(
//     xpath,
//     document,
//     null,
//     XPathResult.FIRST_ORDERED_NODE_TYPE,
//     null
//   ).singleNodeValue;
// }

// // Serialize the array of HTMLElements into an array of XPath expressions
// function serializeElements(elements) {
//   return elements.map(getXPathForElement);
// }

// // Deserialize the array of XPath expressions into an array of HTMLElements
// function deserializeElements(xpaths) {
//   return xpaths.map(getElementByXPath);
// }

// // Serialize the array of HTMLElements into an array of objects containing XPath expressions and classList
// function serializeElements(elements) {
//   return elements.map((element) => ({
//     xpath: getXPathForElement(element),
//     classList: Array.from(element.classList),
//   }));
// }

// // Deserialize the array of objects containing XPath expressions and classList into an array of HTMLElements
// function deserializeElements(serializedElements) {
//   return serializedElements.map((serializedElement) => {
//     const element = getElementByXPath(serializedElement.xpath);
//     if (element) {
//       serializedElement.classList.forEach((className) => {
//         element.classList.add(className);
//       });
//     }
//     return element;
//   });
// }

// // Example usage:

// const matchesObj = {
//   237543846: [
//     document.querySelector('a.navbar-brand.font-alt'),
//   ],
// };

// // Serialize the HTMLElements
// const serializedMatchesObj = {
//   237543846: serializeElements(matchesObj[237543846]),
// };

// // Update the classList of the first element in the matchesObj
// matchesObj[237543846][0].classList.add('ctrl-f-highlight', 'ctrl-f-highlight-focus');

// // Store the serialized data (e.g., using localStorage)
// localStorage.setItem('serializedMatchesObj', JSON.stringify(serializedMatchesObj));

// // Refresh the page...

// // Retrieve the stored data and deserialize it
// const storedSerializedMatchesObj = JSON.parse(localStorage.getItem('serializedMatchesObj'));
// const deserializedMatchesObj = {
//   237543846: deserializeElements(storedSerializedMatchesObj[237543846]),
// };

// console.log(deserializedMatchesObj);
