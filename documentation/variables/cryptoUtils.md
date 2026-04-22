[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / cryptoUtils

# Variable: cryptoUtils

> `const` **cryptoUtils**: `object`

Defined in: crypto.ts:583

Misc crypto utility functions.

## Type Declaration

### decodePrivate

> **decodePrivate**: (`encodedKey`) => `BBuffer`

Decode bs58+doubleSha256-checksum encoded private key.

#### Parameters

##### encodedKey

`string`

#### Returns

`BBuffer`

### doubleSha256

> **doubleSha256**: (`input`) => `BBuffer`

Return 2-round sha256 hash of input.

#### Parameters

##### input

`string` \| `Uint8Array`\<`ArrayBufferLike`\> \| `BBuffer`

#### Returns

`BBuffer`

### encodePrivate

> **encodePrivate**: (`key`) => `string`

Encode bs58+doubleSha256-checksum private key.

#### Parameters

##### key

`BBuffer`

#### Returns

`string`

### encodePublic

> **encodePublic**: (`key`, `prefix`) => `string`

Encode public key with bs58+ripemd160-checksum.

#### Parameters

##### key

`BBuffer`

##### prefix

`string`

#### Returns

`string`

### generateTrxId

> **generateTrxId**: (`transaction`) => `string`

#### Parameters

##### transaction

[`Transaction`](../interfaces/Transaction.md)

#### Returns

`string`

### isCanonicalSignature

> **isCanonicalSignature**: (`signature`) => `boolean`

Return true if signature is canonical, otherwise false.
Accepts any byte array (typed array or Buffer) — only indexed reads are used.

#### Parameters

##### signature

`ArrayLike`\<`number`\> \| `Uint8Array`\<`ArrayBufferLike`\> \| `BBuffer`

#### Returns

`boolean`

### isWif

> **isWif**: (`privWif`) => `boolean`

Return true if string is wif, otherwise false.

#### Parameters

##### privWif

`string` \| `BBuffer`

#### Returns

`boolean`

### ripemd160

> **ripemd160**: (`input`) => `BBuffer`

Return ripemd160 hash of input.

Switched from the `ripemd160` package (which exposed a default class) to
`ripemd160-min`. Key differences:
  - Use the named import `{ RIPEMD160 }` — the package's default export
    isn't callable as a constructor under ESM interop.
  - `.update()` only accepts bytes (Uint8Array or number[]), so strings
    must be encoded first (handled by `toBytes`).
  - `.digest()` returns a Uint8Array, not a Node Buffer — we wrap it in
    `Buffer.from(...)` so callers can still use `.slice()` / `.toString('hex')`.

#### Parameters

##### input

`string` \| `Uint8Array`\<`ArrayBufferLike`\> \| `BBuffer`

#### Returns

`BBuffer`

### sha256

> **sha256**: (`input`) => `BBuffer`

Return sha256 hash of input.

Uses `@noble/hashes/sha2.js`. `sha256` is directly callable as a function
(no createHash/update/digest boilerplate) and returns a Uint8Array; we
wrap that in `Buffer.from(...)` for `.slice()` / `.toString('hex')` users.

#### Parameters

##### input

`string` \| `Uint8Array`\<`ArrayBufferLike`\> \| `BBuffer`

#### Returns

`BBuffer`

### signTransaction

> **signTransaction**: (`transaction`, `keys`, `chainId`) => [`SignedTransaction`](../interfaces/SignedTransaction.md)

Return copy of transaction with signature appended to signatures array.

#### Parameters

##### transaction

[`Transaction`](../interfaces/Transaction.md)

Transaction to sign.

##### keys

[`PrivateKey`](../classes/PrivateKey.md) \| [`PrivateKey`](../classes/PrivateKey.md)[]

Key(s) to sign transaction with.

##### chainId?

`BBuffer` = `DEFAULT_CHAIN_ID`

#### Returns

[`SignedTransaction`](../interfaces/SignedTransaction.md)

### transactionDigest

> **transactionDigest**: (`transaction`, `chainId`) => `BBuffer`

Return the sha256 transaction digest.

#### Parameters

##### transaction

[`Transaction`](../interfaces/Transaction.md) \| [`SignedTransaction`](../interfaces/SignedTransaction.md)

##### chainId?

`BBuffer` = `DEFAULT_CHAIN_ID`

The chain id to use when creating the hash.

#### Returns

`BBuffer`
