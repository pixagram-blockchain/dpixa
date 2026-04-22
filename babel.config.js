/**
 * Babel root config.
 *
 * This file MUST be named `babel.config.js` (not `.babelrc` or `.babelrc.json`)
 * — Babel only treats `babel.config.*` as a "root" config that applies to files
 * outside the project directory, including dependencies in `node_modules`.
 * `.babelrc` files are path-relative and Babel deliberately skips them for
 * node_modules, which isn't what we want.
 *
 * The Makefile's bundle rule runs babelify with `--global` so that dependencies
 * are transpiled too. This is required because:
 *
 *   - @noble/hashes@2 and @noble/secp256k1@3 are ESM-only, and they also use
 *     ES2021 syntax like `||=` (logical-nullish-OR-assignment).
 *   - Browserify 16 ships with acorn@7.x in its module-deps dependency, which
 *     cannot parse ES2021 syntax. Even after esmify handles `import`/`export`,
 *     the browserify dependency walker chokes on `||=` at `node_modules/
 *     @noble/hashes/hmac.js:72:9`.
 *   - Downleveling to the target below strips `||=`, `??=`, and `?.` so that
 *     browserify's acorn@7 can walk the AST successfully.
 *
 * The target set here (Chrome 80 / Firefox 78 / Safari 13, all early 2020) is
 * the most aggressive (= least transpilation) that still predates `||=`, which
 * landed in Chrome 85 / Firefox 79 / Safari 14 in mid-2020. Using a looser
 * target (e.g. `defaults`) would work but would also downlevel async/await
 * and other ES2017+ syntax unnecessarily, bloating the bundle.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { chrome: '80', firefox: '78', safari: '13' }
    }]
  ]
};
