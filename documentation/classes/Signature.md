[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Signature

# Class: Signature

Defined in: crypto.ts:372

ECDSA (secp256k1) signature.

## Constructors

### Constructor

> **new Signature**(`data`, `recovery`): `Signature`

Defined in: crypto.ts:373

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

Defined in: crypto.ts:373

***

### recovery

> **recovery**: `number`

Defined in: crypto.ts:373

## Methods

### recover()

> **recover**(`message`, `prefix?`): [`PublicKey`](PublicKey.md)

Defined in: crypto.ts:392

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

> **toBuffer**(): `any`

Defined in: crypto.ts:399

#### Returns

`any`

***

### toString()

> **toString**(): `any`

Defined in: crypto.ts:406

#### Returns

`any`

***

### fromBuffer()

> `static` **fromBuffer**(`buffer`): `Signature`

Defined in: crypto.ts:377

#### Parameters

##### buffer

`Buffer`

#### Returns

`Signature`

***

### fromString()

> `static` **fromString**(`string`): `Signature`

Defined in: crypto.ts:384

#### Parameters

##### string

`string`

#### Returns

`Signature`
