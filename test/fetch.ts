import 'mocha'
import * as assert from 'assert'
import * as fs from 'fs'
import * as http from 'http'
import { AddressInfo } from 'net'
import * as path from 'path'
import * as vm from 'vm'

import { Client } from '../src'

// retryingFetch on the platform fetch (no node-fetch). Uses a local HTTP
// server, so no network access is needed.
describe('fetch transport', function() {
    this.timeout(10000)

    let server: http.Server
    let base: string
    let delays: number[] = []
    let hits = 0

    before(async function() {
        server = http.createServer((req, res) => {
            let body = ''
            req.on('data', (c) => { body += c })
            req.on('end', () => {
                const delay = delays[hits] || 0
                hits++
                const timer = setTimeout(() => {
                    const { id, method } = JSON.parse(body)
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ jsonrpc: '2.0', id, result: { method, hit: hits } }))
                }, delay)
                res.on('close', () => clearTimeout(timer))
            })
        })
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
        base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    })

    after(function() {
        server.close()
    })

    beforeEach(function() {
        delays = []
        hits = 0
    })

    it('aborts a slow attempt after the per-attempt timeout and retries (Node)', async function() {
        delays = [3000, 0] // first attempt hangs, second answers at once
        const client = new Client(base, { timeout: 8000 })
        const started = Date.now()
        const result = await client.call('condenser_api', 'get_dynamic_global_properties')
        const elapsed = Date.now() - started
        assert.strictEqual(hits, 2)
        assert.strictEqual(result.method, 'condenser_api.get_dynamic_global_properties')
        // first attempt is cut at (0 + 1) * 500 ms
        assert(elapsed >= 450 && elapsed < 2500, `took ${elapsed} ms`)
    })

    it('never times out broadcast_transaction* calls', async function() {
        delays = [1200]
        const client = new Client(base, { timeout: 8000 })
        const result = await client.call('condenser_api', 'broadcast_transaction_synchronous', [{}])
        assert.strictEqual(hits, 1)
        assert.strictEqual(result.method, 'condenser_api.broadcast_transaction_synchronous')
    })

    it('fails over on connection errors and reports the system error code', async function() {
        // Two ports nothing listens on: Node's fetch reports ECONNREFUSED on
        // error.cause.code; dpixa copies it to error.code for the failover logic.
        const closed = await new Promise<string>((resolve) => {
            const s = http.createServer()
            s.listen(0, '127.0.0.1', () => {
                const url = `http://127.0.0.1:${(s.address() as AddressInfo).port}`
                s.close(() => resolve(url))
            })
        })
        const client = new Client([closed, closed + '/'], { timeout: 1, failoverThreshold: 1 })
        await assert.rejects(
            client.call('condenser_api', 'get_config'),
            (error: any) => {
                assert.strictEqual(error.code, 'ECONNREFUSED')
                assert(/^\[ECONNREFUSED\] tried 1 times with /.test(error.message), error.message)
                return true
            }
        )
    })

    it('switches to the next node after a failover', async function() {
        const closed = await new Promise<string>((resolve) => {
            const s = http.createServer()
            s.listen(0, '127.0.0.1', () => {
                const url = `http://127.0.0.1:${(s.address() as AddressInfo).port}`
                s.close(() => resolve(url))
            })
        })
        const client = new Client([closed, base], { timeout: 1 })
        const result = await client.call('condenser_api', 'get_config')
        assert.strictEqual(result.method, 'condenser_api.get_config')
        assert.strictEqual(client.currentAddress, base)
    })

    it('does not add a per-attempt timeout outside Node (browser bundle)', async function() {
        // Run the lite UMD bundle in a context without `process`, like a browser.
        const file = path.join(__dirname, '../dist/dpixa-lite.js')
        if (!fs.existsSync(file)) {
            this.skip()
        }
        const inits: any[] = []
        const sandbox: any = {
            AbortController, TextDecoder, TextEncoder, clearTimeout, console, setTimeout,
            fetch: async (_url: string, init: any) => {
                inits.push(init)
                const { id } = JSON.parse(init.body)
                return { ok: true, status: 200, json: async () => ({ jsonrpc: '2.0', id, result: 1 }) }
            }
        }
        sandbox.globalThis = sandbox
        vm.createContext(sandbox)
        vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox)
        const client = new sandbox.dpixa.Client('https://node.example')
        assert.strictEqual(await client.call('condenser_api', 'get_config'), 1)
        assert.strictEqual(inits.length, 1)
        assert.strictEqual(inits[0].signal, undefined)
    })
})
