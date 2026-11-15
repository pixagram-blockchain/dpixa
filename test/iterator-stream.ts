import 'mocha'
import * as assert from 'assert'
import * as stream from 'stream'

import { IteratorStream } from '../src/iterator-stream'
import { utils } from '../src'

// The browser fallback used by utils.iteratorStream() when Node's `stream`
// module is not available.
describe('IteratorStream (non-Node fallback)', function() {
    async function* counter(to: number) {
        for (let i = 0; i < to; i++) {
            yield { i }
        }
    }

    async function* failing(to: number, errorAt: number) {
        for (let i = 0; i < to; i++) {
            yield { i }
            if (i === errorAt) {
                throw new Error('Oh noes')
            }
        }
    }

    it('emits data then end', async function() {
        const seen: number[] = []
        await new Promise<void>((resolve) => {
            const s = new IteratorStream(counter(5))
            s.on('data', (d: any) => seen.push(d.i))
            s.on('end', () => resolve())
        })
        assert.deepStrictEqual(seen, [0, 1, 2, 3, 4])
    })

    it('stays paused until a data listener is attached', async function() {
        let pulled = 0
        async function* tracked() {
            for (let i = 0; i < 3; i++) {
                pulled++
                yield i
            }
        }
        const s = new IteratorStream(tracked())
        await new Promise((r) => setTimeout(r, 20))
        assert.strictEqual(pulled, 0)
        assert.strictEqual(s.isPaused(), true)
        const values: number[] = []
        await new Promise<void>((resolve) => {
            s.on('end', resolve)
            s.on('data', (v: number) => values.push(v))
        })
        assert.deepStrictEqual(values, [0, 1, 2])
    })

    it('emits error followed by end, like the Node PassThrough path', async function() {
        const events: string[] = []
        let last = -1
        await new Promise<void>((resolve) => {
            const s = new IteratorStream(failing(10, 2))
            s.on('data', (d: any) => { last = d.i })
            s.on('error', (error: Error) => events.push('error:' + error.message))
            s.on('end', () => { events.push('end'); resolve() })
        })
        assert.strictEqual(last, 2)
        assert.deepStrictEqual(events, ['error:Oh noes', 'end'])
    })

    it('pause() stops data until resume()', async function() {
        const s = new IteratorStream(counter(10))
        const values: number[] = []
        s.on('data', (d: any) => {
            values.push(d.i)
            if (d.i === 3) {
                s.pause()
            }
        })
        await new Promise((r) => setTimeout(r, 30))
        assert.deepStrictEqual(values, [0, 1, 2, 3])
        await new Promise<void>((resolve) => {
            s.on('end', resolve)
            s.resume()
        })
        assert.strictEqual(values.length, 10)
    })

    it('pipes into a Node stream with backpressure', async function() {
        const dest = new stream.PassThrough({ objectMode: true, highWaterMark: 2 })
        const s = new IteratorStream(counter(50))
        s.pipe(dest)
        // nothing reads dest yet: the source must stop after filling the buffer
        await new Promise((r) => setTimeout(r, 30))
        assert(s.isPaused(), 'source should be paused by backpressure')
        const values: number[] = []
        await new Promise<void>((resolve) => {
            dest.on('data', (d: any) => values.push(d.i))
            dest.on('end', resolve)
        })
        assert.strictEqual(values.length, 50)
        assert.strictEqual(values[49], 49)
    })

    it('supports for await', async function() {
        const values: number[] = []
        for await (const d of new IteratorStream(counter(4)) as any) {
            values.push(d.i)
        }
        assert.deepStrictEqual(values, [0, 1, 2, 3])
    })

    it('destroy() stops iteration and emits close', async function() {
        let returned = false
        async function* endless() {
            try {
                let i = 0
                while (true) {
                    yield i++
                }
            } finally {
                returned = true
            }
        }
        const s = new IteratorStream(endless())
        let count = 0
        let ended = false
        s.on('end', () => { ended = true })
        await new Promise<void>((resolve) => {
            s.on('close', resolve)
            s.on('data', () => {
                if (++count === 5) {
                    s.destroy()
                }
            })
        })
        await new Promise((r) => setTimeout(r, 10))
        assert.strictEqual(count, 5)
        assert.strictEqual(ended, false)
        assert.strictEqual(returned, true)
    })

    it('utils.iteratorStream falls back to it when Node streams are unavailable', function() {
        const proc: any = (globalThis as any).process
        const original = proc.getBuiltinModule
        proc.getBuiltinModule = undefined
        try {
            const s = utils.iteratorStream(counter(1))
            assert(s instanceof IteratorStream)
        } finally {
            proc.getBuiltinModule = original
        }
        assert(utils.iteratorStream(counter(1)) instanceof stream.PassThrough)
    })
})
