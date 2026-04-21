[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / cryptoUtils

# Variable: cryptoUtils

> `const` **cryptoUtils**: `object`

Defined in: crypto.ts:502

Misc crypto utility functions.

## Type Declaration

### decodePrivate

> **decodePrivate**: (`encodedKey`) => `any`

Decode bs58+doubleSha256-checksum encoded private key.

#### Parameters

##### encodedKey

`string`

#### Returns

`any`

### doubleSha256

> **doubleSha256**: (`input`) => `any`

Return 2-round sha256 hash of input.

#### Parameters

##### input

`any`

#### Returns

`any`

### encodePrivate

> **encodePrivate**: (`key`) => `string`

Encode bs58+doubleSha256-checksum private key.

#### Parameters

##### key

`any`

#### Returns

`string`

### encodePublic

> **encodePublic**: (`key`, `prefix`) => `string`

Encode public key with bs58+ripemd160-checksum.

#### Parameters

##### key

`any`

##### prefix

`string`

#### Returns

`string`

### generateTrxId

> **generateTrxId**: (`transaction`) => `any`

#### Parameters

##### transaction

[`Transaction`](../interfaces/Transaction.md)

#### Returns

`any`

### isCanonicalSignature

> **isCanonicalSignature**: (`signature`) => `boolean`

Return true if signature is canonical, otherwise false.

#### Parameters

##### signature

`any`

#### Returns

`boolean`

### isWif

> **isWif**: (`privWif`) => `boolean`

Return true if string is wif, otherwise false.

#### Parameters

##### privWif

`any`

#### Returns

`boolean`

### ripemd160

> **ripemd160**: (`input`) => `any`

Return ripemd160 hash of input.

#### Parameters

##### input

`any`

#### Returns

`any`

### sha256

> **sha256**: (`input`) => `any`

Return sha256 hash of input.

#### Parameters

##### input

`any`

#### Returns

`any`

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

`Buffer` = `DEFAULT_CHAIN_ID`

#### Returns

[`SignedTransaction`](../interfaces/SignedTransaction.md)

### transactionDigest

> **transactionDigest**: (`transaction`, `chainId`) => `any`

Return the sha256 transaction digest.

#### Parameters

##### transaction

[`Transaction`](../interfaces/Transaction.md) \| [`SignedTransaction`](../interfaces/SignedTransaction.md)

##### chainId?

`Buffer` = `DEFAULT_CHAIN_ID`

The chain id to use when creating the hash.

#### Returns

`any`
