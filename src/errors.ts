/**
 * @file Minimal stand-in for the `verror` package.
 *
 * dpixa only used `new VError({ name, cause?, info? }, message)`. This class
 * keeps the fields callers inspect — `name`, `message`, `jse_shortmsg`,
 * `jse_info`, `jse_cause` and the `cause()` method — so code that checks
 * `error.name === 'RPCError'` or reads `error.jse_info` (or passes the error
 * to `VError.info()` from the real package) keeps working, without verror's
 * dependency tree (`extsprintf`, `assert-plus`, `core-util-is`, Node `util`).
 *
 * One deliberate difference: the message is used verbatim instead of being
 * run through printf. With verror, an RPC error message such as
 * "50% done" made the constructor itself throw "too few args to sprintf",
 * hiding the real node error.
 */

export interface VErrorOptions {
  /** Error name, e.g. `RPCError` or `SerializationError`. */
  name?: string
  /** Underlying error; its message is appended after a colon. */
  cause?: Error
  /** Extra data, copied (shallowly) to `jse_info`. */
  info?: { [key: string]: any }
}

export class VError extends Error {
  /** The message as given, without the cause's message appended. */
  public jse_shortmsg: string
  /** The underlying error, when one was given. */
  public jse_cause?: Error
  /** Extra data attached to the error (e.g. the RPC error `data`). */
  public jse_info: { [key: string]: any }

  public constructor(options: VErrorOptions, message: string) {
    super(options.cause ? `${message}: ${options.cause.message}` : message)
    if (options.name) {
      this.name = options.name
    }
    this.jse_shortmsg = message
    if (options.cause) {
      this.jse_cause = options.cause
    }
    this.jse_info = {}
    if (options.info) {
      // eslint-disable-next-line guard-for-in
      for (const key in options.info) {
        this.jse_info[key] = options.info[key]
      }
    }
  }

  /**
   * Return the underlying error, if any (same as verror's `cause()`).
   */
  public cause(): Error | undefined {
    return this.jse_cause
  }
}

VError.prototype.name = 'VError'
