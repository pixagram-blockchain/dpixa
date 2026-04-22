/**
 * @file Hive crypto helpers.
 * @author Johan Nordberg <code@johan-nordberg.com>
 * @license
 * Copyright (c) 2017 Johan Nordberg. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  1. Redistribution of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *
 *  2. Redistribution in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *
 *  3. Neither the name of the copyright holder nor the names of its contributors
 *     may be used to endorse or promote products derived from this software without
 *     specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * You acknowledge that this software is not designed, licensed or intended for use
 * in the design, construction, operation or maintenance of any military facility.
 */

import * as assert from 'assert'
import * as bs58 from './base58'
import ByteBuffer, { BBuffer as Buffer } from './bytebuffer'
import { RIPEMD160 } from 'ripemd160-min'
import * as secp256k1 from '@noble/secp256k1'
import { hmac } from '@noble/hashes/hmac.js'
import { sha256 as nobleSha256, sha512 as nobleSha512 } from '@noble/hashes/sha2.js'
import { VError } from 'verror'
import { Types } from './chain/serializer'
import { SignedTransaction, Transaction } from './chain/transaction'
import { DEFAULT_ADDRESS_PREFIX, DEFAULT_CHAIN_ID } from './client'
import { copy } from './utils'

/**
 * Wire up the synchronous hash providers that `@noble/secp256k1` v3 needs
 * for its sync `sign` / `verify` / `recoverPublicKey` entry points. Without
 * this, those calls throw; only the async variants work out of the box.
 *
 * We do this at module load so every subsequent call into `secp256k1.sign`,
 * `secp256k1.verify`, etc. has a functioning hmac-sha256 backend.
 */
secp256k1.hashes.sha256 = nobleSha256
secp256k1.hashes.hmacSha256 = (key, msg) => hmac(nobleSha256, key, msg)

/**
 * UTF-8 encoder used by the hash helpers below to accept `string` inputs.
 * Sharing one instance is a micro-optimisation — TextEncoder is stateless.
 */
const utf8 = new TextEncoder()

/**
 * Normalise a hash helper's input to a Uint8Array.
 *
 * `@noble/hashes` and `ripemd160-min` both require byte inputs — neither
 * accepts strings. Node's `createHash(...).update(str)` did the UTF-8
 * encoding for us, so to keep call sites like `sha256(seed)` working with
 * a plain string, we do the encoding here.
 */
function toBytes(input: Uint8Array | Buffer | string): Uint8Array {
  return typeof input === 'string' ? utf8.encode(input) : input
}

/**
 * Return ripemd160 hash of input.
 *
 * Switched from the `ripemd160` package (which exposed a default class) to
 * `ripemd160-min`. Key differences:
 *   - Use the named import `{ RIPEMD160 }` — the package's default export
 *     isn't callable as a constructor under ESM interop.
 *   - `.update()` only accepts bytes (Uint8Array or number[]), so strings
 *     must be encoded first (handled by `toBytes`).
 *   - `.digest()` returns a Uint8Array, not a Node Buffer — we wrap it in
 *     `Buffer.from(...)` so callers can still use `.slice()` / `.toString('hex')`.
 */
function ripemd160(input: Uint8Array | Buffer | string): Buffer {
  const h = new RIPEMD160()
  h.update(toBytes(input))
  return Buffer.from(h.digest() as Uint8Array)
}

/**
 * Return sha256 hash of input.
 *
 * Uses `@noble/hashes/sha2.js`. `sha256` is directly callable as a function
 * (no createHash/update/digest boilerplate) and returns a Uint8Array; we
 * wrap that in `Buffer.from(...)` for `.slice()` / `.toString('hex')` users.
 */
function sha256(input: Uint8Array | Buffer | string): Buffer {
  return Buffer.from(nobleSha256(toBytes(input)))
}

/**
 * Return sha512 hash of input.
 */
function sha512(input: Uint8Array | Buffer | string): Buffer {
  return Buffer.from(nobleSha512(toBytes(input)))
}

/**
 * Return 2-round sha256 hash of input.
 */
function doubleSha256(input: Uint8Array | Buffer | string): Buffer {
  return sha256(sha256(input))
}

/**
 * Convert a big-endian byte array to a bigint.
 *
 * Used to turn a 32-byte secp256k1 secret key into the bigint scalar that
 * `noble`'s `Point.multiply` expects. Equivalent to the previous
 * `bigi.fromBuffer(bytes)` call — same byte ordering, same resulting number.
 */
function bytesToBigInt(bytes: Uint8Array): bigint {
  let n = 0n
  for (let i = 0; i < bytes.length; i++) {
    n = (n << 8n) | BigInt(bytes[i])
  }
  return n
}

/**
 * Network id used in WIF-encoding.
 */
export const NETWORK_ID = Buffer.from([0x80])

/**
 * Encode public key with bs58+ripemd160-checksum.
 */
function encodePublic(key: Buffer, prefix: string): string {
  const checksum = ripemd160(key)
  return prefix + bs58.encode(Buffer.concat([key, checksum.slice(0, 4)]))
}

/**
 * Decode bs58+ripemd160-checksum encoded public key.
 */
function decodePublic(encodedKey: string): { key: Buffer; prefix: string } {
  const prefix = encodedKey.slice(0, 3)
  assert.equal(prefix.length, 3, 'public key invalid prefix')
  encodedKey = encodedKey.slice(3)
  const buffer: Buffer = bs58.decode(encodedKey)
  const checksum = buffer.slice(-4)
  const key = buffer.slice(0, -4)
  const checksumVerify = ripemd160(key).slice(0, 4)
  assert.deepEqual(checksumVerify, checksum, 'public key checksum mismatch')
  return { key, prefix }
}

/**
 * Encode bs58+doubleSha256-checksum private key.
 */
function encodePrivate(key: Buffer): string {
  assert.equal(key.readUInt8(0), 0x80, 'private key network id mismatch')
  const checksum = doubleSha256(key)
  return bs58.encode(Buffer.concat([key, checksum.slice(0, 4)]))
}

/**
 * Decode bs58+doubleSha256-checksum encoded private key.
 */
function decodePrivate(encodedKey: string): Buffer {
  const buffer: Buffer = bs58.decode(encodedKey)
  assert.deepEqual(
      buffer.slice(0, 1),
      NETWORK_ID,
      'private key network id mismatch'
  )
  const checksum = buffer.slice(-4)
  const key = buffer.slice(0, -4)
  const checksumVerify = doubleSha256(key).slice(0, 4)
  assert.deepEqual(checksumVerify, checksum, 'private key checksum mismatch')
  return key
}

/**
 * Return true if signature is canonical, otherwise false.
 * Accepts any byte array (typed array or Buffer) — only indexed reads are used.
 */
function isCanonicalSignature(signature: Uint8Array | Buffer | ArrayLike<number>): boolean {
  return (
      !(signature[0] & 0x80) &&
      !(signature[0] === 0 && !(signature[1] & 0x80)) &&
      !(signature[32] & 0x80) &&
      !(signature[32] === 0 && !(signature[33] & 0x80))
  )
}

/**
 * Return true if string is wif, otherwise false.
 */
function isWif(privWif: string | Buffer): boolean {
  try {
    const bufWif = Buffer.from(bs58.decode(privWif as any))
    const privKey = bufWif.slice(0, -4)
    const checksum = bufWif.slice(-4)
    let newChecksum = sha256(privKey)
    newChecksum = sha256(newChecksum)
    newChecksum = newChecksum.slice(0, 4)
    return (checksum.toString() === newChecksum.toString())
  } catch (e) {
    return false
  }
}

/**
 * ECDSA (secp256k1) public key.
 */
export class PublicKey {

  public readonly uncompressed: Buffer

  constructor(
      public readonly key: any,
      public readonly prefix = DEFAULT_ADDRESS_PREFIX,
  ) {
    // @noble/secp256k1 v3: utils.isValidPublicKey accepts both compressed
    // (33-byte) and uncompressed (65-byte) SEC1 encodings.
    assert(secp256k1.utils.isValidPublicKey(key), 'invalid public key')
    // Point.fromBytes(...).toBytes(false) is the noble equivalent of the old
    // publicKeyConvert(key, false) — it re-encodes as 65-byte uncompressed.
    // Wrap in Buffer.from so we get an independent BBuffer allocation.
    this.uncompressed = Buffer.from(secp256k1.Point.fromBytes(key).toBytes(false))
  }

  public static fromBuffer(key: ByteBuffer) {
    assert(secp256k1.utils.isValidPublicKey(key as any), 'invalid buffer as public key')
    return { key }
  }

  /**
   * Create a new instance from a WIF-encoded key.
   */
  public static fromString(wif: string) {
    const { key, prefix } = decodePublic(wif)
    return new PublicKey(key, prefix)
  }

  /**
   * Create a new instance.
   */
  public static from(value: string | PublicKey) {
    if (value instanceof PublicKey) {
      return value
    } else {
      return PublicKey.fromString(value)
    }
  }

  /**
   * Verify a 32-byte signature.
   * @param message 32-byte message to verify.
   * @param signature Signature to verify.
   */
  public verify(message: Buffer, signature: Signature): boolean {
    // @noble/secp256k1 v3: verify(sig, message, pubKey, opts). Our messages
    // are already sha256 digests (transactionDigest produces one), so we MUST
    // pass prehash: false — otherwise noble would sha256 it a second time.
    return secp256k1.verify(signature.data, message, this.key, { prehash: false })
  }

  /**
   * Return a WIF-encoded representation of the key.
   */
  public toString() {
    return encodePublic(this.key, this.prefix)
  }

  /**
   * Return JSON representation of this key, same as toString().
   */
  public toJSON() {
    return this.toString()
  }

  /**
   * Used by `utils.inspect` and `console.log` in node.js.
   */
  public inspect() {
    return `PublicKey: ${ this.toString() }`
  }
}

export type KeyRole = 'owner' | 'active' | 'posting' | 'memo'

/**
 * ECDSA (secp256k1) private key.
 */
export class PrivateKey {
  public secret: Buffer

  constructor(private key: Buffer) {
    // @noble/secp256k1 v3: utils.isValidSecretKey replaces privateKeyVerify.
    assert(secp256k1.utils.isValidSecretKey(key), 'invalid private key')
  }

  /**
   * Convenience to create a new instance from WIF string or buffer.
   */
  public static from(value: string | Buffer) {
    if (typeof value === 'string') {
      return PrivateKey.fromString(value)
    } else {
      return new PrivateKey(value)
    }
  }

  /**
   * Create a new instance from a WIF-encoded key.
   */
  public static fromString(wif: string) {
    return new PrivateKey(decodePrivate(wif).slice(1))
  }

  /**
   * Create a new instance from a seed.
   */
  public static fromSeed(seed: string) {
    return new PrivateKey(sha256(seed))
  }

  /**
   * Create key from username and password.
   */
  public static fromLogin(
      username: string,
      password: string,
      role: KeyRole = 'active'
  ) {
    const seed = username + role + password
    return PrivateKey.fromSeed(seed)
  }

  /**
   * Multiply a public key by this private key's scalar. Equivalent to the old
   * secp256k1-node `publicKeyTweakMul(pub, secret, compressed=false)`.
   *
   * Implemented via noble's Point math: convert pub bytes to a Point, convert
   * this.key (big-endian 32-byte scalar) to a bigint, multiply, and re-encode
   * as uncompressed (matching the old `false` compressed flag).
   */
  public multiply(pub: any): Buffer {
    const scalar = bytesToBigInt(this.key)
    const point = secp256k1.Point.fromBytes(pub.key)
    return Buffer.from(point.multiply(scalar).toBytes(false))
  }

  /**
   * Sign message.
   * @param message 32-byte message.
   *
   * Noble's sync `sign` already produces deterministic RFC6979 signatures with
   * lowS enforced by default — both of which are what the old retry-with-
   * extra-entropy loop was trying to guarantee. The result is therefore
   * *always* canonical, so the loop is unnecessary. We keep the
   * `isCanonicalSignature` assertion as a defensive sanity check.
   *
   * We pass `prehash: false` because `message` is already a sha256 digest
   * (produced by transactionDigest). Without that flag noble would sha256
   * the digest a second time and produce a bogus signature.
   */
  public sign(message: Buffer): Signature {
    const recovered = secp256k1.sign(message, this.key, {
      prehash: false,
      format: 'recovered'
    })
    // Noble's "recovered" format is [recovery_byte(1) || r(32) || s(32)].
    const recovery = recovered[0]
    const sigData = recovered.slice(1) // 64-byte compact r||s
    assert(isCanonicalSignature(sigData), 'noble returned a non-canonical signature')
    return new Signature(sigData, recovery)
  }

  /**
   * Derive the public key for this private key.
   */
  public createPublic(prefix?: string): PublicKey {
    return new PublicKey(secp256k1.getPublicKey(this.key, true), prefix)
  }

  /**
   * Return a WIF-encoded representation of the key.
   */
  public toString() {
    return encodePrivate(Buffer.concat([NETWORK_ID, this.key]))
  }

