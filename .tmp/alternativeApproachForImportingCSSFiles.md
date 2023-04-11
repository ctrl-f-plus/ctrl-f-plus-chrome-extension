### Using Webpack file-loader to directly import the CSS content as a text string.

1) install the file-loader:

```bash
npm install --save-dev file-loader
```

2) add a rule for loading .css files in the webpack.common.js:

```js
// webpack.common.js

module.exports = {
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.css$/i,
        use: 'file-loader',
        include: [path.resolve(__dirname, 'src/contentScripts')],
      },
      // ...
    ],
  },
  // ...
};
```

3) Update the getInnerHtmlScript.ts file to import the CSS content as a text string using the file-loader:
```ts
// ./src/contentScripts/getInnerHtmlScript.ts
import contentStyles from './contentStyles.css';

function injectStyles(css) {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

injectStyles(contentStyles);

// Rest of code...
```

4) Remove the reference to contentScripts/contentStyles.js from the manifest.json file, as it's not needed anymore:
```json
{
  // ...
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["contentScript.js", "getInnerHtmlScript.js"],
      "run_at": "document_idle"
    }
  ],
  // ...
}

```

### Pros/Cons
1) Using file-loader to import CSS as a text string:

Pros:
 - CSS is bundled within the JavaScript, avoiding the need for a separate request.
 - Webpack handles the file import, and the build process is more streamlined.

Cons:
 - The CSS content is embedded within the JavaScript, increasing the JavaScript file size.

2) Using a separate JavaScript file (contentStyles.ts) to store the CSS string:

Pros:
 - The CSS content is separated from the content script logic, making it slightly easier to maintain.

Cons:
 = An additional JavaScript file (contentStyles.js) needs to be loaded for content scripts, which means an extra request and might increase the loading time.
