[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / PrivateKey

# Class: PrivateKey

Defined in: crypto.ts:303

ECDSA (secp256k1) private key.

## Constructors

### Constructor

> **new PrivateKey**(`key`): `PrivateKey`

Defined in: crypto.ts:306

#### Parameters

##### key

`BBuffer`

#### Returns

`PrivateKey`

## Properties

### secret

> **secret**: `BBuffer`

Defined in: crypto.ts:304

## Methods

### createPublic()

> **createPublic**(`prefix?`): [`PublicKey`](PublicKey.md)

Defined in: crypto.ts:409

Derive the public key for this private key.

#### Parameters

##### prefix?

`string`

#### Returns

[`PublicKey`](PublicKey.md)

***

### get\_shared\_secret()

> **get\_shared\_secret**(`public_key`): `BBuffer`

Defined in: crypto.ts:440

Get shared secret for memo cryptography.

The Hive/Pixa memo protocol is: multiply peer's pubkey point by our
private scalar, take the 32-byte x-coordinate, sha512 it. `getSharedSecret`
returns the compressed-encoded shared point (33 bytes: parity byte + x);
slicing off byte 0 gives us exactly the x-coordinate the protocol wants.

This replaces the previous bigi + ecurve point multiplication. Verified
that both paths produce byte-for-byte identical output.

#### Parameters

##### public\_key

[`PublicKey`](PublicKey.md)

#### Returns

`BBuffer`

***

### inspect()

> **inspect**(): `string`

Defined in: crypto.ts:424

Used by `utils.inspect` and `console.log` in node.js. Does not show the full key
to get the full encoded key you need to explicitly call [toString](#tostring).

#### Returns

`string`

***

### multiply()

> **multiply**(`pub`): `BBuffer`

Defined in: crypto.ts:356

Multiply a public key by this private key's scalar. Equivalent to the old
secp256k1-node `publicKeyTweakMul(pub, secret, compressed=false)`.

Implemented via noble's Point math: convert pub bytes to a Point, convert
this.key (big-endian 32-byte scalar) to a bigint, multiply, and re-encode
as uncompressed (matching the old `false` compressed flag).

#### Parameters

##### pub

`any`

#### Returns

`BBuffer`

***

### sign()

> **sign**(`message`): [`Signature`](Signature.md)

Defined in: crypto.ts:381

Sign message.

#### Parameters

##### message

`BBuffer`

32-byte message (typically a sha256 digest).

Noble's sync `sign` is deterministic RFC6979 with `lowS` enforced, BUT
"lowS" only constrains `s <= n/2`. The Hive/Pixa wire format additionally
requires both `r` and `s` to have their high byte bit clear (see
`isCanonicalSignature`) — a stricter predicate than lowS. Roughly a
quarter of RFC6979 signatures fail it, so we reproduce the original
secp256k1-node retry loop: perturb the RFC6979 nonce via `extraEntropy`
until the resulting signature passes `isCanonicalSignature`.

Important: `extraEntropy` only mixes into nonce derivation — it does NOT
change the message being signed. The returned signature still verifies
(and recovers) against the original `message`.

`prehash: false` because `message` is already a digest; noble would
otherwise sha256 it a second time.

#### Returns

[`Signature`](Signature.md)

***

### toString()

> **toString**(): `string`

Defined in: crypto.ts:416

Return a WIF-encoded representation of the key.

#### Returns

`string`

***

### from()

> `static` **from**(`value`): `PrivateKey`

Defined in: crypto.ts:314

Convenience to create a new instance from WIF string or buffer.

#### Parameters

##### value

`string` \| `BBuffer`

#### Returns

`PrivateKey`

***

### fromLogin()

> `static` **fromLogin**(`username`, `password`, `role?`): `PrivateKey`

Defined in: crypto.ts:339

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

Defined in: crypto.ts:332

Create a new instance from a seed.

#### Parameters

##### seed

`string`

#### Returns

`PrivateKey`

***

### fromString()

> `static` **fromString**(`wif`): `PrivateKey`

Defined in: crypto.ts:325

Create a new instance from a WIF-encoded key.

#### Parameters

##### wif

`string`

#### Returns

`PrivateKey`
