/**
 * @file Small object-mode readable stream for environments without Node's
 * `stream` module (browsers, web workers).
 *
 * `utils.iteratorStream()` returns a real `stream.PassThrough` under Node.
 * Elsewhere it used to need the `stream-browserify` polyfill, which brings
 * readable-stream, events, buffer, process, util and string_decoder into the
 * bundle. This class covers what callers of the block/operation streams use:
 *
 *   - on / addListener / once / off / removeListener / removeAllListeners / emit
 *   - 'data', 'end', 'error' and 'close' events
 *   - pause() / resume() / isPaused()
 *   - pipe(destination) with backpressure (waits for 'drain' when write()
 *     returns false) and destroy()
 *   - async iteration (`for await (const item of stream)`)
 *
 * Like a Node Readable it starts paused and begins pulling from the iterator
 * once a 'data' listener is added, or on resume() / pipe().
 */

type Listener = (...args: any[]) => void

/** What pipe() needs from a destination (a Node Writable fits). */
interface PipeDestination {
  write(chunk: any): boolean | void
  end?(): void
  once?(event: string, listener: Listener): unknown
}

export class IteratorStream<T = any> {
  public readable = true
  public destroyed = false

  private readonly listeners = new Map<string | symbol, Listener[]>()
  private flowing = false
  private pausedByUser = false
  private started = false
  private wake: (() => void) | undefined

  public constructor(private readonly iterator: AsyncIterator<T>) {}

  public on(event: string | symbol, listener: Listener): this {
    const list = this.listeners.get(event)
    if (list) {
      list.push(listener)
    } else {
      this.listeners.set(event, [listener])
    }
    if (event === 'data' && !this.pausedByUser) {
      this.resume()
    }
    return this
  }

  public addListener(event: string | symbol, listener: Listener): this {
    return this.on(event, listener)
  }

  public once(event: string | symbol, listener: Listener): this {
    const wrapper: Listener = (...args) => {
      this.off(event, wrapper)
      listener.apply(this, args)
    }
    return this.on(event, wrapper)
  }

  public off(event: string | symbol, listener: Listener): this {
    const list = this.listeners.get(event)
    if (list) {
      const index = list.indexOf(listener)
      if (index !== -1) {
        list.splice(index, 1)
      }
    }
    return this
  }

  public removeListener(event: string | symbol, listener: Listener): this {
    return this.off(event, listener)
  }

  public removeAllListeners(event?: string | symbol): this {
    if (event === undefined) {
      this.listeners.clear()
    } else {
      this.listeners.delete(event)
    }
    return this
  }

  public listenerCount(event: string | symbol): number {
    const list = this.listeners.get(event)
    return list ? list.length : 0
  }

  public emit(event: string | symbol, ...args: any[]): boolean {
    const list = this.listeners.get(event)
    if (!list || list.length === 0) {
      if (event === 'error') {
        // Same as an EventEmitter: an unhandled 'error' is thrown.
        throw args[0]
      }
      return false
    }
    for (const listener of list.slice()) {
      listener.apply(this, args)
    }
    return true
  }

  public pause(): this {
    this.flowing = false
    this.pausedByUser = true
    return this
  }

  public resume(): this {
    this.flowing = true
    this.pausedByUser = false
    this.signal()
    if (!this.started) {
      this.started = true
      void this.pump()
    }
    return this
  }

  public isPaused(): boolean {
    return !this.flowing
  }

  public pipe<W extends PipeDestination>(destination: W, options?: { end?: boolean }): W {
    this.on('data', (chunk: T) => {
      if (destination.write(chunk) === false && destination.once) {
        this.pause()
        destination.once('drain', () => this.resume())
      }
    })
    if ((!options || options.end !== false) && typeof destination.end === 'function') {
      this.once('end', () => {
        (destination as { end(): void }).end()
      })
    }
    this.resume()
    return destination
  }

  public destroy(error?: Error): this {
    if (this.destroyed) {
      return this
    }
    this.destroyed = true
    this.readable = false
    this.signal()
    if (typeof this.iterator.return === 'function') {
      void Promise.resolve(this.iterator.return()).catch(() => undefined)
    }
    if (error) {
      this.emit('error', error)
    }
    this.emit('close')
    return this
  }

  public [Symbol.asyncIterator](): AsyncIterator<T> {
    // Hand the iterator to the consumer; the stream itself stops pulling.
    this.started = true
    return this.iterator
  }

  private signal() {
    const wake = this.wake
    this.wake = undefined
    if (wake) {
      wake()
    }
  }

  private waitUntilFlowing(): Promise<void> | undefined {
    if (this.flowing || this.destroyed) {
      return undefined
    }
    return new Promise<void>(resolve => {
      this.wake = resolve
    })
  }

  private async pump() {
    try {
      while (true) {
        await this.waitUntilFlowing()
        if (this.destroyed) {
          return
        }
        const result = await this.iterator.next()
        if (this.destroyed) {
          return
        }
        if (result.done) {
          break
        }
        // pause() may have been called while the next item was loading.
        while (!this.flowing && !this.destroyed) {
          await this.waitUntilFlowing()
        }
        if (this.destroyed) {
          return
        }
        this.emit('data', result.value)
      }
    } catch (error) {
      if (this.destroyed) {
        return
      }
      // Mirrors the Node path: 'error' is followed by 'end'.
      this.readable = false
      this.emit('error', error)
    }
    // destroy() from a 'data' or 'error' listener ends the stream silently.
    if (this.destroyed) {
      return
    }
    this.readable = false
    this.emit('end')
    this.emit('close')
  }
}
