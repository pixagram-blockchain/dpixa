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

Defined in: chain/misc.ts:71

#### Returns

`string`

***

### toString()

> **toString**(`encoding?`): `string`

Defined in: chain/misc.ts:67

#### Parameters

##### encoding?

`"utf-8"` \| `"hex"` \| `"binary"` \| `"utf8"` \| `"latin1"`

#### Returns

`string`

***

### from()

> `static` **from**(`value`): `HexBuffer`

Defined in: chain/misc.ts:55

Convenience to create a new HexBuffer, does not copy data if value passed is already a buffer.

#### Parameters

##### value

`string` \| `number`[] \| `BBuffer` \| `HexBuffer`

#### Returns

`HexBuffer`
