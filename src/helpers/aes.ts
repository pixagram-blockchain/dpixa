import { cbc } from '@noble/ciphers/aes.js'
import { sha256, sha512 } from '@noble/hashes/sha2.js'
import { randomBytes } from '@noble/hashes/utils.js'
import assert from '../assert'
import { BBuffer as Buffer } from '../bbuffer'
import ByteBuffer, { Long } from '../bytebuffer'
import type { PrivateKey, PublicKey } from '../crypto'

// AES-256-CBC (PKCS#7 padding), SHA-256/512 and the random nonce come from
// @noble/ciphers and @noble/hashes. Previously this file imported Node's
// `crypto` module, which browser bundles replaced with crypto-browserify —
// the single largest part of the old bundle (elliptic, bn.js, asn1.js,
// browserify-sign, des.js, … plus the `buffer` polyfill).

export const encrypt = (
  private_key: PrivateKey,
  public_key: PublicKey,
  message: Buffer,
  nonce = uniqueNonce()
): any => crypt(private_key, public_key, nonce, message)

export const decrypt = (
  private_key: PrivateKey,
  public_key: PublicKey,
  nonce,
  message: any,
  checksum: number
): any => crypt(private_key, public_key, nonce, message, checksum).message

/**
 * @arg {Buffer} message - Encrypted or plain text message (see checksum)
 * @arg {number} checksum - shared secret checksum (null to encrypt, non-null to decrypt)
 */
const crypt = (
  private_key: PrivateKey,
  public_key: PublicKey,
  nonce: string,
  message: Buffer,
  checksum?: number
): {
  nonce: Long
  message: Buffer
  checksum: number
} => {
  const nonceL = toLongObj(nonce)
  const S = private_key.get_shared_secret(public_key)
  let ebuf: any = new ByteBuffer(
    ByteBuffer.DEFAULT_CAPACITY,
    ByteBuffer.LITTLE_ENDIAN
  )
  ebuf.writeUint64(nonceL)
  ebuf.append(S.toString('binary'), 'binary')
  ebuf = Buffer.from(ebuf.copy(0, ebuf.offset).toBinary(), 'binary')
  const encryption_key = Buffer.from(sha512(ebuf))
  const iv = encryption_key.slice(32, 48)
  const tag = encryption_key.slice(0, 32)

  // check if first 64 bit of sha256 hash treated as uint64_t truncated to 32 bits.
  const check = Buffer.from(sha256(encryption_key)).slice(0, 4)
  const cbuf: any = ByteBuffer.fromBinary(
    check.toString('binary'),
    ByteBuffer.DEFAULT_CAPACITY,
    ByteBuffer.LITTLE_ENDIAN
  )
  const check32 = cbuf.readUint32()

  if (checksum) {
    if (check32 !== checksum) {
      throw new Error('Invalid key')
    }
    message = cryptoJsDecrypt(message, tag, iv)
  } else {
    message = cryptoJsEncrypt(message, tag, iv)
  }
  return { nonce: nonceL, message, checksum: check32 }
}

/**
 * This method does not use a checksum, the returned data must be validated some other way.
 * @arg {string|Buffer} ciphertext - binary format
 * @return {Buffer} the decrypted message
 */
export const cryptoJsDecrypt = (message: Buffer, tag, iv): Buffer => {
  assert(message, 'Missing cipher text')
  return Buffer.from(cbc(tag, iv).decrypt(message))
}

/**
 * This method does not use a checksum, the returned data must be validated some other way.
 * @arg {string|Buffer} plaintext - binary format
 * @return {Buffer} binary
 */
export const cryptoJsEncrypt = (message: Buffer, tag, iv): Buffer => {
  assert(message, 'Missing plain text')
  return Buffer.from(cbc(tag, iv).encrypt(message))
}

/** @return {string} unique 64 bit unsigned number string.  Being time based,
 * this is careful to never choose the same nonce twice.  This value could
 * clsbe recorded in the blockchain for a long time.
 */
let unique_nonce_entropy: any = null

const uniqueNonce = (): string => {
  if (unique_nonce_entropy === null) {
    const uint8randomArr = randomBytes(2)
    unique_nonce_entropy = Math.round((uint8randomArr[0] << 8) | uint8randomArr[1])
  }
  let long = Long.fromNumber(Date.now())
  const entropy = ++unique_nonce_entropy % 0xffff
  long = long.shiftLeft(16).or(Long.fromNumber(entropy))
  return long.toString()
}

const toLongObj = (o: any): Long => (o ? (Long.isLong(o) ? o : Long.fromString(o)) : o)
