<div align="center">
  <a href="https://ctrl-f.plus" target="_blank" rel="noreferrer noopener"><img src="static/icons/FINAL ICON.png" width="100px" alt="Ctrl-F Plus' Logo" /></a>

  <h1>Ctrl-F Plus</h1>

<!-- # Ctrl-F Plus -->



[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-%2348D0A8?style=for-the-badge)](https://makeapullrequest.com)
[![GitHub top language](https://img.shields.io/github/languages/top/ctrl-f-plus/ctrl-f-plus-chrome-extension?color=%2348D0A8&style=for-the-badge)](https://github.com/ctrl-f-plus/ctrl-f-plus-chrome-extension/tree/master)
[![GitHub](https://img.shields.io/github/license/ctrl-f-plus/ctrl-f-plus-chrome-extension?color=%2348D0A8&style=for-the-badge)](https://github.com/ctrl-f-plus/ctrl-f-plus-chrome-extension/blob/master/LICENSE)
[![Chrome Users](https://img.shields.io/chrome-web-store/users/dkfbnlclahcmcgehpancgfhogmilankf?color=%2348D0A8&style=for-the-badge&logo=google-chrome&logoColor=white&label=Chrome%20Users)](https://chrome.google.com/webstore/detail/ctrl-f-plus-ctrl-%2B-f-acro/dkfbnlclahcmcgehpancgfhogmilankf)


</div>

<div align="center">

<a href="https://ctrl-f.plus/" target="_blank" style="color: #128da1;" target="_blank" rel="noreferrer noopener">Website</a> |
<a href="#installation" style="color: #128da1;">Installation</a> |
<a href="#contributing" style="color: #128da1;">Contributing</a> |
<a href="#other-links" style="color: #128da1;">Other Links</a> |
<a href="#questions" style="color: #128da1;">Questions</a> |
<a href="#support" style="color: #128da1;">Support <span style="color: #05fdb4;">❤</span></a>


</div>

<!-- <div align="center">
  <p>Find words and phrases across **ALL** your open tabs! 🔍</p>
</div> -->

<p align="center">
  <img src="assets/ctrl-f-resized-gif.gif" alt="Demo GIF">
</p>

## About

Ctrl-F Plus is an open source browser extension that enables cross-tab search functionality in a browser window by extending the browser's native Ctrl + F Find Feature (Cmd + F on Mac). Now you can find a specific word or phrase on any of your browser tabs without having to search each tab separately.

Ctrl-F Plus is currently supported by Google Chrome, Brave, Microsoft Edge, Opera, Vivaldi.

### Tech Stack

- React
- Typescript
- Tailwind

## Installation

  <!-- ℹ️ Don't forget to disable the extension installed from the Web Store while you're testing manually installed version. -->

### Chrome, Microsoft Edge, etc.

1. Download the most recent prebuilt zip file from [build-master.zip](archive/build-master.zip).
2. Unzip the file.
3. Open `chrome://extensions` in Chrome / `edge://extensions` in Microsoft Edge.
4. Enable developer mode (top right corner).
5. Click on `Load unpacked` and select the `dist` folder from within the unzipped build folder.
6. Hit `Ctrl+Shift+F` on your keyboard or click the extension icon to start using!

:warning: If the keyboard command does not work see [setting keyboard shortcut](.github/keyboard-shortcut-setup.md) for additional instructions.

### Build From Source

1. `pnpm i` to install dependencies
2. `pnpm start` to start running the fast development mode Webpack build process that bundle files into the `dist` folder

### Production Build

1. `pnpm run build` to generate a minimized production build in the `dist` folder

## Contributing

We're thrilled to have you contribute to Ctrl-F Plus! Whether you're looking to fix bugs, add new features, or improve our documentation, your efforts are greatly appreciated. Please see our [contributing guidelines](https://github.com/ctrl-f-plus/ctrl-f-plus-chrome-extension/blob/master/.github/CONTRIBUTING.md) for a detailed guide on how to get started. Remember, by participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Other Links

- [Security Reporting Guidelines](SECURITY.md) <!--To report a security issue, please follow our -->
- [Privacy Policy](Privacy.md)

## Questions

[support@ctrl-f.plus](support@ctrl-f.plus)

## Support

Any [donations](https://opencollective.com/ctrl-f-plus-chrome-extension) are highly appreciated. <3

Here are the other ways to support/cheer this project:

- Starring this repo.
  <!-- - Joining us on [Discord](). -->
  <!-- - Following @<username> on [Mastodon](https://mastodon.social/@<username>), [Twitter](https://twitter.com/<username>) and [GitHub](https://github.com/d<username>). -->
- Referring Ctrl-F Plus to a friend.

If you did any of the above, danke schön :pray:
