# [dpixa](https://github.com/pixagram-blockchain/dpixa)

Robust pixa client library that runs in both node.js and the browser.

Needs test net urls, chain id

---

**note** As of version 0.7.0 WebSocket support has been removed. The only transport provided now is HTTP(2). For most users the only change required is to swap `wss://` to `https://` in the address. If you run your own full node make sure to set the proper [CORS headers](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) if you plan to access it from a browser.

---

## Browser compatibility

[![Build Status](https://saucelabs.com/browser-matrix/feruzm-dpixa.svg)](https://saucelabs.com/open_sauce/user/feruzm-dpixa)

## Installation

### Via npm

For node.js or the browser with [browserify](https://github.com/substack/node-browserify) or [webpack](https://github.com/webpack/webpack).

```
npm install @pixagram/dpixa
```

## Full Documentation

See our [wiki](https://github.com/pixagram-blockchain/dpixa/wiki/@pixagram-dpixa) on Github

## Bundling

The easiest way to bundle dpixa (with browserify, webpack etc.) is to just `npm install @pixagram/dpixa` and `require('@pixagram/dpixa')` which will give you well-tested (see browser compatibility matrix above) pre-bundled code guaranteed to JustWork™. However, that is not always desirable since it will not allow your bundler to de-duplicate any shared dependencies dpixa and your app might have.

To allow for deduplication you can `require('@pixagram/dpixa/lib/index-browser')`, or if you plan to provide your own polyfills: `require('@pixagram/dpixa/lib/index')`. See `src/index-browser.ts` for a list of polyfills expected.

---

_Share and Enjoy!_