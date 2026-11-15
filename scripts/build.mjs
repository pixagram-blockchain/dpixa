#!/usr/bin/env node
/**
 * Build every dpixa artifact.
 *
 *   lib/   CommonJS + .d.ts (tsc)            Node.js `require`/`import`, types
 *   esm/   ES modules, code-split (esbuild)  bundlers (webpack, Vite, Rollup…)
 *            index.mjs    full API
 *            lite.mjs     RPC client and chain helpers, no cryptography
 *            crypto.mjs   keys, signing, serialization, memos
 *            chunks/      code shared by the entries (loaded once)
 *          @noble/* stay external so an app that also uses them gets one copy.
 *   dist/  standalone, minified UMD bundles with their dependencies inlined
 *            dpixa.js       full API (`<script>` global `dpixa`; also what
 *                           `import('@pixagram/dpixa/dist/dpixa')` loads)
 *            dpixa-lite.js  lite API only, same global name
 *
 * The build fails if anything from the crypto side ends up in a lite output.
 *
 * Usage: node scripts/build.mjs [--no-lib]
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const skipLib = process.argv.includes('--no-lib')

/** Syntax level of the published JavaScript (BigInt is required anyway). */
const TARGET = 'es2020'

/**
 * Modules that make up the crypto half. None of them may be reachable from
 * the lite entry point.
 */
const CRYPTO_MODULES = [
  'src/crypto.ts',
  'src/helpers/aes.ts',
  'src/memo.ts',
  'src/chain/serializer.ts',
  'src/chain/deserializer.ts',
  'src/base58.ts',
  'src/bytebuffer.ts',
  'src/witness.ts'
]
const isCryptoInput = (input) => input.includes('node_modules/@noble/') || CRYPTO_MODULES.includes(input)

/**
 * Source transforms for the bundles:
 *  - src/version.ts reads package.json at runtime; bundles get the literal.
 *  - Every source file starts with the same BSD license header tagged
 *    `@license`, which esbuild would copy into the output once per file
 *    (~1.8 kB each). The tag is dropped here and BANNER carries the notice
 *    once per output file instead; the full text ships in LICENSE.
 */
const SRC_FILE = new RegExp(`^${path.join(root, 'src').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\\\/].*\\.ts$`)
const sourcePlugin = {
  name: 'dpixa-source',
  setup(b) {
    // Only this package's own sources, never files from node_modules.
    b.onLoad({ filter: SRC_FILE }, async (args) => {
      if (/[\\/]src[\\/]version\.ts$/.test(args.path)) {
        return { contents: `export default ${JSON.stringify(pkg.version)}`, loader: 'ts' }
      }
      const source = readFileSync(args.path, 'utf8')
      return { contents: source.replace(/^( \* )@license\b/m, '$1license'), loader: 'ts' }
    })
  }
}

/** First "Copyright ..." lines of a LICENSE file, joined. */
const copyrights = (file) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => /^Copyright \(c\)/.test(line))
    .map((line) => line.replace(/\.? *All Rights Reserved\.?/i, '').trim())
    .join(', ')

const BANNER =
  `/*! @pixagram/dpixa ${pkg.version} | ${pkg.license} | ${copyrights('LICENSE')} | ` +
  'https://github.com/pixagram-blockchain/dpixa */'

/** Notice for the MIT-licensed @noble packages inlined into dist/dpixa.js. */
const NOBLE_NOTICE = ['secp256k1', 'hashes', 'ciphers']
  .map((name) => {
    const dir = `node_modules/@noble/${name}`
    const { version, license } = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8'))
    return `@noble/${name} ${version} | ${license} | ${copyrights(`${dir}/LICENSE`)}`
  })
  .join('\n * ')

/**
 * Wrap esbuild's IIFE (`var dpixa = (() => {…})()`) so the file also works
 * as a CommonJS/AMD module, like the old browserify --standalone bundle.
 */
const UMD_FOOTER =
  'if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=dpixa}' +
  'else if(typeof define==="function"&&define.amd){define([],function(){return dpixa})}'

