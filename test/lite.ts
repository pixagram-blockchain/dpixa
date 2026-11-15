import 'mocha'
import * as assert from 'assert'
import { execFileSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// The lite entry point must work on its own and must not load any crypto
// code; loading the crypto entry later enables signing on the same client.
// Each scenario runs in a fresh Node process so nothing else has loaded the
// crypto module (and registered it) first.

const root = path.join(__dirname, '..')

const scenario = (liteModule: string, cryptoModule: string) => `
const assert = require('assert')
let fetchCalls = 0
globalThis.fetch = async (url, init) => {
  fetchCalls++
  const { id, method } = JSON.parse(init.body)
  const result = method.endsWith('get_dynamic_global_properties')
    ? { head_block_number: 1000, head_block_id: '000003e8aabbccdd00112233445566778899aabb', time: '2026-11-15T12:00:00' }
    : { method }
  return { ok: true, status: 200, json: async () => ({ jsonrpc: '2.0', id, result }) }
}

const lite = require(${JSON.stringify(liteModule)})
const crypto = /node_modules[\\\\/]@noble|[\\\\/](crypto|memo|witness|base58|bytebuffer)\\.(ts|js)$|[\\\\/]helpers[\\\\/]aes|[\\\\/]serializer|[\\\\/]deserializer/
const loaded = Object.keys(require.cache).filter((p) => crypto.test(p))
assert.deepStrictEqual(loaded, [], 'lite loaded crypto modules:\\n' + loaded.join('\\n'))

const PUB = 'PIX7s4VJuYFfHq8HCPpgC649Lu7CjA1V9oXgPfv8f3fszKMk3Kny9'
const tx = { ref_block_num: 1, ref_block_prefix: 2, expiration: '2026-11-15T12:01:00', extensions: [],
  operations: [['vote', { voter: 'a', author: 'b', permlink: 'c', weight: 10000 }]] }

;(async () => {
  const client = new lite.Client('https://node.example')
  assert.ok(client.broadcast, 'client.broadcast exists before crypto is loaded')
  assert.strictEqual((await client.call('condenser_api', 'get_config')).method, 'condenser_api.get_config')
  assert.strictEqual(lite.Authority.from(PUB).key_auths[0][0], PUB)
  assert.strictEqual(lite.utils.makeBitMaskFilter([2])[0], '4')

  const before = fetchCalls
  assert.throws(() => client.broadcast.sign(tx, {}), /client\\.broadcast\\.sign needs the crypto module/)
  await assert.rejects(client.broadcast.send(Object.assign({ signatures: [] }, tx)), /needs the crypto module/)
  await assert.rejects(client.broadcast.vote(tx.operations[0][1], {}), /needs the crypto module/)
  assert.throws(() => lite.utils.buildWitnessUpdateOp('w', { key: PUB }), /utils\\.buildWitnessUpdateOp needs the crypto module/)
  assert.strictEqual(fetchCalls, before, 'no RPC call is made when signing is unavailable')

  const { PrivateKey, PublicKey } = require(${JSON.stringify(cryptoModule)})
  const key = PrivateKey.fromSeed('lite-test')
  const signed = client.broadcast.sign(tx, key)
  assert.strictEqual(signed.signatures.length, 1)
  const result = await client.broadcast.vote(tx.operations[0][1], key)
  assert.match(result.id, /^[0-9a-f]{40}$/)
  assert.strictEqual(lite.utils.buildWitnessUpdateOp('w', { key: PUB })[0], 'witness_set_properties')
  const pub = key.createPublic()
  assert.ok(lite.Authority.from(pub).key_auths[0][0] instanceof PublicKey)
  console.log('ok')
})().catch((error) => { console.error(error); process.exit(1) })
`

function runScenario(liteModule: string, cryptoModule: string, preload: string[] = []) {
    const args = [...preload.flatMap((p) => ['-r', p]), '-e', scenario(liteModule, cryptoModule)]
    const out = execFileSync(process.execPath, args, {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, TS_NODE_TRANSPILE_ONLY: 'true' },
        stdio: ['ignore', 'pipe', 'pipe']
    })
    assert.strictEqual(out.trim(), 'ok')
}

describe('lite entry point', function() {
    this.timeout(60000)

    it('works without crypto and gains signing once crypto is loaded (src)', function() {
        runScenario('./src/index-lite', './src/index-crypto', ['ts-node/register'])
    })

    it('works without crypto and gains signing once crypto is loaded (lib build)', function() {
        if (!fs.existsSync(path.join(root, 'lib/index-lite.js'))) {
            this.skip()
        }
        runScenario('./lib/index-lite.js', './lib/index-crypto.js')
    })
})
