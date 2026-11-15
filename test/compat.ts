import 'mocha'
import * as assert from 'assert'

import * as dpixa from '../src'
const { run } = require('./compat-cases')
const expected = require('./fixtures/compat.json')

// Byte-for-byte behaviour check against a snapshot taken from the published
// 1.5.4 bundle (see compat-cases.js for what it covers and the two known,
// intentional differences).
describe('compat snapshot', function() {
    this.timeout(30000)
    let actual: any

    before(async function() {
        actual = JSON.parse(JSON.stringify(await run(dpixa)))
    })

    for (const section of Object.keys(expected)) {
        it(section, function() {
            assert.deepStrictEqual(actual[section], expected[section])
        })
    }

    it('has no unexpected sections', function() {
        assert.deepStrictEqual(Object.keys(actual).sort(), Object.keys(expected).sort())
    })
})
