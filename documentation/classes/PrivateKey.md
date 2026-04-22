[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / PrivateKey

# Class: PrivateKey

Defined in: crypto.ts:247

ECDSA (secp256k1) private key.

## Constructors

### Constructor

> **new PrivateKey**(`key`): `PrivateKey`

Defined in: crypto.ts:250

#### Parameters

##### key

`BBuffer`

#### Returns

`PrivateKey`

## Properties

### secret

> **secret**: `BBuffer`

Defined in: crypto.ts:248

## Methods

### createPublic()

> **createPublic**(`prefix?`): [`PublicKey`](PublicKey.md)

Defined in: crypto.ts:314

Derive the public key for this private key.

#### Parameters

##### prefix?

`string`

#### Returns

[`PublicKey`](PublicKey.md)

***

### get\_shared\_secret()

> **get\_shared\_secret**(`public_key`): `BBuffer`

Defined in: crypto.ts:337

Get shared secret for memo cryptography

#### Parameters

##### public\_key

[`PublicKey`](PublicKey.md)

#### Returns

`BBuffer`

***

### inspect()

> **inspect**(): `string`

Defined in: crypto.ts:329

Used by `utils.inspect` and `console.log` in node.js. Does not show the full key
to get the full encoded key you need to explicitly call [toString](#tostring).

#### Returns

`string`

***

### multiply()

> **multiply**(`pub`): `BBuffer`

Defined in: crypto.ts:291

#### Parameters

##### pub

`any`

#### Returns

`BBuffer`

***

### sign()

> **sign**(`message`): [`Signature`](Signature.md)

Defined in: crypto.ts:299

Sign message.

#### Parameters

##### message

`BBuffer`

32-byte message.

#### Returns

[`Signature`](Signature.md)

***

### toString()

> **toString**(): `string`

Defined in: crypto.ts:321

Return a WIF-encoded representation of the key.

#### Returns

`string`

***

### from()

> `static` **from**(`value`): `PrivateKey`

Defined in: crypto.ts:257

Convenience to create a new instance from WIF string or buffer.

#### Parameters

##### value

`string` \| `BBuffer`

#### Returns

`PrivateKey`

***

### fromLogin()

> `static` **fromLogin**(`username`, `password`, `role?`): `PrivateKey`

Defined in: crypto.ts:282

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

Defined in: crypto.ts:275

Create a new instance from a seed.

#### Parameters

##### seed

`string`

#### Returns

`PrivateKey`

***

### fromString()

> `static` **fromString**(`wif`): `PrivateKey`

Defined in: crypto.ts:268

Create a new instance from a WIF-encoded key.

#### Parameters

##### wif

`string`

#### Returns

`PrivateKey`
