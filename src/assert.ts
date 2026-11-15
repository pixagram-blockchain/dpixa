/**
 * @file Minimal assertion helpers.
 *
 * Replaces Node's `assert` module. Browser bundlers had to polyfill it with
 * the `assert` package, which drags in `util`, `object.assign`, `is-nan`,
 * `call-bind`, … Only the three forms dpixa uses are implemented. Failures
 * still throw an error named `AssertionError` with Node's `ERR_ASSERTION`
 * code and the same messages as before.
 */

export class AssertionError extends Error {
  public readonly code = 'ERR_ASSERTION'

  public constructor(message: string) {
    super(message)
    this.name = 'AssertionError'
  }
}

interface Assert {
  /** Throw an AssertionError unless `value` is truthy. */
  (value: unknown, message?: string): asserts value
  /** Loose (`==`) equality, like Node's `assert.equal`. */
  equal(actual: unknown, expected: unknown, message?: string): void
  /**
   * Element-wise equality of two byte arrays (Uint8Array, BBuffer, number[]).
   * dpixa only ever deep-compares checksums and network ids.
   */
  deepEqual(actual: ArrayLike<number>, expected: ArrayLike<number>, message?: string): void
}

const fail = (message: string | undefined, fallback: string): never => {
  throw new AssertionError(message !== undefined ? message : fallback)
}

const assert: Assert = Object.assign(
  (value: unknown, message?: string): void => {
    if (!value) {
      fail(message, 'false == true')
    }
  },
  {
    deepEqual: (actual: ArrayLike<number>, expected: ArrayLike<number>, message?: string): void => {
      let equal = actual.length === expected.length
      for (let i = 0; equal && i < actual.length; i++) {
        equal = actual[i] === expected[i]
      }
      if (!equal) {
        fail(message, 'byte arrays are not equal')
      }
    },
    equal: (actual: unknown, expected: unknown, message?: string): void => {
      // eslint-disable-next-line eqeqeq
      if (actual != expected) {
        fail(message, `${String(actual)} == ${String(expected)}`)
      }
    }
  }
)

export default assert