function fail(message) {
  console.error(`\nbuild failed: ${message}`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// lib/ — tsc (CommonJS + declarations)
// ---------------------------------------------------------------------------
if (!skipLib) {
  rmSync('lib', { recursive: true, force: true })
  // --rootDir src: emit lib/index.js, not lib/src/index.js (tsconfig's
  // rootDir is the project root so tests and lint can share it).
  execFileSync(
    process.execPath,
    ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json', '--outDir', 'lib', '--rootDir', 'src'],
    { stdio: 'inherit' }
  )
  writeFileSync(
    'lib/version.js',
    `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nexports.default = '${pkg.version}';\n`
  )
  // src/bbuffer.ts silences an intentional static-side override error with
  // @ts-expect-error, which tsc does not copy into the declaration file.
  // Without it, consumers compiling with skipLibCheck: false get TS2417.
  const dts = readFileSync('lib/bbuffer.d.ts', 'utf8')
  const declaration = 'export declare class BBuffer extends Uint8Array {'
  if (!dts.includes(declaration)) fail('lib/bbuffer.d.ts: BBuffer declaration not found')
  writeFileSync(
    'lib/bbuffer.d.ts',
    dts.replace(declaration, `// @ts-ignore -- Buffer-style static from(), see src/bbuffer.ts\n${declaration}`)
  )
}

// ---------------------------------------------------------------------------
// esm/ — code-split ES modules for bundlers
// ---------------------------------------------------------------------------
rmSync('esm', { recursive: true, force: true })
const esm = await build({
  entryPoints: { index: 'src/index.ts', lite: 'src/index-lite.ts', crypto: 'src/index-crypto.ts' },
  outdir: 'esm',
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'neutral',
  target: TARGET,
  outExtension: { '.js': '.mjs' },
  chunkNames: 'chunks/[name]-[hash]',
  external: ['@noble/*'],
  banner: { js: BANNER },
  legalComments: 'none',
  sourcemap: true,
  metafile: true,
  logLevel: 'warning',
  plugins: [sourcePlugin]
})

/** Every input file statically reachable from one esm output file. */
function esmClosure(outputFile) {
  const seen = new Set()
  const inputs = new Set()
  const externals = new Set()
  const visit = (file) => {
    if (seen.has(file)) return
    seen.add(file)
    const out = esm.metafile.outputs[file]
    for (const input of Object.keys(out.inputs)) inputs.add(input)
    for (const imp of out.imports) {
      if (imp.kind !== 'import-statement') continue
      if (imp.external) externals.add(imp.path)
      else visit(imp.path)
    }
  }
  visit(outputFile)
  return { inputs, externals }
}

const liteEsm = esmClosure('esm/lite.mjs')
const leakedEsm = [...liteEsm.inputs].filter(isCryptoInput).concat([...liteEsm.externals])
if (leakedEsm.length > 0) {
  fail(`esm/lite.mjs reaches crypto code:\n  ${leakedEsm.join('\n  ')}`)
}

// ---------------------------------------------------------------------------
// dist/ — standalone UMD bundles
// ---------------------------------------------------------------------------
mkdirSync('dist', { recursive: true })
const umd = (entry, outfile, banner) =>
  build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'iife',
    globalName: 'dpixa',
    platform: 'browser',
    target: TARGET,
    minify: true,
    sourcemap: true,
    metafile: true,
    banner: { js: banner },
    footer: { js: UMD_FOOTER },
    legalComments: 'none',
    logLevel: 'warning',
    plugins: [sourcePlugin]
  })

await umd('src/index.ts', 'dist/dpixa.js', `${BANNER}\n/*! Includes:\n * ${NOBLE_NOTICE}\n */`)
const lite = await umd('src/index-lite.ts', 'dist/dpixa-lite.js', BANNER)

const leakedUmd = Object.keys(lite.metafile.outputs['dist/dpixa-lite.js'].inputs).filter(isCryptoInput)
if (leakedUmd.length > 0) {
  fail(`dist/dpixa-lite.js contains crypto code:\n  ${leakedUmd.join('\n  ')}`)
}

for (const file of ['dist/dpixa.js', 'dist/dpixa-lite.js']) {
  writeFileSync(`${file}.gz`, gzipSync(readFileSync(file), { level: 9 }))
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const kb = (n) => `${(n / 1024).toFixed(1)} kB`
const size = (file) => {
  const buf = readFileSync(file)
  return `${kb(buf.length).padStart(9)}  gzip ${kb(gzipSync(buf, { level: 9 }).length).padStart(8)}`
}
console.log(`\ndpixa ${pkg.version}`)
console.log(`  dist/dpixa.js       ${size('dist/dpixa.js')}   (full, deps inlined)`)
console.log(`  dist/dpixa-lite.js  ${size('dist/dpixa-lite.js')}   (lite, no crypto)`)
for (const out of Object.keys(esm.metafile.outputs).filter((f) => f.endsWith('.mjs')).sort()) {
  console.log(`  ${out.padEnd(19)} ${size(out)}`)
}
