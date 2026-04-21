[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / PrivateKey

# Class: PrivateKey

Defined in: crypto.ts:276

ECDSA (secp256k1) private key.

## Constructors

### Constructor

> **new PrivateKey**(`key`): `PrivateKey`

Defined in: crypto.ts:279

#### Parameters

##### key

`any`

#### Returns

`PrivateKey`

## Properties

### secret

> **secret**: `any`

Defined in: crypto.ts:277

## Methods

### createPublic()

> **createPublic**(`prefix?`): [`PublicKey`](PublicKey.md)

Defined in: crypto.ts:343

Derive the public key for this private key.

#### Parameters

##### prefix?

`string`

#### Returns

[`PublicKey`](PublicKey.md)

***

### get\_shared\_secret()

> **get\_shared\_secret**(`public_key`): `Buffer`

Defined in: crypto.ts:366

Get shared secret for memo cryptography

#### Parameters

##### public\_key

[`PublicKey`](PublicKey.md)

#### Returns

`Buffer`

***

### inspect()

> **inspect**(): `string`

Defined in: crypto.ts:358

Used by `utils.inspect` and `console.log` in node.js. Does not show the full key
to get the full encoded key you need to explicitly call [toString](#tostring).

#### Returns

`string`

***

### multiply()

> **multiply**(`pub`): `Buffer`

Defined in: crypto.ts:320

#### Parameters

##### pub

`any`

#### Returns

`Buffer`

***

### sign()

> **sign**(`message`): [`Signature`](Signature.md)

Defined in: crypto.ts:328

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

Defined in: crypto.ts:350

Return a WIF-encoded representation of the key.

#### Returns

`string`

***

### from()

> `static` **from**(`value`): `PrivateKey`

Defined in: crypto.ts:286

Convenience to create a new instance from WIF string or buffer.

#### Parameters

##### value

`string` \| `Buffer`\<`ArrayBufferLike`\>

#### Returns

`PrivateKey`

***

### fromLogin()

> `static` **fromLogin**(`username`, `password`, `role?`): `PrivateKey`

Defined in: crypto.ts:311

Create key from username and password.

#### Parameters

##### username

`string`

##### password

`string`

##### role?

[`KeyRole`](../type-aliases/KeyRole.md) = `'active'`

#### Returns

`PrivateKey`

***

### fromSeed()

> `static` **fromSeed**(`seed`): `PrivateKey`

Defined in: crypto.ts:304

Create a new instance from a seed.

#### Parameters

##### seed

`string`

#### Returns

`PrivateKey`

***

### fromString()

> `static` **fromString**(`wif`): `PrivateKey`

Defined in: crypto.ts:297

Create a new instance from a WIF-encoded key.

#### Parameters

##### wif

`string`

#### Returns

`PrivateKey`
