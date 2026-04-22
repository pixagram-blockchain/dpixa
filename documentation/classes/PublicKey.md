[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / PublicKey

# Class: PublicKey

Defined in: crypto.ts:175

ECDSA (secp256k1) public key.

## Constructors

### Constructor

> **new PublicKey**(`key`, `prefix?`): `PublicKey`

Defined in: crypto.ts:179

#### Parameters

##### key

`any`

##### prefix?

`string` = `DEFAULT_ADDRESS_PREFIX`

#### Returns

`PublicKey`

## Properties

### key

> `readonly` **key**: `any`

Defined in: crypto.ts:180

***

### prefix

> `readonly` **prefix**: `string` = `DEFAULT_ADDRESS_PREFIX`

Defined in: crypto.ts:181

***

### uncompressed

> `readonly` **uncompressed**: `BBuffer`

Defined in: crypto.ts:177

## Methods

### inspect()

> **inspect**(): `string`

Defined in: crypto.ts:237

Used by `utils.inspect` and `console.log` in node.js.

#### Returns

`string`

***

### toJSON()

> **toJSON**(): `string`

Defined in: crypto.ts:230

Return JSON representation of this key, same as toString().

#### Returns

`string`

***

### toString()

> **toString**(): `string`

Defined in: crypto.ts:223

Return a WIF-encoded representation of the key.

#### Returns

`string`

***

### verify()

> **verify**(`message`, `signature`): `boolean`

Defined in: crypto.ts:216

Verify a 32-byte signature.

#### Parameters

##### message

`BBuffer`

32-byte message to verify.

##### signature

[`Signature`](Signature.md)

Signature to verify.

#### Returns

`boolean`

***

### from()

> `static` **from**(`value`): `PublicKey`

Defined in: crypto.ts:203

Create a new instance.

#### Parameters

##### value

`string` \| `PublicKey`

#### Returns

`PublicKey`

***

### fromBuffer()

> `static` **fromBuffer**(`key`): `object`

Defined in: crypto.ts:187

#### Parameters

##### key

`ByteBuffer`

#### Returns

`object`

##### key

> **key**: `ByteBuffer`

***

### fromString()

> `static` **fromString**(`wif`): `PublicKey`

Defined in: crypto.ts:195

Create a new instance from a WIF-encoded key.

#### Parameters

##### wif

`string`

#### Returns

`PublicKey`
