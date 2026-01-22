[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Memo

# Variable: Memo

> `const` **Memo**: `object`

Defined in: memo.ts:118

## Type Declaration

### decode()

> **decode**: (`private_key`, `memo`) => `string`

Encrypted memo/message decryption

#### Parameters

##### private\_key

Private memo key of recipient

`string` | [`PrivateKey`](../classes/PrivateKey.md)

##### memo

`string`

Encrypted message/memo

#### Returns

`string`

### encode()

> **encode**: (`private_key`, `public_key`, `memo`, `testNonce?`) => `string`

Memo/Any message encoding using AES (aes-cbc algorithm)

#### Parameters

##### private\_key

Private memo key of sender

`string` | [`PrivateKey`](../classes/PrivateKey.md)

##### public\_key

public memo key of recipient

`string` | [`PublicKey`](../classes/PublicKey.md)

##### memo

`string`

message to be encrypted

##### testNonce?

`string`

nonce with high entropy

#### Returns

`string`
