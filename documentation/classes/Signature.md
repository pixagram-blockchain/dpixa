[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Signature

# Class: Signature

Defined in: crypto.ts:354

ECDSA (secp256k1) signature.

## Constructors

### Constructor

> **new Signature**(`data`, `recovery`): `Signature`

Defined in: crypto.ts:355

#### Parameters

##### data

`Buffer`

##### recovery

`number`

#### Returns

`Signature`

## Properties

### data

> **data**: `Buffer`

Defined in: crypto.ts:355

***

### recovery

> **recovery**: `number`

Defined in: crypto.ts:355

## Methods

### recover()

> **recover**(`message`, `prefix?`): [`PublicKey`](PublicKey.md)

Defined in: crypto.ts:374

Recover public key from signature by providing original signed message.

#### Parameters

##### message

`Buffer`

32-byte message that was used to create the signature.

##### prefix?

`string`

#### Returns

[`PublicKey`](PublicKey.md)

***

### toBuffer()

> **toBuffer**(): `Buffer`\<`ArrayBuffer`\>

Defined in: crypto.ts:381

#### Returns

`Buffer`\<`ArrayBuffer`\>

***

### toString()

> **toString**(): `string`

Defined in: crypto.ts:388

#### Returns

`string`

***

### fromBuffer()

> `static` **fromBuffer**(`buffer`): `Signature`

Defined in: crypto.ts:359

#### Parameters

##### buffer

`Buffer`

#### Returns

`Signature`

***

### fromString()

> `static` **fromString**(`string`): `Signature`

Defined in: crypto.ts:366

#### Parameters

##### string

`string`

#### Returns

`Signature`