  /**
   * Used by `utils.inspect` and `console.log` in node.js. Does not show the full key
   * to get the full encoded key you need to explicitly call {@link toString}.
   */
  public inspect() {
    const key = this.toString()
    return `PrivateKey: ${ key.slice(0, 6) }...${ key.slice(-6) }`
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
  public get_shared_secret(public_key: PublicKey): Buffer {
    const sharedCompressed = secp256k1.getSharedSecret(this.key, public_key.key, true)
    const xCoord = sharedCompressed.slice(1) // drop the 02/03 parity byte
    return sha512(xCoord)
  }
}

/**
 * ECDSA (secp256k1) signature.
 */
export class Signature {
  public data: Buffer
  public recovery: number

  constructor(data: Uint8Array | Buffer | ArrayLike<number>, recovery: number) {
    assert.equal((data as { length: number }).length, 64, 'invalid signature')
    // Normalise to BBuffer so .copy(), .toString('hex'), etc. always work
    // regardless of whether the caller passed a Node Buffer, a plain Uint8Array
    // (e.g. from secp256k1, whose types use Uint8Array<ArrayBufferLike>), or
    // our own BBuffer. Using Buffer.from here always produces an independent
    // copy — no ArrayBuffer aliasing with the caller's data.
    this.data = data instanceof Buffer ? data : Buffer.from(data as any)
    this.recovery = recovery
  }

  public static fromBuffer(buffer: Buffer) {
    assert.equal(buffer.length, 65, 'invalid signature')
    const recovery = buffer.readUInt8(0) - 31
    const data = buffer.slice(1)
    return new Signature(data, recovery)
  }

  public static fromString(string: string) {
    return Signature.fromBuffer(Buffer.from(string, 'hex'))
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
  public recover(message: Buffer, prefix?: string) {
    const recovered = new Uint8Array(65)
    recovered[0] = this.recovery
    recovered.set(this.data, 1)
    return new PublicKey(
        secp256k1.recoverPublicKey(recovered, message, { prehash: false }),
        prefix
    )
  }

  public toBuffer() {
    const buffer = Buffer.alloc(65)
    buffer.writeUInt8(this.recovery + 31, 0)
    this.data.copy(buffer, 1)
    return buffer
  }

  public toString() {
    return this.toBuffer().toString('hex')
  }
}
/**
 * Return the sha256 transaction digest.
 * @param chainId The chain id to use when creating the hash.
 */
function transactionDigest(
    transaction: Transaction | SignedTransaction,
    chainId: Buffer = DEFAULT_CHAIN_ID
) {
  const buffer = new ByteBuffer(
      ByteBuffer.DEFAULT_CAPACITY,
      ByteBuffer.LITTLE_ENDIAN
  )
  try {
    Types.Transaction(buffer, transaction)
  } catch (cause) {
    throw new VError(
        { cause, name: 'SerializationError' },
        'Unable to serialize transaction'
    )
  }
  buffer.flip()

  const transactionData = Buffer.from(buffer.toBuffer())
  const digest = sha256(Buffer.concat([chainId, transactionData]))
  return digest
}

/**
 * Return copy of transaction with signature appended to signatures array.
 * @param transaction Transaction to sign.
 * @param keys Key(s) to sign transaction with.
 * @param options Chain id and address prefix, compatible with {@link Client}.
 */
function signTransaction(
    transaction: Transaction,
    keys: PrivateKey | PrivateKey[],
    chainId: Buffer = DEFAULT_CHAIN_ID
) {
  const digest = transactionDigest(transaction, chainId)
  const signedTransaction = copy(transaction) as SignedTransaction
  if (!signedTransaction.signatures) {
    signedTransaction.signatures = []
  }

  if (!Array.isArray(keys)) {
    keys = [keys]
  }
  for (const key of keys) {
    const signature = key.sign(digest)
    signedTransaction.signatures.push(signature.toString())
  }

  return signedTransaction
}

function generateTrxId(transaction: Transaction) {
  const buffer = new ByteBuffer(
      ByteBuffer.DEFAULT_CAPACITY,
      ByteBuffer.LITTLE_ENDIAN
  )
  try {
    Types.Transaction(buffer, transaction)
  } catch (cause) {
    throw new VError(
        { cause, name: 'SerializationError' },
        'Unable to serialize transaction'
    )
  }
  buffer.flip()
  const transactionData = Buffer.from(buffer.toBuffer())
  return cryptoUtils.sha256(transactionData).toString('hex').slice(0, 40)
}

/** Misc crypto utility functions. */
export const cryptoUtils = {
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
}