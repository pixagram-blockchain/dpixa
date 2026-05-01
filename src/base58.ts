// base58.ts
// Fast base58 encoder/decoder using the Bitcoin alphabet.
// Uint8Array lookup tables for O(1) char <-> index conversion.
// I/O uses the custom Uint8Array-backed Buffer shim.

import { BBuffer as Buffer } from './bytebuffer'

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

// index (0..57) -> ASCII char code
const ENCODE_TABLE = new Uint8Array(58);
for (let i = 0; i < 58; i++) ENCODE_TABLE[i] = ALPHABET.charCodeAt(i);

// ASCII char code -> index (0..57), or 0xFF if not a valid base58 char
const DECODE_TABLE = new Uint8Array(128).fill(0xff);
for (let i = 0; i < 58; i++) DECODE_TABLE[ALPHABET.charCodeAt(i)] = i;

// Output-size factors: log(256)/log(58) and its inverse.
const ENCODE_FACTOR = 1.365658237309761;
const DECODE_FACTOR = 0.7322476243909465;

const textDecoder = new TextDecoder();

/** Encode a Buffer (or Uint8Array / array-like of bytes) to a base58 string. */
export function encode(source: any): string {
    const len: number = source.length;
    if (len === 0) return "";

    // Each leading zero byte becomes a '1' in output.
    let zeros = 0;
    while (zeros < len && source[zeros] === 0) zeros++;

    const size = ((len - zeros) * ENCODE_FACTOR + 1) | 0;
    const b58 = new Uint8Array(size);
    let length = 0;

    for (let i = zeros; i < len; i++) {
        let carry = source[i] & 0xff;
        let j = 0;
        for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
            carry += 256 * b58[k];
            b58[k] = carry % 58;
            carry = (carry / 58) | 0;
        }
        length = j;
    }

    // Skip internal leading zeros in b58.
    let it = size - length;
    while (it !== size && b58[it] === 0) it++;

    const out = new Uint8Array(zeros + (size - it));
    out.fill(0x31, 0, zeros); // '1' for each leading zero byte
    for (let i = zeros, j = it; j < size; i++, j++) {
        out[i] = ENCODE_TABLE[b58[j]];
    }
    return textDecoder.decode(out);
}

/** Decode a base58 string to a Buffer. Throws on invalid characters. */
export function decode(source: string): any {
    if (source.length === 0) return Buffer.alloc(0);

    // Each leading '1' represents a zero byte.
    let zeros = 0;
    while (zeros < source.length && source.charCodeAt(zeros) === 0x31) zeros++;

    const size = ((source.length - zeros) * DECODE_FACTOR + 1) | 0;
    const b256 = new Uint8Array(size);
    let length = 0;

    for (let i = zeros; i < source.length; i++) {
        const code = source.charCodeAt(i);
        const digit = code < 128 ? DECODE_TABLE[code] : 0xff;
        if (digit === 0xff) {
            throw new Error(`Invalid base58 character "${source[i]}" at position ${i}`);
        }
        let carry = digit;
        let j = 0;
        for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
            carry += 58 * b256[k];
            b256[k] = carry & 0xff;
            carry >>>= 8;
        }
        length = j;
    }

    // Skip internal leading zeros in b256.
    let it = size - length;
    while (it !== size && b256[it] === 0) it++;

    const outLen = zeros + (size - it);
    const out = Buffer.alloc(outLen);
    // Leading zeros already zero from Buffer.alloc.
    for (let i = zeros, j = it; j < size; i++, j++) {
        out[i] = b256[j];
    }
    return out;
}