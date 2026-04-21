[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Memo

# Variable: Memo

> `const` **Memo**: `object`

Defined in: memo.ts:119

## Type Declaration

### decode

> **decode**: (`private_key`, `memo`) => `string`

Encrypted memo/message decryption

#### Parameters

##### private\_key

`string` \| [`PrivateKey`](../classes/PrivateKey.md)

Private memo key of recipient

##### memo

`string`

Encrypted message/memo

#### Returns

`string`

### encode

> **encode**: (`private_key`, `public_key`, `memo`, `testNonce?`) => `string`

Memo/Any message encoding using AES (aes-cbc algorithm)

#### Parameters

##### private\_key

`string` \| [`PrivateKey`](../classes/PrivateKey.md)

Private memo key of sender

##### public\_key

`string` \| [`PublicKey`](../classes/PublicKey.md)

public memo key of recipient

##### memo

`string`

message to be encrypted

##### testNonce?

`string`

nonce with high entropy

#### Returns

`string`
