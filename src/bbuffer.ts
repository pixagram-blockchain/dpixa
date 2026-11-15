/**
 * @file Node-Buffer shim (`BBuffer`) and byte/string encoding helpers.
 *
 * Split out of bytebuffer.ts so the fetch-only "lite" build can use `BBuffer`
 * (chain ids, HexBuffer, ref_block_prefix) without also pulling in the
 * stream-style `ByteBuffer` serializer, which only the crypto side needs.
 *
 * No Node `Buffer` is used anywhere: everything is a plain Uint8Array.
 */

/* =========================================================================
 *  Encoding helpers
 * ========================================================================= */

const HEX_CHARS = '0123456789abcdef'

export function bytesToHex(bytes: Uint8Array, start = 0, end = bytes.length): string {
  let out = ''
  for (let i = start; i < end; i++) {
    const b = bytes[i]
    out += HEX_CHARS[b >>> 4] + HEX_CHARS[b & 0x0f]
  }
  return out
}

export function hexToBytes(hex: string): Uint8Array {
  // Tolerate (but don't require) a leading 0x and odd-length strings.
  if (hex.length >= 2 && (hex[0] === '0') && (hex[1] === 'x' || hex[1] === 'X')) {
    hex = hex.slice(2)
  }
  if (hex.length % 2 !== 0) {
    hex = '0' + hex
  }
  const out = new Uint8Array(hex.length >>> 1)
  for (let i = 0; i < out.length; i++) {
    const hi = parseHexChar(hex.charCodeAt(i * 2))
    const lo = parseHexChar(hex.charCodeAt(i * 2 + 1))
    if (hi < 0 || lo < 0) {
      throw new Error(`Invalid hex string at position ${i * 2}`)
    }
    out[i] = (hi << 4) | lo
  }
  return out
}

function parseHexChar(code: number): number {
  if (code >= 48 && code <= 57) return code - 48       // 0-9
  if (code >= 97 && code <= 102) return code - 87      // a-f
  if (code >= 65 && code <= 70) return code - 55       // A-F
  return -1
}

/** "binary" encoding: one-byte-per-char Latin-1, matching Node's legacy mode. */
export function binaryToBytes(str: string): Uint8Array {
  const out = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    out[i] = str.charCodeAt(i) & 0xff
  }
  return out
}

export function bytesToBinary(bytes: Uint8Array, start = 0, end = bytes.length): string {
  // Build in chunks to avoid huge String.fromCharCode.apply arguments.
  let out = ''
  const CHUNK = 0x8000
  for (let i = start; i < end; i += CHUNK) {
    const slice = bytes.subarray(i, Math.min(i + CHUNK, end))
    out += String.fromCharCode.apply(null, slice as unknown as number[])
  }
  return out
}

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder('utf-8')

export function utf8ToBytes(str: string): Uint8Array {
  return textEncoder.encode(str)
}

export function bytesToUtf8(bytes: Uint8Array, start = 0, end = bytes.length): string {
  return textDecoder.decode(bytes.subarray(start, end))
}

export type Encoding = 'hex' | 'binary' | 'utf-8' | 'utf8' | 'latin1'

export function encodeString(str: string, encoding: Encoding): Uint8Array {
  switch (encoding) {
    case 'hex':
      return hexToBytes(str)
    case 'binary':
    case 'latin1':
      return binaryToBytes(str)
    case 'utf-8':
    case 'utf8':
      return utf8ToBytes(str)
    default:
      throw new Error(`Unsupported encoding: ${encoding}`)
  }
}

export function decodeBytes(bytes: Uint8Array, encoding: Encoding, start = 0, end = bytes.length): string {
  switch (encoding) {
    case 'hex':
      return bytesToHex(bytes, start, end)
    case 'binary':
    case 'latin1':
      return bytesToBinary(bytes, start, end)
    case 'utf-8':
    case 'utf8':
      return bytesToUtf8(bytes, start, end)
    default:
      throw new Error(`Unsupported encoding: ${encoding}`)
  }
}

/* =========================================================================
 *  BBuffer — Node-Buffer shim backed by Uint8Array
 * =========================================================================
 * Extends Uint8Array so consumers can treat the result as a plain byte array
 * (indexing, `.length`, passing into hash/cipher updates, etc.) while still
 * getting the `toString(encoding)` / `slice` / `copy` / `readUInt8` /
 * `writeUInt8` helpers the codebase relies on.
 */

// @ts-expect-error -- We intentionally narrow the static `from` signature
// from `Uint8Array.from`'s (arrayLike, mapfn?, thisArg?) shape to a
// Buffer-style (string, encoding?) / (bytes) shape. The runtime behaviour is
// strictly an extension of `Uint8Array.from` for the cases the codebase uses.
// (scripts/build.mjs adds the equivalent @ts-ignore to lib/bbuffer.d.ts.)
export class BBuffer extends Uint8Array {

  /* ---- static factories ---- */

  /**
   * Allocate a new zero-filled buffer of the given size.
   * The optional `fill` argument is a byte value (0-255) to pre-fill with.
   */
  public static alloc(size: number, fill: number = 0): BBuffer {
    const buf = new BBuffer(size)
    if (fill !== 0) buf.fill(fill)
    return buf
  }

