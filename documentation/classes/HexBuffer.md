[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / HexBuffer

# Class: HexBuffer

Defined in: chain/misc.ts:49

Buffer wrapper that serializes to a hex-encoded string.

## Constructors

### Constructor

> **new HexBuffer**(`buffer`): `HexBuffer`

Defined in: chain/misc.ts:51

#### Parameters

##### buffer

`Buffer`

#### Returns

`HexBuffer`

## Properties

### buffer

> **buffer**: `Buffer`

Defined in: chain/misc.ts:51

## Methods

### toJSON()

> **toJSON**(): `string`

Defined in: chain/misc.ts:75

#### Returns

`string`

***

### toString()

> **toString**(`encoding`): `string`

Defined in: chain/misc.ts:70

#### Parameters

##### encoding

`BufferEncoding` = `'hex'`

#### Returns

`string`

***

### from()

> `static` **from**(`value`): `HexBuffer`

Defined in: chain/misc.ts:56

Convenience to create a new HexBuffer, does not copy data if value passed is already a buffer.

#### Parameters

##### value

`string` | `number`[] | `Buffer`\<`ArrayBufferLike`\> | `HexBuffer`

#### Returns

`HexBuffer`
