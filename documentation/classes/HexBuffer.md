[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / HexBuffer

# Class: HexBuffer

Defined in: chain/misc.ts:50

Buffer wrapper that serializes to a hex-encoded string.

## Constructors

### Constructor

> **new HexBuffer**(`buffer`): `HexBuffer`

Defined in: chain/misc.ts:52

#### Parameters

##### buffer

`any`

#### Returns

`HexBuffer`

## Properties

### buffer

> **buffer**: `any`

Defined in: chain/misc.ts:52

## Methods

### toJSON()

> **toJSON**(): `string`

Defined in: chain/misc.ts:76

#### Returns

`string`

***

### toString()

> **toString**(`encoding?`): `string`

Defined in: chain/misc.ts:71

#### Parameters

##### encoding?

`BufferEncoding` = `'hex'`

#### Returns

`string`

***

### from()

> `static` **from**(`value`): `HexBuffer`

Defined in: chain/misc.ts:57

Convenience to create a new HexBuffer, does not copy data if value passed is already a buffer.

#### Parameters

##### value

`string` \| `number`[] \| `HexBuffer` \| `Buffer`\<`ArrayBufferLike`\>

#### Returns

`HexBuffer`
