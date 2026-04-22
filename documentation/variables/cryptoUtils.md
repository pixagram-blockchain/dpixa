[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / cryptoUtils

# Variable: cryptoUtils

> `const` **cryptoUtils**: `object`

Defined in: crypto.ts:472

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

`string` \| `BBuffer`

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

#### Parameters

##### signature

`BBuffer`

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

#### Parameters

##### input

`string` \| `BBuffer`

#### Returns

`BBuffer`

### sha256

> **sha256**: (`input`) => `BBuffer`

Return sha256 hash of input.

#### Parameters

##### input

`string` \| `BBuffer`

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
