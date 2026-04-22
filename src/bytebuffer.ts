/**
 * @file Custom ByteBuffer / Buffer implementation backed by Uint8Array.
 *
 * Replaces `@ecency/bytebuffer`. The previous library suffered from copy /
 * allocation bugs (affecting `memo.ts` and `crypto.ts` in particular) because
 * it shared underlying ArrayBuffers between views in surprising ways. This
 * implementation is allocation-explicit: every `copy()`, `slice()`, and
 * `toBuffer()` produces an independent buffer.
 *
 * Exports:
 *   - BBuffer       Node-Buffer shim (from/alloc/concat/slice/toString/…)
 *   - ByteBuffer    Stream-style writer/reader (writeVString, flip, …)
 *   - Long          Minimal 64-bit integer helper (only methods used by aes.ts)
 *
 * The module default export mirrors the historical `require("@ecency/bytebuffer")`
 * call-site shape: calling `new ByteBuffer(cap, le)` builds a stream buffer,
 * and static helpers like `ByteBuffer.DEFAULT_CAPACITY`, `ByteBuffer.LITTLE_ENDIAN`,
 * `ByteBuffer.fromBinary`, and `ByteBuffer.Long` are all available.
 */

/* =========================================================================
 *  Encoding helpers
 * ========================================================================= */

const HEX_CHARS = '0123456789abcdef'

function bytesToHex(bytes: Uint8Array, start = 0, end = bytes.length): string {
  let out = ''
  for (let i = start; i < end; i++) {
    const b = bytes[i]
    out += HEX_CHARS[b >>> 4] + HEX_CHARS[b & 0x0f]
  }
  return out
}

function hexToBytes(hex: string): Uint8Array {
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
function binaryToBytes(str: string): Uint8Array {
  const out = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    out[i] = str.charCodeAt(i) & 0xff
  }
  return out
}

