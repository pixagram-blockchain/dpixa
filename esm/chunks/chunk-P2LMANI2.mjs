/*! @pixagram/dpixa 1.6.0 | BSD-3-Clause-No-Military-License | Copyright (c) 2017 Johan Nordberg, Copyright (c) 2025 Pixagram Ltd | https://github.com/pixagram-blockchain/dpixa */
import {
  Asset,
  BBuffer,
  DEFAULT_ADDRESS_PREFIX,
  DEFAULT_CHAIN_ID,
  HexBuffer,
  VError,
  assert_default,
  binaryToBytes,
  bytesToBinary,
  bytesToUtf8,
  copy,
  decodeBytes,
  encodeString,
  registerCrypto,
  utf8ToBytes
} from "./chunk-QFEN6AXT.mjs";

// src/crypto.ts
import { hmac } from "@noble/hashes/hmac.js";
import { ripemd160 as nobleRipemd160 } from "@noble/hashes/legacy.js";
import { sha256 as nobleSha256, sha512 as nobleSha512 } from "@noble/hashes/sha2.js";
import * as secp256k1 from "@noble/secp256k1";

// src/base58.ts
var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var ENCODE_TABLE = new Uint8Array(58);
for (let i = 0; i < 58; i++) ENCODE_TABLE[i] = ALPHABET.charCodeAt(i);
var DECODE_TABLE = new Uint8Array(128).fill(255);
for (let i = 0; i < 58; i++) DECODE_TABLE[ALPHABET.charCodeAt(i)] = i;
var ENCODE_FACTOR = 1.365658237309761;
var DECODE_FACTOR = 0.7322476243909465;
var textDecoder = new TextDecoder();
function encode(source) {
  const len = source.length;
  if (len === 0) return "";
  let zeros = 0;
  while (zeros < len && source[zeros] === 0) zeros++;
  const size = (len - zeros) * ENCODE_FACTOR + 1 | 0;
  const b58 = new Uint8Array(size);
  let length = 0;
  for (let i = zeros; i < len; i++) {
    let carry = source[i] & 255;
    let j = 0;
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 256 * b58[k];
      b58[k] = carry % 58;
      carry = carry / 58 | 0;
    }
    length = j;
  }
  let it = size - length;
  while (it !== size && b58[it] === 0) it++;
  const out = new Uint8Array(zeros + (size - it));
  out.fill(49, 0, zeros);
  for (let i = zeros, j = it; j < size; i++, j++) {
    out[i] = ENCODE_TABLE[b58[j]];
  }
  return textDecoder.decode(out);
}
function decode(source) {
  if (source.length === 0) return BBuffer.alloc(0);
  let zeros = 0;
  while (zeros < source.length && source.charCodeAt(zeros) === 49) zeros++;
  const size = (source.length - zeros) * DECODE_FACTOR + 1 | 0;
  const b256 = new Uint8Array(size);
  let length = 0;
  for (let i = zeros; i < source.length; i++) {
    const code = source.charCodeAt(i);
    const digit = code < 128 ? DECODE_TABLE[code] : 255;
    if (digit === 255) {
      throw new Error(`Invalid base58 character "${source[i]}" at position ${i}`);
    }
    let carry = digit;
    let j = 0;
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 58 * b256[k];
      b256[k] = carry & 255;
      carry >>>= 8;
    }
    length = j;
  }
  let it = size - length;
  while (it !== size && b256[it] === 0) it++;
  const outLen = zeros + (size - it);
  const out = BBuffer.alloc(outLen);
  for (let i = zeros, j = it; j < size; i++, j++) {
    out[i] = b256[j];
  }
  return out;
}

