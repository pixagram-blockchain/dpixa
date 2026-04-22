[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Signature

# Class: Signature

Defined in: crypto.ts:432

ECDSA (secp256k1) signature.

## Constructors

### Constructor

> **new Signature**(`data`, `recovery`): `Signature`

Defined in: crypto.ts:436

#### Parameters

##### data

`ArrayLike`\<`number`\> \| `Uint8Array`\<`ArrayBufferLike`\> \| `BBuffer`

##### recovery

`number`

#### Returns

`Signature`

## Properties

### data

> **data**: `BBuffer`

Defined in: crypto.ts:433

***

### recovery

> **recovery**: `number`

Defined in: crypto.ts:434

## Methods

### recover()

> **recover**(`message`, `prefix?`): [`PublicKey`](PublicKey.md)

Defined in: crypto.ts:470

Recover public key from signature by providing original signed message.

#### Parameters

##### message

`BBuffer`

32-byte message that was used to create the signature.

`@noble/secp256k1` v3's `recoverPublicKey` takes the "recovered" format:
a 65-byte Uint8Array laid out as [recovery_byte(1) || r(32) || s(32)].
Note that's *recovery first*, unlike our internal wire format
(`toBuffer` below) which puts `recovery + 31` first then the 64-byte
compact sig. Same shape, different byte values — we just rebuild it.

`prehash: false` because the message is already a sha256 digest.

##### prefix?

`string`

#### Returns

[`PublicKey`](PublicKey.md)

***

### toBuffer()

> **toBuffer**(): `BBuffer`

Defined in: crypto.ts:480

#### Returns

`BBuffer`

***

### toString()

> **toString**(): `string`

Defined in: crypto.ts:487

#### Returns

`string`

***

### fromBuffer()

> `static` **fromBuffer**(`buffer`): `Signature`

Defined in: crypto.ts:447

#### Parameters

##### buffer

`BBuffer`

#### Returns

`Signature`

***

### fromString()

> `static` **fromString**(`string`): `Signature`

Defined in: crypto.ts:454

#### Parameters

##### string

`string`

#### Returns

`Signature`