function bytesToBinary(bytes: Uint8Array, start = 0, end = bytes.length): string {
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

function utf8ToBytes(str: string): Uint8Array {
  return textEncoder.encode(str)
}

function bytesToUtf8(bytes: Uint8Array, start = 0, end = bytes.length): string {
  return textDecoder.decode(bytes.subarray(start, end))
}

type Encoding = 'hex' | 'binary' | 'utf-8' | 'utf8' | 'latin1'

function encodeString(str: string, encoding: Encoding): Uint8Array {
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

function decodeBytes(bytes: Uint8Array, encoding: Encoding, start = 0, end = bytes.length): string {
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

/* =========================================================================
 *  Long — minimal 64-bit unsigned integer (decimal-string-oriented)
 * =========================================================================
 * aes.ts only needs: fromNumber, fromString, isLong, shiftLeft, or, toString.
 * We store the value as a native JS BigInt masked to 64 bits.
 */

export class Long {

  public static isLong(value: unknown): value is Long {
    return value instanceof Long
  }

  public static fromNumber(n: number): Long {
    if (!Number.isFinite(n)) throw new Error('Long.fromNumber: non-finite')
    return new Long(BigInt(Math.trunc(n)))
  }

  public static fromString(s: string, unsigned = true, radix = 10): Long {
    if (!s || s.length === 0) throw new Error('Long.fromString: empty')
    // BigInt() accepts decimal/0x-prefixed strings; for non-10 radix we parse manually.
    if (radix === 10) return new Long(BigInt(s))
    if (radix === 16) return new Long(BigInt(s.startsWith('0x') ? s : '0x' + s))
    // Generic radix parse.
    let v = 0n
    const big = BigInt(radix)
    for (const ch of s) {
      const digit = parseInt(ch, radix)
      if (isNaN(digit)) throw new Error(`Invalid digit for radix ${radix}: ${ch}`)
      v = v * big + BigInt(digit)
    }
    return new Long(v)
  }

  /** Always stored masked to 64 unsigned bits. */
  private readonly value: bigint

  constructor(value: bigint) {
    this.value = value & 0xffffffffffffffffn
  }

  public shiftLeft(n: number): Long {
    return new Long(this.value << BigInt(n))
  }

  public or(other: Long): Long {
    return new Long(this.value | other.value)
  }

  public toString(radix: number = 10): string {
    return this.value.toString(radix)
  }

  /** Low/high 32-bit halves, for little-endian serialisation. */
  public getLow32(): number {
    return Number(this.value & 0xffffffffn) >>> 0
  }
  public getHigh32(): number {
    return Number((this.value >> 32n) & 0xffffffffn) >>> 0
  }

  public toBigInt(): bigint {
    return this.value
  }
}

/* =========================================================================
 *  ByteBuffer — stream-style little-endian writer/reader
 * =========================================================================
 * Fixes the allocation problem that motivated this rewrite: writes grow the
 * underlying Uint8Array when needed, and `copy()` always returns a fresh
 * independent ByteBuffer. No ArrayBuffer aliasing, ever.
 */

// Use the enum-like number 1 for LITTLE_ENDIAN to match @ecency/bytebuffer's shape.
// Everything we do is little-endian regardless, but we accept the argument for
// call-site compatibility.
const LITTLE_ENDIAN_FLAG = 1
const DEFAULT_CAPACITY = 64

export class ByteBuffer {

  /* ---- static shape compatible with the old library ---- */

  public static readonly DEFAULT_CAPACITY = DEFAULT_CAPACITY
  public static readonly LITTLE_ENDIAN = LITTLE_ENDIAN_FLAG
  public static readonly BIG_ENDIAN = 0
  public static readonly Long = Long

  /**
   * Build a ByteBuffer whose contents are the bytes of a "binary" (Latin-1)
   * string. Call-sites use either (binary, endian) or (binary, capacity, endian);
   * we accept both.
   */
  public static fromBinary(binary: string, capacityOrEndian?: number, _endian?: number): ByteBuffer {
    const bytes = binaryToBytes(binary)
    const buf = new ByteBuffer(Math.max(bytes.length, DEFAULT_CAPACITY))
    // Load as already-written, ready to be read (offset=0, limit=length).
    buf.data.set(bytes, 0)
    buf.writeOffset = bytes.length
    buf._offset = 0
    buf._limit = bytes.length
    // capacityOrEndian / _endian are ignored: we always produce LE.
    void capacityOrEndian; void _endian
    return buf
  }

  /* ---- internal state ---- */

  private data: Uint8Array
  private view: DataView
  // `_offset` is the current read/write cursor, matching ByteBuffer's `offset`.
  private _offset: number = 0
  // `_limit` is the end of meaningful data after flip() — used by copy() and toBuffer().
  private _limit: number = -1
  // `writeOffset` tracks how far we've ever written. Before flip(), offset===writeOffset.
  // After flip(), we may read from 0 up to writeOffset (stored in _limit).
  private writeOffset: number = 0
  // Saved offset from mark() for reset().
  private markedOffset: number = -1

  constructor(capacity: number = DEFAULT_CAPACITY, _endian: number = LITTLE_ENDIAN_FLAG) {
    // Always LE internally.
    void _endian
    const cap = Math.max(capacity | 0, 1)
    this.data = new Uint8Array(cap)
    this.view = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength)
  }

  /* ---- public state accessors (match @ecency/bytebuffer call sites) ---- */

  /** Current read/write cursor. The legacy API exposed this as `.offset`. */
  public get offset(): number {
    return this._offset
  }
  public set offset(v: number) {
    this._offset = v | 0
  }

  /** Total capacity of the underlying storage. */
  public capacity(): number {
    return this.data.length
  }

  /* ---- growth ---- */

  private ensure(n: number): void {
    const needed = this._offset + n
    if (needed <= this.data.length) return
    let cap = this.data.length
    while (cap < needed) cap *= 2
    const next = new Uint8Array(cap)
    next.set(this.data)
    this.data = next
    this.view = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength)
  }

  /* ---- writers (little-endian) ---- */

  public writeByte(value: number): ByteBuffer { return this.writeUint8(value) }

  public writeInt8(value: number): ByteBuffer {
    this.ensure(1)
    this.view.setInt8(this._offset, value)
    this._offset += 1
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }
  public writeUint8(value: number): ByteBuffer {
    this.ensure(1)
    this.view.setUint8(this._offset, value & 0xff)
    this._offset += 1
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }
  public writeInt16(value: number): ByteBuffer {
    this.ensure(2)
    this.view.setInt16(this._offset, value, true)
    this._offset += 2
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }
  public writeUint16(value: number): ByteBuffer {
    this.ensure(2)
    this.view.setUint16(this._offset, value & 0xffff, true)
    this._offset += 2
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }
  public writeInt32(value: number): ByteBuffer {
    this.ensure(4)
    this.view.setInt32(this._offset, value | 0, true)
    this._offset += 4
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }
  public writeUint32(value: number): ByteBuffer {
    this.ensure(4)
    this.view.setUint32(this._offset, value >>> 0, true)
    this._offset += 4
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }

  /** Accepts Long, bigint, number, or decimal string. Always little-endian. */
  public writeInt64(value: Long | bigint | number | string): ByteBuffer {
    const big = toBigInt64(value)
    this.ensure(8)
    this.view.setBigInt64(this._offset, big, true)
    this._offset += 8
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }
  public writeUint64(value: Long | bigint | number | string): ByteBuffer {
    const big = toBigUint64(value)
    this.ensure(8)
    this.view.setBigUint64(this._offset, big, true)
    this._offset += 8
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }

  /** Varint-32, protobuf-style (7 bits per byte, MSB = continuation). */
  public writeVarint32(value: number): ByteBuffer {
    let v = value >>> 0
    while (v >= 0x80) {
      this.writeUint8((v & 0x7f) | 0x80)
      v >>>= 7
    }
    this.writeUint8(v & 0x7f)
    return this
  }

  /**
   * Write a length-prefixed UTF-8 string: varint32 length followed by bytes.
   * Matches @ecency/bytebuffer's writeVString.
   */
  public writeVString(value: string): ByteBuffer {
    const bytes = utf8ToBytes(value)
    this.writeVarint32(bytes.length)
    this.ensure(bytes.length)
    this.data.set(bytes, this._offset)
    this._offset += bytes.length
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }

  /**
   * Append raw bytes or a string at the current offset. When `data` is a
   * string and `encoding` is 'binary', each char is treated as a single byte.
   */
  public append(
      data: Uint8Array | ArrayBuffer | string | { buffer: Uint8Array } | number[],
      encoding: Encoding = 'binary'
  ): ByteBuffer {
    let bytes: Uint8Array
    if (typeof data === 'string') {
      bytes = encodeString(data, encoding)
    } else if (data instanceof Uint8Array) {
      bytes = data
    } else if (data instanceof ArrayBuffer) {
      bytes = new Uint8Array(data)
    } else if (Array.isArray(data)) {
      bytes = new Uint8Array(data)
    } else if (data && (data as { buffer: Uint8Array }).buffer instanceof Uint8Array) {
      // HexBuffer-like wrappers.
      bytes = (data as { buffer: Uint8Array }).buffer
    } else {
      throw new Error('ByteBuffer.append: unsupported data type')
    }
    this.ensure(bytes.length)
    this.data.set(bytes, this._offset)
    this._offset += bytes.length
    this.writeOffset = Math.max(this.writeOffset, this._offset)
    return this
  }

  /* ---- readers ---- */

  public readUint8(): number {
    this.checkReadable(1)
    const v = this.view.getUint8(this._offset)
    this._offset += 1
    return v
  }
  public readInt8(): number {
    this.checkReadable(1)
    const v = this.view.getInt8(this._offset)
    this._offset += 1
    return v
  }
  public readUint16(): number {
    this.checkReadable(2)
    const v = this.view.getUint16(this._offset, true)
    this._offset += 2
    return v
  }
  public readInt16(): number {
    this.checkReadable(2)
    const v = this.view.getInt16(this._offset, true)
    this._offset += 2
    return v
  }
  public readUint32(): number {
    this.checkReadable(4)
    const v = this.view.getUint32(this._offset, true)
    this._offset += 4
    return v
  }
  public readInt32(): number {
    this.checkReadable(4)
    const v = this.view.getInt32(this._offset, true)
    this._offset += 4
    return v
  }

  /** Returns a Long (decimal-string-printable) for call-site compatibility. */
  public readUint64(): Long {
    this.checkReadable(8)
    const v = this.view.getBigUint64(this._offset, true)
    this._offset += 8
    return new Long(v)
  }
  public readInt64(): Long {
    this.checkReadable(8)
    const v = this.view.getBigInt64(this._offset, true)
    this._offset += 8
    // Mask into unsigned-storage representation, consistent with Long.
    return new Long(v & 0xffffffffffffffffn)
  }

  public readVarint32(): number {
    let result = 0
    let shift = 0
    for (let i = 0; i < 5; i++) {
      const b = this.readUint8()
      result |= (b & 0x7f) << shift
      if ((b & 0x80) === 0) return result >>> 0
      shift += 7
    }
    throw new Error('readVarint32: value too large')
  }

  public readVString(): string {
    const len = this.readVarint32()
    this.checkReadable(len)
    const s = bytesToUtf8(this.data, this._offset, this._offset + len)
    this._offset += len
    return s
  }

  /* ---- cursor / state management ---- */

  public skip(n: number): ByteBuffer {
    this._offset += n
    return this
  }

  public mark(offset?: number): ByteBuffer {
    this.markedOffset = offset === undefined ? this._offset : (offset | 0)
    return this
  }

  public reset(): ByteBuffer {
    if (this.markedOffset < 0) {
      this._offset = 0
    } else {
      this._offset = this.markedOffset
    }
    return this
  }

  /**
   * Flip from "write" to "read" mode: limit = current offset, offset = 0.
   * Matches @ecency/bytebuffer semantics.
   */
  public flip(): ByteBuffer {
    this._limit = this._offset
    this._offset = 0
    return this
  }

  /* ---- copy / export ---- */

  /**
   * Return a new ByteBuffer containing an independent copy of bytes
   * `[start, end)`. The new buffer is in read mode: offset = 0,
   * limit = end - start. This is a deep copy — the caller cannot alias
   * this buffer's memory through the returned one.
   */
  public copy(start: number = 0, end: number = this._offset): ByteBuffer {
    if (start < 0) start = 0
    if (end > this.data.length) end = this.data.length
    if (end < start) end = start
    const len = end - start
    const out = new ByteBuffer(Math.max(len, 1))
    out.data.set(this.data.subarray(start, end), 0)
    out._offset = 0
    out.writeOffset = len
    out._limit = len
    return out
  }

  /**
   * Return an independent Uint8Array containing the meaningful bytes.
   * After flip(): bytes [0, limit). Otherwise: bytes [0, offset).
   */
  public toBuffer(): Uint8Array {
    const end = this._limit >= 0 ? this._limit : this._offset
    const out = new Uint8Array(end)
    out.set(this.data.subarray(0, end))
    return out
  }

  /** Same bytes as toBuffer(), but wrapped as a BBuffer (Node-Buffer shim). */
  public toBBuffer(): BBuffer {
    const end = this._limit >= 0 ? this._limit : this._offset
    const out = new BBuffer(end)
    out.set(this.data.subarray(0, end))
    return out
  }

  /** "binary" (Latin-1) string of the meaningful bytes. */
  public toBinary(): string {
    const end = this._limit >= 0 ? this._limit : this._offset
    return bytesToBinary(this.data, 0, end)
  }

  /**
   * Encode the meaningful bytes. Default is hex (the most common call-site
   * in utils.ts). Accepts 'hex', 'binary', 'utf-8'.
   */
  public toString(encoding: Encoding = 'hex'): string {
    const end = this._limit >= 0 ? this._limit : this._offset
    return decodeBytes(this.data, encoding, 0, end)
  }

  /* ---- internal ---- */

  private checkReadable(n: number): void {
    const end = this._limit >= 0 ? this._limit : this.data.length
    if (this._offset + n > end) {
      throw new RangeError(
          `ByteBuffer read past end (offset=${this._offset}, need=${n}, limit=${end})`
      )
    }
  }
}

/* =========================================================================
 *  Numeric conversion helpers used by writeInt64 / writeUint64
 * ========================================================================= */

function toBigInt64(v: Long | bigint | number | string): bigint {
  let big: bigint
  if (Long.isLong(v)) big = v.toBigInt()
  else if (typeof v === 'bigint') big = v
  else if (typeof v === 'number') big = BigInt(Math.trunc(v))
  else big = BigInt(v)
  // DataView.setBigInt64 expects a value in [-2^63, 2^63).
  // Normalise through two's-complement on 64 bits.
  const mask = 0xffffffffffffffffn
  big &= mask
  if (big >= 0x8000000000000000n) big -= 0x10000000000000000n
  return big
}

function toBigUint64(v: Long | bigint | number | string): bigint {
  let big: bigint
  if (Long.isLong(v)) big = v.toBigInt()
  else if (typeof v === 'bigint') big = v
  else if (typeof v === 'number') big = BigInt(Math.trunc(v))
  else big = BigInt(v)
  return big & 0xffffffffffffffffn
}

/* =========================================================================
 *  Default export — shape compatible with `require("@ecency/bytebuffer")`
 * =========================================================================
 * With the old library, call-sites did:
 *     const ByteBuffer = require("@ecency/bytebuffer")
 *     const Buffer = ByteBuffer            // aliased: used for Buffer.from etc
 *     const Long = ByteBuffer.Long
 *     new ByteBuffer(cap, ByteBuffer.LITTLE_ENDIAN)
 *
 * To preserve that, the default export is the ByteBuffer class, and we also
 * attach `from`, `alloc`, and `concat` (proxied to BBuffer) to it so the
 * `const Buffer = ByteBuffer` alias keeps working.
 */

// Augment ByteBuffer with Node-Buffer-style static helpers so the
// `const Buffer = ByteBuffer` shorthand continues to work.
type ByteBufferCtor = typeof ByteBuffer & {
  from: typeof BBuffer.from
  alloc: typeof BBuffer.alloc
  concat: typeof BBuffer.concat
}
    ;(ByteBuffer as ByteBufferCtor).from = BBuffer.from.bind(BBuffer)
;(ByteBuffer as ByteBufferCtor).alloc = BBuffer.alloc.bind(BBuffer)
;(ByteBuffer as ByteBufferCtor).concat = BBuffer.concat.bind(BBuffer)

export default ByteBuffer