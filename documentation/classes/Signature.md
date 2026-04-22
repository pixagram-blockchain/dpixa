[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Signature

# Class: Signature

Defined in: crypto.ts:352

ECDSA (secp256k1) signature.

## Constructors

### Constructor

> **new Signature**(`data`, `recovery`): `Signature`

Defined in: crypto.ts:356

#### Parameters

##### data

`Uint8Array`\<`ArrayBufferLike`\> \| `BBuffer`

##### recovery

`number`

#### Returns

`Signature`

## Properties

### data

> **data**: `BBuffer`

Defined in: crypto.ts:353

***

### recovery

> **recovery**: `number`

Defined in: crypto.ts:354

## Methods

### recover()

> **recover**(`message`, `prefix?`): [`PublicKey`](PublicKey.md)

Defined in: crypto.ts:380

Recover public key from signature by providing original signed message.

#### Parameters

##### message

`BBuffer`

32-byte message that was used to create the signature.

##### prefix?

`string`

#### Returns

[`PublicKey`](PublicKey.md)

***

### toBuffer()

> **toBuffer**(): `BBuffer`

Defined in: crypto.ts:387

#### Returns

`BBuffer`

***

### toString()

> **toString**(): `string`

Defined in: crypto.ts:394

#### Returns

`string`

***

### fromBuffer()

> `static` **fromBuffer**(`buffer`): `Signature`

Defined in: crypto.ts:365

#### Parameters

##### buffer

`BBuffer`

#### Returns

`Signature`

***

### fromString()

> `static` **fromString**(`string`): `Signature`

Defined in: crypto.ts:372

#### Parameters

##### string

`string`

#### Returns

`Signature`
