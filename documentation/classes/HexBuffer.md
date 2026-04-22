[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / HexBuffer

# Class: HexBuffer

Defined in: chain/misc.ts:49

Buffer wrapper that serializes to a hex-encoded string.

## Constructors

### Constructor

> **new HexBuffer**(`buffer`): `HexBuffer`

Defined in: chain/misc.ts:50

#### Parameters

##### buffer

`any`

#### Returns

`HexBuffer`

## Properties

### buffer

> **buffer**: `any`

Defined in: chain/misc.ts:50

## Methods

### toJSON()

> **toJSON**(): `string`

Defined in: chain/misc.ts:79

#### Returns

`string`

***

### toString()

> **toString**(`encoding?`): `string`

Defined in: chain/misc.ts:75

#### Parameters

##### encoding?

`"utf-8"` \| `"hex"` \| `"binary"` \| `"utf8"` \| `"latin1"`

#### Returns

`string`

***

### from()

> `static` **from**(`value`): `HexBuffer`

Defined in: chain/misc.ts:61

Convenience to create a new HexBuffer, does not copy data if value passed is already a buffer.

Accepts any Uint8Array-backed buffer, which includes the bundled BBuffer,
Node's native Buffer, and plain Uint8Array. Previously the parameter was
typed as just `Buffer` (= BBuffer in this file) which rejected Node
Buffers even though they work identically at runtime — broke the
operations test suite under strict TS.

#### Parameters

##### value

`string` \| `number`[] \| `Uint8Array`\<`ArrayBufferLike`\> \| `HexBuffer`

#### Returns

`HexBuffer`