  /**
   * Build a buffer from an array-like of bytes, a string (with encoding),
   * another Uint8Array, or an ArrayBuffer. Always produces an *independent*
   * allocation — slicing the result cannot alias the input.
   *
   * Signature is declared as overloads so this override is assignable to
   * `Uint8Array.from` (which has two- and three-arg shapes with `mapfn`).
   */
  public static from(value: string, encoding?: Encoding): BBuffer
  public static from(value: ArrayBuffer | Uint8Array | BBuffer | ArrayLike<number>): BBuffer
  public static from(value: any, encoding: Encoding = 'utf-8'): BBuffer {
    if (typeof value === 'string') {
      const bytes = encodeString(value, encoding)
      return BBuffer.fromUint8Array(bytes)
    }
    if (value instanceof BBuffer) {
      // Copy so the new buffer does not alias the source.
      const out = new BBuffer(value.length)
      out.set(value)
      return out
    }
    if (value instanceof Uint8Array) {
      const out = new BBuffer(value.length)
      out.set(value)
      return out
    }
    if (value instanceof ArrayBuffer) {
      const view = new Uint8Array(value)
      const out = new BBuffer(view.length)
      out.set(view)
      return out
    }
    // ArrayLike<number> (plain number[])
    const arr = value as ArrayLike<number>
    const out = new BBuffer(arr.length)
    for (let i = 0; i < arr.length; i++) out[i] = arr[i] & 0xff
    return out
  }

  /** Concatenate a list of Uint8Arrays / BBuffers into a single new buffer. */
  public static concat(list: Array<Uint8Array | BBuffer>, totalLength?: number): BBuffer {
    if (totalLength === undefined) {
      totalLength = 0
      for (const item of list) totalLength += item.length
    }
    const out = new BBuffer(totalLength)
    let offset = 0
    for (const item of list) {
      if (offset + item.length > totalLength) {
        out.set(item.subarray(0, totalLength - offset), offset)
        break
      }
      out.set(item, offset)
      offset += item.length
    }
    return out
  }

  /** Internal helper: wrap a Uint8Array in a BBuffer with its own memory. */
  private static fromUint8Array(bytes: Uint8Array): BBuffer {
    const out = new BBuffer(bytes.length)
    out.set(bytes)
    return out
  }

  /* ---- instance methods ---- */

  /**
   * Return a string in the given encoding. Defaults to utf-8 so that calls
   * like `buf.toString()` behave like Node.js `Buffer`.
   */
  public toString(encoding: Encoding = 'utf-8', start = 0, end: number = this.length): string {
    return decodeBytes(this, encoding, start, end)
  }

  /**
   * Return an *independent* copy of the sub-range. Node's `Buffer.slice`
   * returns a view that aliases the original; that aliasing is one of the
   * classes of bug this module is meant to prevent, so we always copy.
   */
  public slice(begin = 0, end: number = this.length): BBuffer {
    // Normalise negative indices the way Array.prototype.slice does.
    const len = this.length
    let s = begin < 0 ? Math.max(len + begin, 0) : Math.min(begin, len)
    let e = end < 0 ? Math.max(len + end, 0) : Math.min(end, len)
    if (e < s) e = s
    const out = new BBuffer(e - s)
    out.set(super.subarray(s, e))
    return out
  }

  /** Read a single unsigned byte. */
  public readUInt8(offset: number = 0): number {
    if (offset < 0 || offset >= this.length) {
      throw new RangeError(`readUInt8 out of range: ${offset}`)
    }
    return this[offset]
  }

  /** Write a single unsigned byte. Returns new offset like Node. */
  public writeUInt8(value: number, offset: number = 0): number {
    if (offset < 0 || offset >= this.length) {
      throw new RangeError(`writeUInt8 out of range: ${offset}`)
    }
    this[offset] = value & 0xff
    return offset + 1
  }

  /**
   * Read an unsigned little-endian 16/32-bit integer at `offset`.
   * Matches Node.js `Buffer.prototype.readUInt{16,32}LE`.
   */
  public readUInt16LE(offset: number = 0): number {
    if (offset < 0 || offset + 2 > this.length) {
      throw new RangeError(`readUInt16LE out of range: ${offset}`)
    }
    return this[offset] | (this[offset + 1] << 8)
  }
  public readUInt32LE(offset: number = 0): number {
    if (offset < 0 || offset + 4 > this.length) {
      throw new RangeError(`readUInt32LE out of range: ${offset}`)
    }
    return (
        (this[offset] |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16) |
            (this[offset + 3] << 24)) >>> 0
    )
  }

  /** Big-endian variants, for completeness. */
  public readUInt16BE(offset: number = 0): number {
    if (offset < 0 || offset + 2 > this.length) {
      throw new RangeError(`readUInt16BE out of range: ${offset}`)
    }
    return (this[offset] << 8) | this[offset + 1]
  }
  public readUInt32BE(offset: number = 0): number {
    if (offset < 0 || offset + 4 > this.length) {
      throw new RangeError(`readUInt32BE out of range: ${offset}`)
    }
    return (
        ((this[offset] << 24) |
            (this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3]) >>> 0
    )
  }

  /**
   * Copy bytes from this buffer into `target`, starting at `targetStart`,
   * reading `[sourceStart, sourceEnd)` of this buffer. Mirrors Node's
   * `Buffer.prototype.copy` return value (number of bytes copied).
   */
  public copy(
      target: Uint8Array,
      targetStart: number = 0,
      sourceStart: number = 0,
      sourceEnd: number = this.length
  ): number {
    if (sourceEnd > this.length) sourceEnd = this.length
    if (sourceStart < 0) sourceStart = 0
    if (sourceEnd <= sourceStart) return 0
    const available = target.length - targetStart
    const want = sourceEnd - sourceStart
    const n = Math.min(available, want)
    if (n <= 0) return 0
    target.set(super.subarray(sourceStart, sourceStart + n), targetStart)
    return n
  }
}
