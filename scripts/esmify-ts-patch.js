/**
 * esmify-ts-patch.js
 *
 * Browserify plugin that runs `esmify` and then patches its replacement
 * resolver so TypeScript extensions resolve. This is needed because:
 *
 *   1. esmify installs its own `bundler._bresolve` that hardcodes the
 *      extension list `[ '.mjs', '.js' ]` (esmify/resolve.js, line 16).
 *      The list is baked in — there's no option to extend it.
 *
 *   2. With `tsify` alone this doesn't matter, because tsify transpiles
 *      .ts -> .js before browserify walks dependencies. But esmify takes
 *      over resolution first, so it rejects extensionless imports of .ts
 *      files like `export * from './index'` in index-browser.ts.
 *
 *   3. The fix is to wrap esmify's resolver with one that retries with
 *      `.ts` / `.tsx` on ENOENT, so extensionless imports still work.
 *
 * This plugin MUST run AFTER `--plugin tsify --plugin esmify` on the CLI.
 * It leaves the rest of esmify's behaviour untouched.
 */

const path = require('path')
const fs = require('fs')

module.exports = function (bundler /*, opts */) {
  const originalBresolve = bundler._bresolve
  if (typeof originalBresolve !== 'function') {
    // esmify hasn't installed its resolver yet; nothing to patch.
    return
  }

  bundler._bresolve = function (id, opts, cb) {
    originalBresolve.call(bundler, id, opts, function (err, result, pkg) {
      if (!err) return cb(null, result, pkg)

      // esmify's resolver failed — this is almost always because the import
      // targets a .ts file that esmify's hardcoded [.mjs, .js] extension
      // list can't see. Try resolving against .ts / .tsx directly.
      const basedir = opts.basedir || path.dirname(opts.filename)

      // Only attempt the fallback for relative imports (./foo, ../bar).
      // A failure on a bare specifier like 'some-pkg' is a real error.
      if (!id.startsWith('.')) return cb(err)

      const candidates = [
        path.resolve(basedir, id + '.ts'),
        path.resolve(basedir, id + '.tsx'),
        path.resolve(basedir, id, 'index.ts'),
        path.resolve(basedir, id, 'index.tsx')
      ]

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return cb(null, candidate)
        }
      }

      // No .ts fallback found — surface the original esmify error.
      cb(err)
    })
  }
}
