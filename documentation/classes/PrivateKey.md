[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / PrivateKey

# Class: PrivateKey

Defined in: crypto.ts:249

ECDSA (secp256k1) private key.

## Constructors

### Constructor

> **new PrivateKey**(`key`): `PrivateKey`

Defined in: crypto.ts:252

#### Parameters

##### key

`Buffer`

#### Returns

`PrivateKey`

## Properties

### secret

> **secret**: `Buffer`

Defined in: crypto.ts:250

## Methods

### createPublic()

> **createPublic**(`prefix?`): [`PublicKey`](PublicKey.md)

Defined in: crypto.ts:316

Derive the public key for this private key.

#### Parameters

##### prefix?

`string`

#### Returns

[`PublicKey`](PublicKey.md)

***

### get\_shared\_secret()

> **get\_shared\_secret**(`public_key`): `Buffer`

Defined in: crypto.ts:339

Get shared secret for memo cryptography

#### Parameters

##### public\_key

[`PublicKey`](PublicKey.md)

#### Returns

`Buffer`

***

### inspect()

> **inspect**(): `string`

Defined in: crypto.ts:331

Used by `utils.inspect` and `console.log` in node.js. Does not show the full key
to get the full encoded key you need to explicitly call [toString](#tostring).

#### Returns

`string`

***

### multiply()

> **multiply**(`pub`): `Buffer`

Defined in: crypto.ts:293

#### Parameters

##### pub

`any`

#### Returns

`Buffer`

***

### sign()

> **sign**(`message`): [`Signature`](Signature.md)

Defined in: crypto.ts:301

Sign message.

#### Parameters

##### message

`Buffer`

32-byte message.

#### Returns

[`Signature`](Signature.md)

***

### toString()

> **toString**(): `string`

Defined in: crypto.ts:323

Return a WIF-encoded representation of the key.

#### Returns

`string`

***

### from()

> `static` **from**(`value`): `PrivateKey`

Defined in: crypto.ts:259

Convenience to create a new instance from WIF string or buffer.

#### Parameters

##### value

`string` | `Buffer`\<`ArrayBufferLike`\>

#### Returns

`PrivateKey`

***

### fromLogin()

> `static` **fromLogin**(`username`, `password`, `role`): `PrivateKey`

Defined in: crypto.ts:284

Create key from username and password.

#### Parameters

##### username

`string`

##### password

`string`

##### role

[`KeyRole`](../type-aliases/KeyRole.md) = `'active'`

#### Returns

`PrivateKey`

***

### fromSeed()

> `static` **fromSeed**(`seed`): `PrivateKey`

Defined in: crypto.ts:277

Create a new instance from a seed.

#### Parameters

##### seed

`string`

#### Returns

`PrivateKey`

***

### fromString()

> `static` **fromString**(`wif`): `PrivateKey`

Defined in: crypto.ts:270

Create a new instance from a WIF-encoded key.

#### Parameters

##### wif

`string`

#### Returns

`PrivateKey`