// src/bytebuffer.ts
var Long = class _Long {
  static isLong(value) {
    return value instanceof _Long;
  }
  static fromNumber(n) {
    if (!Number.isFinite(n)) throw new Error("Long.fromNumber: non-finite");
    return new _Long(BigInt(Math.trunc(n)));
  }
  static fromString(s, unsigned = true, radix = 10) {
    if (!s || s.length === 0) throw new Error("Long.fromString: empty");
    if (radix === 10) return new _Long(BigInt(s));
    if (radix === 16) return new _Long(BigInt(s.startsWith("0x") ? s : "0x" + s));
    let v = 0n;
    const big = BigInt(radix);
    for (const ch of s) {
      const digit = parseInt(ch, radix);
      if (isNaN(digit)) throw new Error(`Invalid digit for radix ${radix}: ${ch}`);
      v = v * big + BigInt(digit);
    }
    return new _Long(v);
  }
  constructor(value) {
    this.value = value & 0xffffffffffffffffn;
  }
  shiftLeft(n) {
    return new _Long(this.value << BigInt(n));
  }
  or(other) {
    return new _Long(this.value | other.value);
  }
  toString(radix = 10) {
    return this.value.toString(radix);
  }
  /** Low/high 32-bit halves, for little-endian serialisation. */
  getLow32() {
    return Number(this.value & 0xffffffffn) >>> 0;
  }
  getHigh32() {
    return Number(this.value >> 32n & 0xffffffffn) >>> 0;
  }
  toBigInt() {
    return this.value;
  }
};
var LITTLE_ENDIAN_FLAG = 1;
var DEFAULT_CAPACITY = 64;
var _ByteBuffer = class _ByteBuffer {
  constructor(capacity = DEFAULT_CAPACITY, _endian = LITTLE_ENDIAN_FLAG) {
    // `_offset` is the current read/write cursor, matching ByteBuffer's `offset`.
    this._offset = 0;
    // `_limit` is the end of meaningful data after flip() — used by copy() and toBuffer().
    this._limit = -1;
    // `writeOffset` tracks how far we've ever written. Before flip(), offset===writeOffset.
    // After flip(), we may read from 0 up to writeOffset (stored in _limit).
    this.writeOffset = 0;
    // Saved offset from mark() for reset().
    this.markedOffset = -1;
    void _endian;
    const cap = Math.max(capacity | 0, 1);
    this.data = new Uint8Array(cap);
    this.view = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength);
  }
  /**
   * Build a ByteBuffer whose contents are the bytes of a "binary" (Latin-1)
   * string. Call-sites use either (binary, endian) or (binary, capacity, endian);
   * we accept both.
   */
  static fromBinary(binary, capacityOrEndian, _endian) {
    const bytes = binaryToBytes(binary);
    const buf = new _ByteBuffer(Math.max(bytes.length, DEFAULT_CAPACITY));
    buf.data.set(bytes, 0);
    buf.writeOffset = bytes.length;
    buf._offset = 0;
    buf._limit = bytes.length;
    void capacityOrEndian;
    void _endian;
    return buf;
  }
  /* ---- public state accessors (match @ecency/bytebuffer call sites) ---- */
  /** Current read/write cursor. The legacy API exposed this as `.offset`. */
  get offset() {
    return this._offset;
  }
  set offset(v) {
    this._offset = v | 0;
  }
  /** Total capacity of the underlying storage. */
  capacity() {
    return this.data.length;
  }
  /* ---- growth ---- */
  ensure(n) {
    const needed = this._offset + n;
    if (needed <= this.data.length) return;
    let cap = this.data.length;
    while (cap < needed) cap *= 2;
    const next = new Uint8Array(cap);
    next.set(this.data);
    this.data = next;
    this.view = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength);
  }
  /* ---- writers (little-endian) ---- */
  writeByte(value) {
    return this.writeUint8(value);
  }
  writeInt8(value) {
    this.ensure(1);
    this.view.setInt8(this._offset, value);
    this._offset += 1;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  writeUint8(value) {
    this.ensure(1);
    this.view.setUint8(this._offset, value & 255);
    this._offset += 1;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  writeInt16(value) {
    this.ensure(2);
    this.view.setInt16(this._offset, value, true);
    this._offset += 2;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  writeUint16(value) {
    this.ensure(2);
    this.view.setUint16(this._offset, value & 65535, true);
    this._offset += 2;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  writeInt32(value) {
    this.ensure(4);
    this.view.setInt32(this._offset, value | 0, true);
    this._offset += 4;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  writeUint32(value) {
    this.ensure(4);
    this.view.setUint32(this._offset, value >>> 0, true);
    this._offset += 4;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  /** Accepts Long, bigint, number, or decimal string. Always little-endian. */
  writeInt64(value) {
    const big = toBigInt64(value);
    this.ensure(8);
    this.view.setBigInt64(this._offset, big, true);
    this._offset += 8;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  writeUint64(value) {
    const big = toBigUint64(value);
    this.ensure(8);
    this.view.setBigUint64(this._offset, big, true);
    this._offset += 8;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  /** Varint-32, protobuf-style (7 bits per byte, MSB = continuation). */
  writeVarint32(value) {
    let v = value >>> 0;
    while (v >= 128) {
      this.writeUint8(v & 127 | 128);
      v >>>= 7;
    }
    this.writeUint8(v & 127);
    return this;
  }
  /**
   * Write a length-prefixed UTF-8 string: varint32 length followed by bytes.
   * Matches @ecency/bytebuffer's writeVString.
   */
  writeVString(value) {
    const bytes = utf8ToBytes(value);
    this.writeVarint32(bytes.length);
    this.ensure(bytes.length);
    this.data.set(bytes, this._offset);
    this._offset += bytes.length;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  /**
   * Append raw bytes or a string at the current offset. When `data` is a
   * string and `encoding` is 'binary', each char is treated as a single byte.
   */
  append(data, encoding = "binary") {
    let bytes;
    if (typeof data === "string") {
      bytes = encodeString(data, encoding);
    } else if (data instanceof Uint8Array) {
      bytes = data;
    } else if (data instanceof ArrayBuffer) {
      bytes = new Uint8Array(data);
    } else if (Array.isArray(data)) {
      bytes = new Uint8Array(data);
    } else if (data && data.buffer instanceof Uint8Array) {
      bytes = data.buffer;
    } else {
      throw new Error("ByteBuffer.append: unsupported data type");
    }
    this.ensure(bytes.length);
    this.data.set(bytes, this._offset);
    this._offset += bytes.length;
    this.writeOffset = Math.max(this.writeOffset, this._offset);
    return this;
  }
  /* ---- readers ---- */
  readUint8() {
    this.checkReadable(1);
    const v = this.view.getUint8(this._offset);
    this._offset += 1;
    return v;
  }
  readInt8() {
    this.checkReadable(1);
    const v = this.view.getInt8(this._offset);
    this._offset += 1;
    return v;
  }
  readUint16() {
    this.checkReadable(2);
    const v = this.view.getUint16(this._offset, true);
    this._offset += 2;
    return v;
  }
  readInt16() {
    this.checkReadable(2);
    const v = this.view.getInt16(this._offset, true);
    this._offset += 2;
    return v;
  }
  readUint32() {
    this.checkReadable(4);
    const v = this.view.getUint32(this._offset, true);
    this._offset += 4;
    return v;
  }
  readInt32() {
    this.checkReadable(4);
    const v = this.view.getInt32(this._offset, true);
    this._offset += 4;
    return v;
  }
  /** Returns a Long (decimal-string-printable) for call-site compatibility. */
  readUint64() {
    this.checkReadable(8);
    const v = this.view.getBigUint64(this._offset, true);
    this._offset += 8;
    return new Long(v);
  }
  readInt64() {
    this.checkReadable(8);
    const v = this.view.getBigInt64(this._offset, true);
    this._offset += 8;
    return new Long(v & 0xffffffffffffffffn);
  }
  readVarint32() {
    let result = 0;
    let shift = 0;
    for (let i = 0; i < 5; i++) {
      const b = this.readUint8();
      result |= (b & 127) << shift;
      if ((b & 128) === 0) return result >>> 0;
      shift += 7;
    }
    throw new Error("readVarint32: value too large");
  }
  readVString() {
    const len = this.readVarint32();
    this.checkReadable(len);
    const s = bytesToUtf8(this.data, this._offset, this._offset + len);
    this._offset += len;
    return s;
  }
  /* ---- cursor / state management ---- */
  skip(n) {
    this._offset += n;
    return this;
  }
  mark(offset) {
    this.markedOffset = offset === void 0 ? this._offset : offset | 0;
    return this;
  }
  reset() {
    if (this.markedOffset < 0) {
      this._offset = 0;
    } else {
      this._offset = this.markedOffset;
    }
    return this;
  }
  /**
   * Flip from "write" to "read" mode: limit = current offset, offset = 0.
   * Matches @ecency/bytebuffer semantics.
   */
  flip() {
    this._limit = this._offset;
    this._offset = 0;
    return this;
  }
  /* ---- copy / export ---- */
  /**
   * Return a new ByteBuffer containing an independent copy of bytes
   * `[start, end)`. The new buffer is in read mode: offset = 0,
   * limit = end - start. This is a deep copy — the caller cannot alias
   * this buffer's memory through the returned one.
   */
  copy(start = 0, end = this._offset) {
    if (start < 0) start = 0;
    if (end > this.data.length) end = this.data.length;
    if (end < start) end = start;
    const len = end - start;
    const out = new _ByteBuffer(Math.max(len, 1));
    out.data.set(this.data.subarray(start, end), 0);
    out._offset = 0;
    out.writeOffset = len;
    out._limit = len;
    return out;
  }
  /**
   * Return an independent Uint8Array containing the meaningful bytes.
   * After flip(): bytes [0, limit). Otherwise: bytes [0, offset).
   */
  toBuffer() {
    const end = this._limit >= 0 ? this._limit : this._offset;
    const out = new Uint8Array(end);
    out.set(this.data.subarray(0, end));
    return out;
  }
  /** Same bytes as toBuffer(), but wrapped as a BBuffer (Node-Buffer shim). */
  toBBuffer() {
    const end = this._limit >= 0 ? this._limit : this._offset;
    const out = new BBuffer(end);
    out.set(this.data.subarray(0, end));
    return out;
  }
  /** "binary" (Latin-1) string of the meaningful bytes. */
  toBinary() {
    const end = this._limit >= 0 ? this._limit : this._offset;
    return bytesToBinary(this.data, 0, end);
  }
  /**
   * Encode the meaningful bytes. Default is hex (the most common call-site
   * in utils.ts). Accepts 'hex', 'binary', 'utf-8'.
   */
  toString(encoding = "hex") {
    const end = this._limit >= 0 ? this._limit : this._offset;
    return decodeBytes(this.data, encoding, 0, end);
  }
  /* ---- internal ---- */
  checkReadable(n) {
    const end = this._limit >= 0 ? this._limit : this.data.length;
    if (this._offset + n > end) {
      throw new RangeError(
        `ByteBuffer read past end (offset=${this._offset}, need=${n}, limit=${end})`
      );
    }
  }
};
/* ---- static shape compatible with the old library ---- */
_ByteBuffer.DEFAULT_CAPACITY = DEFAULT_CAPACITY;
_ByteBuffer.LITTLE_ENDIAN = LITTLE_ENDIAN_FLAG;
_ByteBuffer.BIG_ENDIAN = 0;
_ByteBuffer.Long = Long;
var ByteBuffer = _ByteBuffer;
function toBigInt64(v) {
  let big;
  if (Long.isLong(v)) big = v.toBigInt();
  else if (typeof v === "bigint") big = v;
  else if (typeof v === "number") big = BigInt(Math.trunc(v));
  else big = BigInt(v);
  const mask = 0xffffffffffffffffn;
  big &= mask;
  if (big >= 0x8000000000000000n) big -= 0x10000000000000000n;
  return big;
}
function toBigUint64(v) {
  let big;
  if (Long.isLong(v)) big = v.toBigInt();
  else if (typeof v === "bigint") big = v;
  else if (typeof v === "number") big = BigInt(Math.trunc(v));
  else big = BigInt(v);
  return big & 0xffffffffffffffffn;
}
ByteBuffer.from = BBuffer.from.bind(BBuffer);
ByteBuffer.alloc = BBuffer.alloc.bind(BBuffer);
ByteBuffer.concat = BBuffer.concat.bind(BBuffer);
var bytebuffer_default = ByteBuffer;

// src/chain/serializer.ts
var VoidSerializer = (_buffer) => {
  throw new Error("Void can not be serialized");
};
var StringSerializer = (buffer, data) => {
  buffer.writeVString(data);
};
var Int8Serializer = (buffer, data) => {
  buffer.writeInt8(data);
};
var Int16Serializer = (buffer, data) => {
  buffer.writeInt16(data);
};
var Int32Serializer = (buffer, data) => {
  buffer.writeInt32(data);
};
var Int64Serializer = (buffer, data) => {
  buffer.writeInt64(data);
};
var UInt8Serializer = (buffer, data) => {
  buffer.writeUint8(data);
};
var UInt16Serializer = (buffer, data) => {
  buffer.writeUint16(data);
};
var UInt32Serializer = (buffer, data) => {
  buffer.writeUint32(data);
};
var UInt64Serializer = (buffer, data) => {
  buffer.writeUint64(data);
};
var BooleanSerializer = (buffer, data) => {
  buffer.writeByte(data ? 1 : 0);
};
var StaticVariantSerializer = (itemSerializers) => (buffer, data) => {
  const [id, item] = data;
  buffer.writeVarint32(id);
  itemSerializers[id](buffer, item);
};
var AssetSerializer = (buffer, data) => {
  const asset = Asset.from(data).steem_symbols();
  const precision = asset.getPrecision();
  buffer.writeInt64(Math.round(asset.amount * Math.pow(10, precision)));
  buffer.writeUint8(precision);
  for (let i = 0; i < 7; i++) {
    buffer.writeUint8(asset.symbol.charCodeAt(i) || 0);
  }
};
var DateSerializer = (buffer, data) => {
  buffer.writeUint32(Math.floor((/* @__PURE__ */ new Date(data + "Z")).getTime() / 1e3));
};
var PublicKeySerializer = (buffer, data) => {
  if (data === null || typeof data === "string" && data.endsWith("1111111111111111111111111111111114T1Anm")) {
    buffer.append(BBuffer.alloc(33, 0));
  } else {
    buffer.append(PublicKey.from(data).key);
  }
};
var BinarySerializer = (size) => (buffer, data) => {
  data = HexBuffer.from(data);
  const len = data.buffer.length;
  if (size) {
    if (len !== size) {
      throw new Error(
        `Unable to serialize binary. Expected ${size} bytes, got ${len}`
      );
    }
  } else {
    buffer.writeVarint32(len);
  }
  buffer.append(data.buffer);
};
var VariableBinarySerializer = BinarySerializer();
var FlatMapSerializer = (keySerializer, valueSerializer) => (buffer, data) => {
  buffer.writeVarint32(data.length);
  for (const [key, value] of data) {
    keySerializer(buffer, key);
    valueSerializer(buffer, value);
  }
};
var ArraySerializer = (itemSerializer) => (buffer, data) => {
  buffer.writeVarint32(data.length);
  for (const item of data) {
    itemSerializer(buffer, item);
  }
};
var ObjectSerializer = (keySerializers) => (buffer, data) => {
  for (const [key, serializer] of keySerializers) {
    try {
      serializer(buffer, data[key]);
    } catch (error) {
      error.message = `${key}: ${error.message}`;
      throw error;
    }
  }
};
var OptionalSerializer = (valueSerializer) => (buffer, data) => {
  if (data) {
    buffer.writeByte(1);
    valueSerializer(buffer, data);
  } else {
    buffer.writeByte(0);
  }
};
var AuthoritySerializer = ObjectSerializer([
  ["weight_threshold", UInt32Serializer],
  ["account_auths", FlatMapSerializer(StringSerializer, UInt16Serializer)],
  ["key_auths", FlatMapSerializer(PublicKeySerializer, UInt16Serializer)]
]);
var BeneficiarySerializer = ObjectSerializer([
  ["account", StringSerializer],
  ["weight", UInt16Serializer]
]);
var PriceSerializer = ObjectSerializer([
  ["base", AssetSerializer],
  ["quote", AssetSerializer]
]);
var ProposalUpdateSerializer = ObjectSerializer([
  ["end_date", DateSerializer]
]);
var SignedBlockHeaderSerializer = ObjectSerializer([
  ["previous", BinarySerializer(20)],
  ["timestamp", DateSerializer],
  ["witness", StringSerializer],
  ["transaction_merkle_root", BinarySerializer(20)],
  ["extensions", ArraySerializer(VoidSerializer)],
  ["witness_signature", BinarySerializer(65)]
]);
var ChainPropertiesSerializer = ObjectSerializer([
  ["account_creation_fee", AssetSerializer],
  ["maximum_block_size", UInt32Serializer],
  ["pxs_interest_rate", UInt16Serializer]
]);
var OperationDataSerializer = (operationId, definitions) => {
  const objectSerializer = ObjectSerializer(definitions);
  return (buffer, data) => {
    buffer.writeVarint32(operationId);
    objectSerializer(buffer, data);
  };
};
var OperationSerializers = {};
OperationSerializers.account_create = OperationDataSerializer(9, [
  ["fee", AssetSerializer],
  ["creator", StringSerializer],
  ["new_account_name", StringSerializer],
  ["owner", AuthoritySerializer],
  ["active", AuthoritySerializer],
  ["posting", AuthoritySerializer],
  ["memo_key", PublicKeySerializer],
  ["json_metadata", StringSerializer]
]);
OperationSerializers.account_create_with_delegation = OperationDataSerializer(
  41,
  [
    ["fee", AssetSerializer],
    ["delegation", AssetSerializer],
    ["creator", StringSerializer],
    ["new_account_name", StringSerializer],
    ["owner", AuthoritySerializer],
    ["active", AuthoritySerializer],
    ["posting", AuthoritySerializer],
    ["memo_key", PublicKeySerializer],
    ["json_metadata", StringSerializer],
    ["extensions", ArraySerializer(VoidSerializer)]
  ]
);
OperationSerializers.account_update = OperationDataSerializer(10, [
  ["account", StringSerializer],
  ["owner", OptionalSerializer(AuthoritySerializer)],
  ["active", OptionalSerializer(AuthoritySerializer)],
  ["posting", OptionalSerializer(AuthoritySerializer)],
  ["memo_key", PublicKeySerializer],
  ["json_metadata", StringSerializer]
]);
OperationSerializers.account_witness_proxy = OperationDataSerializer(13, [
  ["account", StringSerializer],
  ["proxy", StringSerializer]
]);
OperationSerializers.account_witness_vote = OperationDataSerializer(12, [
  ["account", StringSerializer],
  ["witness", StringSerializer],
  ["approve", BooleanSerializer]
]);
OperationSerializers.cancel_transfer_from_savings = OperationDataSerializer(
  34,
  [
    ["from", StringSerializer],
    ["request_id", UInt32Serializer]
  ]
);
OperationSerializers.change_recovery_account = OperationDataSerializer(26, [
  ["account_to_recover", StringSerializer],
  ["new_recovery_account", StringSerializer],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.claim_account = OperationDataSerializer(22, [
  ["creator", StringSerializer],
  ["fee", AssetSerializer],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.claim_reward_balance = OperationDataSerializer(39, [
  ["account", StringSerializer],
  ["reward_pixa", AssetSerializer],
  ["reward_pxs", AssetSerializer],
  ["reward_vests", AssetSerializer]
]);
OperationSerializers.comment = OperationDataSerializer(1, [
  ["parent_author", StringSerializer],
  ["parent_permlink", StringSerializer],
  ["author", StringSerializer],
  ["permlink", StringSerializer],
  ["title", StringSerializer],
  ["body", StringSerializer],
  ["json_metadata", StringSerializer]
]);
OperationSerializers.comment_options = OperationDataSerializer(19, [
  ["author", StringSerializer],
  ["permlink", StringSerializer],
  ["max_accepted_payout", AssetSerializer],
  ["percent_pxs", UInt16Serializer],
  ["allow_votes", BooleanSerializer],
  ["allow_curation_rewards", BooleanSerializer],
  [
    "extensions",
    ArraySerializer(
      StaticVariantSerializer([
        ObjectSerializer([
          ["beneficiaries", ArraySerializer(BeneficiarySerializer)]
        ])
      ])
    )
  ]
]);
OperationSerializers.convert = OperationDataSerializer(8, [
  ["owner", StringSerializer],
  ["requestid", UInt32Serializer],
  ["amount", AssetSerializer]
]);
OperationSerializers.create_claimed_account = OperationDataSerializer(23, [
  ["creator", StringSerializer],
  ["new_account_name", StringSerializer],
  ["owner", AuthoritySerializer],
  ["active", AuthoritySerializer],
  ["posting", AuthoritySerializer],
  ["memo_key", PublicKeySerializer],
  ["json_metadata", StringSerializer],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.custom = OperationDataSerializer(15, [
  ["required_auths", ArraySerializer(StringSerializer)],
  ["id", UInt16Serializer],
  ["data", VariableBinarySerializer]
]);
OperationSerializers.custom_binary = OperationDataSerializer(35, [
  ["required_owner_auths", ArraySerializer(StringSerializer)],
  ["required_active_auths", ArraySerializer(StringSerializer)],
  ["required_posting_auths", ArraySerializer(StringSerializer)],
  ["required_auths", ArraySerializer(AuthoritySerializer)],
  ["id", StringSerializer],
  ["data", VariableBinarySerializer]
]);
OperationSerializers.custom_json = OperationDataSerializer(18, [
  ["required_auths", ArraySerializer(StringSerializer)],
  ["required_posting_auths", ArraySerializer(StringSerializer)],
  ["id", StringSerializer],
  ["json", StringSerializer]
]);
OperationSerializers.decline_voting_rights = OperationDataSerializer(36, [
  ["account", StringSerializer],
  ["decline", BooleanSerializer]
]);
OperationSerializers.delegate_vesting_shares = OperationDataSerializer(40, [
  ["delegator", StringSerializer],
  ["delegatee", StringSerializer],
  ["vesting_shares", AssetSerializer]
]);
OperationSerializers.delete_comment = OperationDataSerializer(17, [
  ["author", StringSerializer],
  ["permlink", StringSerializer]
]);
OperationSerializers.escrow_approve = OperationDataSerializer(31, [
  ["from", StringSerializer],
  ["to", StringSerializer],
  ["agent", StringSerializer],
  ["who", StringSerializer],
  ["escrow_id", UInt32Serializer],
  ["approve", BooleanSerializer]
]);
OperationSerializers.escrow_dispute = OperationDataSerializer(28, [
  ["from", StringSerializer],
  ["to", StringSerializer],
  ["agent", StringSerializer],
  ["who", StringSerializer],
  ["escrow_id", UInt32Serializer]
]);
OperationSerializers.escrow_release = OperationDataSerializer(29, [
  ["from", StringSerializer],
  ["to", StringSerializer],
  ["agent", StringSerializer],
  ["who", StringSerializer],
  ["receiver", StringSerializer],
  ["escrow_id", UInt32Serializer],
  ["pxs_amount", AssetSerializer],
  ["pixa_amount", AssetSerializer]
]);
OperationSerializers.escrow_transfer = OperationDataSerializer(27, [
  ["from", StringSerializer],
  ["to", StringSerializer],
  ["pxs_amount", AssetSerializer],
  ["pixa_amount", AssetSerializer],
  ["escrow_id", UInt32Serializer],
  ["agent", StringSerializer],
  ["fee", AssetSerializer],
  ["json_meta", StringSerializer],
  ["ratification_deadline", DateSerializer],
  ["escrow_expiration", DateSerializer]
]);
OperationSerializers.feed_publish = OperationDataSerializer(7, [
  ["publisher", StringSerializer],
  ["exchange_rate", PriceSerializer]
]);
OperationSerializers.limit_order_cancel = OperationDataSerializer(6, [
  ["owner", StringSerializer],
  ["orderid", UInt32Serializer]
]);
OperationSerializers.limit_order_create = OperationDataSerializer(5, [
  ["owner", StringSerializer],
  ["orderid", UInt32Serializer],
  ["amount_to_sell", AssetSerializer],
  ["min_to_receive", AssetSerializer],
  ["fill_or_kill", BooleanSerializer],
  ["expiration", DateSerializer]
]);
OperationSerializers.limit_order_create2 = OperationDataSerializer(21, [
  ["owner", StringSerializer],
  ["orderid", UInt32Serializer],
  ["amount_to_sell", AssetSerializer],
  ["exchange_rate", PriceSerializer],
  ["fill_or_kill", BooleanSerializer],
  ["expiration", DateSerializer]
]);
OperationSerializers.recover_account = OperationDataSerializer(25, [
  ["account_to_recover", StringSerializer],
  ["new_owner_authority", AuthoritySerializer],
  ["recent_owner_authority", AuthoritySerializer],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.report_over_production = OperationDataSerializer(16, [
  ["reporter", StringSerializer],
  ["first_block", SignedBlockHeaderSerializer],
  ["second_block", SignedBlockHeaderSerializer]
]);
OperationSerializers.request_account_recovery = OperationDataSerializer(24, [
  ["recovery_account", StringSerializer],
  ["account_to_recover", StringSerializer],
  ["new_owner_authority", AuthoritySerializer],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.reset_account = OperationDataSerializer(37, [
  ["reset_account", StringSerializer],
  ["account_to_reset", StringSerializer],
  ["new_owner_authority", AuthoritySerializer]
]);
OperationSerializers.set_reset_account = OperationDataSerializer(38, [
  ["account", StringSerializer],
  ["current_reset_account", StringSerializer],
  ["reset_account", StringSerializer]
]);
OperationSerializers.set_withdraw_vesting_route = OperationDataSerializer(20, [
  ["from_account", StringSerializer],
  ["to_account", StringSerializer],
  ["percent", UInt16Serializer],
  ["auto_vest", BooleanSerializer]
]);
OperationSerializers.transfer = OperationDataSerializer(2, [
  ["from", StringSerializer],
  ["to", StringSerializer],
  ["amount", AssetSerializer],
  ["memo", StringSerializer]
]);
OperationSerializers.transfer_from_savings = OperationDataSerializer(33, [
  ["from", StringSerializer],
  ["request_id", UInt32Serializer],
  ["to", StringSerializer],
  ["amount", AssetSerializer],
  ["memo", StringSerializer]
]);
OperationSerializers.transfer_to_savings = OperationDataSerializer(32, [
  ["from", StringSerializer],
  ["to", StringSerializer],
  ["amount", AssetSerializer],
  ["memo", StringSerializer]
]);
OperationSerializers.transfer_to_vesting = OperationDataSerializer(3, [
  ["from", StringSerializer],
  ["to", StringSerializer],
  ["amount", AssetSerializer]
]);
OperationSerializers.vote = OperationDataSerializer(0, [
  ["voter", StringSerializer],
  ["author", StringSerializer],
  ["permlink", StringSerializer],
  ["weight", Int16Serializer]
]);
OperationSerializers.withdraw_vesting = OperationDataSerializer(4, [
  ["account", StringSerializer],
  ["vesting_shares", AssetSerializer]
]);
OperationSerializers.witness_update = OperationDataSerializer(11, [
  ["owner", StringSerializer],
  ["url", StringSerializer],
  ["block_signing_key", PublicKeySerializer],
  ["props", ChainPropertiesSerializer],
  ["fee", AssetSerializer]
]);
OperationSerializers.witness_set_properties = OperationDataSerializer(42, [
  ["owner", StringSerializer],
  ["props", FlatMapSerializer(StringSerializer, VariableBinarySerializer)],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.account_update2 = OperationDataSerializer(43, [
  ["account", StringSerializer],
  ["owner", OptionalSerializer(AuthoritySerializer)],
  ["active", OptionalSerializer(AuthoritySerializer)],
  ["posting", OptionalSerializer(AuthoritySerializer)],
  ["memo_key", OptionalSerializer(PublicKeySerializer)],
  ["json_metadata", StringSerializer],
  ["posting_json_metadata", StringSerializer],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.create_proposal = OperationDataSerializer(44, [
  ["creator", StringSerializer],
  ["receiver", StringSerializer],
  ["start_date", DateSerializer],
  ["end_date", DateSerializer],
  ["daily_pay", AssetSerializer],
  ["subject", StringSerializer],
  ["permlink", StringSerializer],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.update_proposal_votes = OperationDataSerializer(45, [
  ["voter", StringSerializer],
  ["proposal_ids", ArraySerializer(Int64Serializer)],
  ["approve", BooleanSerializer],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.remove_proposal = OperationDataSerializer(46, [
  ["proposal_owner", StringSerializer],
  ["proposal_ids", ArraySerializer(Int64Serializer)],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
OperationSerializers.update_proposal = OperationDataSerializer(47, [
  ["proposal_id", UInt64Serializer],
  ["creator", StringSerializer],
  ["daily_pay", AssetSerializer],
  ["subject", StringSerializer],
  ["permlink", StringSerializer],
  ["extensions", ArraySerializer(StaticVariantSerializer([VoidSerializer, ProposalUpdateSerializer]))]
]);
OperationSerializers.collateralized_convert = OperationDataSerializer(48, [
  ["owner", StringSerializer],
  ["requestid", UInt32Serializer],
  ["amount", AssetSerializer]
]);
OperationSerializers.recurrent_transfer = OperationDataSerializer(49, [
  ["from", StringSerializer],
  ["to", StringSerializer],
  ["amount", AssetSerializer],
  ["memo", StringSerializer],
  ["recurrence", UInt16Serializer],
  ["executions", UInt16Serializer],
  ["extensions", ArraySerializer(VoidSerializer)]
]);
var OperationSerializer = (buffer, operation) => {
  const serializer = OperationSerializers[operation[0]];
  if (!serializer) {
    throw new Error(`No serializer for operation: ${operation[0]}`);
  }
  try {
    serializer(buffer, operation[1]);
  } catch (error) {
    error.message = `${operation[0]}: ${error.message}`;
    throw error;
  }
};
var TransactionSerializer = ObjectSerializer([
  ["ref_block_num", UInt16Serializer],
  ["ref_block_prefix", UInt32Serializer],
  ["expiration", DateSerializer],
  ["operations", ArraySerializer(OperationSerializer)],
  ["extensions", ArraySerializer(StringSerializer)]
]);
var EncryptedMemoSerializer = ObjectSerializer([
  ["from", PublicKeySerializer],
  ["to", PublicKeySerializer],
  ["nonce", UInt64Serializer],
  ["check", UInt32Serializer],
  ["encrypted", BinarySerializer()]
]);
var Types = {
  Array: ArraySerializer,
  Asset: AssetSerializer,
  Authority: AuthoritySerializer,
  Binary: BinarySerializer,
  Boolean: BooleanSerializer,
  Date: DateSerializer,
  EncryptedMemo: EncryptedMemoSerializer,
  FlatMap: FlatMapSerializer,
  Int16: Int16Serializer,
  Int32: Int32Serializer,
  Int64: Int64Serializer,
  Int8: Int8Serializer,
  Object: ObjectSerializer,
  Operation: OperationSerializer,
  Optional: OptionalSerializer,
  Price: PriceSerializer,
  PublicKey: PublicKeySerializer,
  StaticVariant: StaticVariantSerializer,
  String: StringSerializer,
  Transaction: TransactionSerializer,
  UInt16: UInt16Serializer,
  UInt32: UInt32Serializer,
  UInt64: UInt64Serializer,
  UInt8: UInt8Serializer,
  Void: VoidSerializer
};

// src/witness.ts
var serialize = (serializer, data) => {
  const buffer = new bytebuffer_default(
    bytebuffer_default.DEFAULT_CAPACITY,
    bytebuffer_default.LITTLE_ENDIAN
  );
  serializer(buffer, data);
  buffer.flip();
  return buffer.toString("hex");
};
var buildWitnessUpdateOp = (owner, props) => {
  const data = {
    extensions: [],
    owner,
    props: []
  };
  for (const key of Object.keys(props)) {
    let type;
    switch (key) {
      case "key":
      case "new_signing_key":
        type = Types.PublicKey;
        break;
      case "account_subsidy_budget":
      case "account_subsidy_decay":
      case "maximum_block_size":
        type = Types.UInt32;
        break;
      case "pxs_interest_rate":
        type = Types.UInt16;
        break;
      case "url":
        type = Types.String;
        break;
      case "pxs_exchange_rate":
        type = Types.Price;
        break;
      case "account_creation_fee":
        type = Types.Asset;
        break;
      default:
        throw new Error(`Unknown witness prop: ${key}`);
    }
    data.props.push([key, serialize(type, props[key])]);
  }
  data.props.sort((a, b) => a[0].localeCompare(b[0]));
  return ["witness_set_properties", data];
};

// src/crypto.ts
secp256k1.hashes.sha256 = nobleSha256;
secp256k1.hashes.hmacSha256 = (key, msg) => hmac(nobleSha256, key, msg);
var utf8 = new TextEncoder();
function toBytes(input) {
  return typeof input === "string" ? utf8.encode(input) : input;
}
function ripemd160(input) {
  return BBuffer.from(nobleRipemd160(toBytes(input)));
}
function sha256(input) {
  return BBuffer.from(nobleSha256(toBytes(input)));
}
function sha512(input) {
  return BBuffer.from(nobleSha512(toBytes(input)));
}
function doubleSha256(input) {
  return sha256(sha256(input));
}
function bytesToBigInt(bytes) {
  let n = 0n;
  for (const b of bytes) {
    n = n << 8n | BigInt(b);
  }
  return n;
}
var NETWORK_ID = BBuffer.from([128]);
function encodePublic(key, prefix) {
  const checksum = ripemd160(key);
  return prefix + encode(BBuffer.concat([key, checksum.slice(0, 4)]));
}
function decodePublic(encodedKey) {
  const prefix = encodedKey.slice(0, 3);
  assert_default.equal(prefix.length, 3, "public key invalid prefix");
  encodedKey = encodedKey.slice(3);
  const buffer = decode(encodedKey);
  const checksum = buffer.slice(-4);
  const key = buffer.slice(0, -4);
  const checksumVerify = ripemd160(key).slice(0, 4);
  assert_default.deepEqual(checksumVerify, checksum, "public key checksum mismatch");
  return { key, prefix };
}
function encodePrivate(key) {
  assert_default.equal(key.readUInt8(0), 128, "private key network id mismatch");
  const checksum = doubleSha256(key);
  return encode(BBuffer.concat([key, checksum.slice(0, 4)]));
}
function decodePrivate(encodedKey) {
  const buffer = decode(encodedKey);
  assert_default.deepEqual(
    buffer.slice(0, 1),
    NETWORK_ID,
    "private key network id mismatch"
  );
  const checksum = buffer.slice(-4);
  const key = buffer.slice(0, -4);
  const checksumVerify = doubleSha256(key).slice(0, 4);
  assert_default.deepEqual(checksumVerify, checksum, "private key checksum mismatch");
  return key;
}
function isCanonicalSignature(signature) {
  return !(signature[0] & 128) && !(signature[0] === 0 && !(signature[1] & 128)) && !(signature[32] & 128) && !(signature[32] === 0 && !(signature[33] & 128));
}
function isWif(privWif) {
  try {
    const bufWif = BBuffer.from(decode(privWif));
    const privKey = bufWif.slice(0, -4);
    const checksum = bufWif.slice(-4);
    let newChecksum = sha256(privKey);
    newChecksum = sha256(newChecksum);
    newChecksum = newChecksum.slice(0, 4);
    return checksum.toString() === newChecksum.toString();
  } catch {
    return false;
  }
}
var PublicKey = class _PublicKey {
  constructor(key, prefix = DEFAULT_ADDRESS_PREFIX) {
    this.key = key;
    this.prefix = prefix;
    assert_default(secp256k1.utils.isValidPublicKey(key), "invalid public key");
    this.uncompressed = BBuffer.from(secp256k1.Point.fromBytes(key).toBytes(false));
  }
  static fromBuffer(key) {
    assert_default(secp256k1.utils.isValidPublicKey(key), "invalid buffer as public key");
    return { key };
  }
  /**
   * Create a new instance from a WIF-encoded key.
   */
  static fromString(wif) {
    const { key, prefix } = decodePublic(wif);
    return new _PublicKey(key, prefix);
  }
  /**
   * Create a new instance.
   */
  static from(value) {
    if (value instanceof _PublicKey) {
      return value;
    } else {
      return _PublicKey.fromString(value);
    }
  }
  /**
   * Verify a 32-byte signature.
   * @param message 32-byte message to verify.
   * @param signature Signature to verify.
   */
  verify(message, signature) {
    return secp256k1.verify(signature.data, message, this.key, { prehash: false });
  }
  /**
   * Return a WIF-encoded representation of the key.
   */
  toString() {
    return encodePublic(this.key, this.prefix);
  }
  /**
   * Return JSON representation of this key, same as toString().
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Used by `utils.inspect` and `console.log` in node.js.
   */
  inspect() {
    return `PublicKey: ${this.toString()}`;
  }
};
var PrivateKey = class _PrivateKey {
  constructor(key) {
    this.key = key;
    assert_default(secp256k1.utils.isValidSecretKey(key), "invalid private key");
  }
  /**
   * Convenience to create a new instance from WIF string or buffer.
   */
  static from(value) {
    if (typeof value === "string") {
      return _PrivateKey.fromString(value);
    } else {
      return new _PrivateKey(value);
    }
  }
  /**
   * Create a new instance from a WIF-encoded key.
   */
  static fromString(wif) {
    return new _PrivateKey(decodePrivate(wif).slice(1));
  }
  /**
   * Create a new instance from a seed.
   */
  static fromSeed(seed) {
    return new _PrivateKey(sha256(seed));
  }
  /**
   * Create key from username and password.
   */
  static fromLogin(username, password, role = "active") {
    const seed = username + role + password;
    return _PrivateKey.fromSeed(seed);
  }
  /**
   * Multiply a public key by this private key's scalar. Equivalent to the old
   * secp256k1-node `publicKeyTweakMul(pub, secret, compressed=false)`.
   *
   * Implemented via noble's Point math: convert pub bytes to a Point, convert
   * this.key (big-endian 32-byte scalar) to a bigint, multiply, and re-encode
   * as uncompressed (matching the old `false` compressed flag).
   */
  multiply(pub) {
    const scalar = bytesToBigInt(this.key);
    const point = secp256k1.Point.fromBytes(pub.key);
    return BBuffer.from(point.multiply(scalar).toBytes(false));
  }
  /**
   * Sign message.
   * @param message 32-byte message (typically a sha256 digest).
   *
   * Noble's sync `sign` is deterministic RFC6979 with `lowS` enforced, BUT
   * "lowS" only constrains `s <= n/2`. The Hive/Pixa wire format additionally
   * requires both `r` and `s` to have their high byte bit clear (see
   * `isCanonicalSignature`) — a stricter predicate than lowS. Roughly a
   * quarter of RFC6979 signatures fail it, so we reproduce the original
   * secp256k1-node retry loop: perturb the RFC6979 nonce via `extraEntropy`
   * until the resulting signature passes `isCanonicalSignature`.
   *
   * Important: `extraEntropy` only mixes into nonce derivation — it does NOT
   * change the message being signed. The returned signature still verifies
   * (and recovers) against the original `message`.
   *
   * `prehash: false` because `message` is already a digest; noble would
   * otherwise sha256 it a second time.
   */
  sign(message) {
    let sigData;
    let recovery;
    let attempts = 0;
    do {
      const extraEntropy = attempts === 0 ? false : BBuffer.alloc(32, attempts);
      const recovered = secp256k1.sign(message, this.key, {
        prehash: false,
        format: "recovered",
        extraEntropy
      });
      recovery = recovered[0];
      sigData = recovered.slice(1);
      attempts++;
      assert_default(attempts < 64, "unable to find canonical signature");
    } while (!isCanonicalSignature(sigData));
    return new Signature(BBuffer.from(sigData), recovery);
  }
  /**
   * Derive the public key for this private key.
   */
  createPublic(prefix) {
    return new PublicKey(secp256k1.getPublicKey(this.key, true), prefix);
  }
  /**
   * Return a WIF-encoded representation of the key.
   */
  toString() {
    return encodePrivate(BBuffer.concat([NETWORK_ID, this.key]));
  }
  /**
   * Used by `utils.inspect` and `console.log` in node.js. Does not show the full key
   * to get the full encoded key you need to explicitly call {@link toString}.
   */
  inspect() {
    const key = this.toString();
    return `PrivateKey: ${key.slice(0, 6)}...${key.slice(-6)}`;
  }
  /**
   * Get shared secret for memo cryptography.
   *
   * The Hive/Pixa memo protocol is: multiply peer's pubkey point by our
   * private scalar, take the 32-byte x-coordinate, sha512 it. `getSharedSecret`
   * returns the compressed-encoded shared point (33 bytes: parity byte + x);
   * slicing off byte 0 gives us exactly the x-coordinate the protocol wants.
   *
   * This replaces the previous bigi + ecurve point multiplication. Verified
   * that both paths produce byte-for-byte identical output.
   */
  get_shared_secret(public_key) {
    const sharedCompressed = secp256k1.getSharedSecret(this.key, public_key.key, true);
    const xCoord = sharedCompressed.slice(1);
    return sha512(xCoord);
  }
};
var Signature = class _Signature {
  constructor(data, recovery) {
    assert_default.equal(data.length, 64, "invalid signature");
    this.data = data instanceof BBuffer ? data : BBuffer.from(data);
    this.recovery = recovery;
  }
  static fromBuffer(buffer) {
    assert_default.equal(buffer.length, 65, "invalid signature");
    const recovery = buffer.readUInt8(0) - 31;
    const data = buffer.slice(1);
    return new _Signature(data, recovery);
  }
  static fromString(string) {
    return _Signature.fromBuffer(BBuffer.from(string, "hex"));
  }
  /**
   * Recover public key from signature by providing original signed message.
   * @param message 32-byte message that was used to create the signature.
   *
   * `@noble/secp256k1` v3's `recoverPublicKey` takes the "recovered" format:
   * a 65-byte Uint8Array laid out as [recovery_byte(1) || r(32) || s(32)].
   * Note that's *recovery first*, unlike our internal wire format
   * (`toBuffer` below) which puts `recovery + 31` first then the 64-byte
   * compact sig. Same shape, different byte values — we just rebuild it.
   *
   * `prehash: false` because the message is already a sha256 digest.
   */
  recover(message, prefix) {
    const recovered = new Uint8Array(65);
    recovered[0] = this.recovery;
    recovered.set(this.data, 1);
    return new PublicKey(
      secp256k1.recoverPublicKey(recovered, message, { prehash: false }),
      prefix
    );
  }
  toBuffer() {
    const buffer = BBuffer.alloc(65);
    buffer.writeUInt8(this.recovery + 31, 0);
    this.data.copy(buffer, 1);
    return buffer;
  }
  toString() {
    return this.toBuffer().toString("hex");
  }
};
function transactionDigest(transaction, chainId = DEFAULT_CHAIN_ID) {
  const buffer = new bytebuffer_default(
    bytebuffer_default.DEFAULT_CAPACITY,
    bytebuffer_default.LITTLE_ENDIAN
  );
  try {
    Types.Transaction(buffer, transaction);
  } catch (cause) {
    throw new VError(
      { cause, name: "SerializationError" },
      "Unable to serialize transaction"
    );
  }
  buffer.flip();
  const transactionData = BBuffer.from(buffer.toBuffer());
  const digest = sha256(BBuffer.concat([chainId, transactionData]));
  return digest;
}
function signTransaction(transaction, keys, chainId = DEFAULT_CHAIN_ID) {
  const digest = transactionDigest(transaction, chainId);
  const signedTransaction = copy(transaction);
  if (!signedTransaction.signatures) {
    signedTransaction.signatures = [];
  }
  if (!Array.isArray(keys)) {
    keys = [keys];
  }
  for (const key of keys) {
    const signature = key.sign(digest);
    signedTransaction.signatures.push(signature.toString());
  }
  return signedTransaction;
}
function generateTrxId(transaction) {
  const buffer = new bytebuffer_default(
    bytebuffer_default.DEFAULT_CAPACITY,
    bytebuffer_default.LITTLE_ENDIAN
  );
  try {
    Types.Transaction(buffer, transaction);
  } catch (cause) {
    throw new VError(
      { cause, name: "SerializationError" },
      "Unable to serialize transaction"
    );
  }
  buffer.flip();
  const transactionData = BBuffer.from(buffer.toBuffer());
  return cryptoUtils.sha256(transactionData).toString("hex").slice(0, 40);
}
var cryptoUtils = {
  decodePrivate,
  doubleSha256,
  encodePrivate,
  encodePublic,
  generateTrxId,
  isCanonicalSignature,
  isWif,
  ripemd160,
  sha256,
  signTransaction,
  transactionDigest
};
registerCrypto({
  PrivateKey,
  PublicKey,
  buildWitnessUpdateOp: (owner, props) => buildWitnessUpdateOp(owner, props),
  generateTrxId,
  signTransaction
});

// src/chain/deserializer.ts
var PublicKeyDeserializer = (buf) => {
  const c = fixed_buf(buf, 33);
  return PublicKey.fromBuffer(c);
};
var UInt64Deserializer = (b) => b.readUint64();
var UInt32Deserializer = (b) => b.readUint32();
var BinaryDeserializer = (b) => {
  const len = b.readVarint32();
  const b_copy = b.copy(b.offset, b.offset + len);
  b.skip(len);
  return BBuffer.from(b_copy.toBinary(), "binary");
};
var BufferDeserializer = (keyDeserializers) => (buf) => {
  const obj = {};
  if (!(buf instanceof bytebuffer_default)) {
    buf = bytebuffer_default.fromBinary(buf.toString("binary"), bytebuffer_default.LITTLE_ENDIAN);
  }
  for (const [key, deserializer] of keyDeserializers) {
    try {
      obj[key] = deserializer(buf);
    } catch (error) {
      error.message = `${key}: ${error.message}`;
      throw error;
    }
  }
  return obj;
};
function fixed_buf(b, len) {
  if (!b) {
    throw Error("No buffer found on first parameter");
  } else {
    const b_copy = b.copy(b.offset, b.offset + len);
    b.skip(len);
    return BBuffer.from(b_copy.toBinary(), "binary");
  }
}
var EncryptedMemoDeserializer = BufferDeserializer([
  ["from", PublicKeyDeserializer],
  ["to", PublicKeyDeserializer],
  ["nonce", UInt64Deserializer],
  ["check", UInt32Deserializer],
  ["encrypted", BinaryDeserializer]
]);
var types = {
  EncryptedMemoD: EncryptedMemoDeserializer
};

// src/helpers/aes.ts
import { cbc } from "@noble/ciphers/aes.js";
import { sha256 as sha2562, sha512 as sha5122 } from "@noble/hashes/sha2.js";
import { randomBytes } from "@noble/hashes/utils.js";
var encrypt = (private_key, public_key, message, nonce = uniqueNonce()) => crypt(private_key, public_key, nonce, message);
var decrypt = (private_key, public_key, nonce, message, checksum) => crypt(private_key, public_key, nonce, message, checksum).message;
var crypt = (private_key, public_key, nonce, message, checksum) => {
  const nonceL = toLongObj(nonce);
  const S = private_key.get_shared_secret(public_key);
  let ebuf = new bytebuffer_default(
    bytebuffer_default.DEFAULT_CAPACITY,
    bytebuffer_default.LITTLE_ENDIAN
  );
  ebuf.writeUint64(nonceL);
  ebuf.append(S.toString("binary"), "binary");
  ebuf = BBuffer.from(ebuf.copy(0, ebuf.offset).toBinary(), "binary");
  const encryption_key = BBuffer.from(sha5122(ebuf));
  const iv = encryption_key.slice(32, 48);
  const tag = encryption_key.slice(0, 32);
  const check = BBuffer.from(sha2562(encryption_key)).slice(0, 4);
  const cbuf = bytebuffer_default.fromBinary(
    check.toString("binary"),
    bytebuffer_default.DEFAULT_CAPACITY,
    bytebuffer_default.LITTLE_ENDIAN
  );
  const check32 = cbuf.readUint32();
  if (checksum) {
    if (check32 !== checksum) {
      throw new Error("Invalid key");
    }
    message = cryptoJsDecrypt(message, tag, iv);
  } else {
    message = cryptoJsEncrypt(message, tag, iv);
  }
  return { nonce: nonceL, message, checksum: check32 };
};
var cryptoJsDecrypt = (message, tag, iv) => {
  assert_default(message, "Missing cipher text");
  return BBuffer.from(cbc(tag, iv).decrypt(message));
};
var cryptoJsEncrypt = (message, tag, iv) => {
  assert_default(message, "Missing plain text");
  return BBuffer.from(cbc(tag, iv).encrypt(message));
};
var unique_nonce_entropy = null;
var uniqueNonce = () => {
  if (unique_nonce_entropy === null) {
    const uint8randomArr = randomBytes(2);
    unique_nonce_entropy = Math.round(uint8randomArr[0] << 8 | uint8randomArr[1]);
  }
  let long = Long.fromNumber(Date.now());
  const entropy = ++unique_nonce_entropy % 65535;
  long = long.shiftLeft(16).or(Long.fromNumber(entropy));
  return long.toString();
};
var toLongObj = (o) => o ? Long.isLong(o) ? o : Long.fromString(o) : o;

// src/memo.ts
var encode2 = (private_key, public_key, memo, testNonce) => {
  if (!memo.startsWith("#")) {
    return memo;
  }
  memo = memo.substring(1);
  checkEncryption();
  private_key = toPrivateObj(private_key);
  public_key = toPublicObj(public_key);
  const mbuf = new bytebuffer_default(
    bytebuffer_default.DEFAULT_CAPACITY,
    bytebuffer_default.LITTLE_ENDIAN
  );
  mbuf.writeVString(memo);
  const memoBuffer = BBuffer.from(mbuf.copy(0, mbuf.offset).toBinary(), "binary");
  const { nonce, message, checksum } = encrypt(
    private_key,
    public_key,
    memoBuffer,
    testNonce
  );
  const mbuf2 = new bytebuffer_default(
    bytebuffer_default.DEFAULT_CAPACITY,
    bytebuffer_default.LITTLE_ENDIAN
  );
  Types.EncryptedMemo(mbuf2, {
    check: checksum,
    encrypted: message,
    from: private_key.createPublic(),
    nonce,
    to: public_key
  });
  mbuf2.flip();
  const data = BBuffer.from(mbuf2.toBuffer());
  return "#" + encode(data);
};
var decode2 = (private_key, memo) => {
  if (!memo.startsWith("#")) {
    return memo;
  }
  memo = memo.substring(1);
  checkEncryption();
  private_key = toPrivateObj(private_key);
  memo = decode(memo);
  let memoBuffer = types.EncryptedMemoD(BBuffer.from(memo, "binary"));
  const { from, to, nonce, check, encrypted } = memoBuffer;
  const pubkey = private_key.createPublic().toString();
  const otherpub = pubkey === new PublicKey(from.key).toString() ? new PublicKey(to.key) : new PublicKey(from.key);
  memoBuffer = decrypt(private_key, otherpub, nonce, encrypted, check);
  const mbuf = bytebuffer_default.fromBinary(
    memoBuffer.toString("binary"),
    bytebuffer_default.LITTLE_ENDIAN
  );
  try {
    mbuf.mark();
    return "#" + mbuf.readVString();
  } catch (e) {
    mbuf.reset();
    memo = BBuffer.from(mbuf.toString("binary"), "binary").toString("utf-8");
    return "#" + memo;
  }
};
var encodeTest;
var checkEncryption = () => {
  if (encodeTest === void 0) {
    let plaintext;
    encodeTest = true;
    try {
      const wif = "5JdeC9P7Pbd1uGdFVEsJ41EkEnADbbHGq6p1BwFxm6txNBsQnsw";
      const pubkey = "STM8m5UgaFAAYQRuaNejYdS8FVLVp9Ss3K1qAVk5de6F8s3HnVbvA";
      const cyphertext = encode2(wif, pubkey, "#memo\u7231");
      plaintext = decode2(wif, cyphertext);
    } catch (e) {
      throw new Error(e);
    } finally {
      encodeTest = plaintext === "#memo\u7231";
    }
  }
  if (encodeTest === false) {
    throw new Error("This environment does not support encryption.");
  }
};
var toPrivateObj = (o) => o ? o.key ? o : PrivateKey.fromString(o) : o;
var toPublicObj = (o) => o ? o.key ? o : PublicKey.fromString(o) : o;
var Memo = {
  decode: decode2,
  encode: encode2
};

export {
  Types,
  NETWORK_ID,
  PublicKey,
  PrivateKey,
  Signature,
  cryptoUtils,
  Memo
};
//# sourceMappingURL=chunk-P2LMANI2.mjs.map
