[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Types

# Variable: Types

> `const` **Types**: `object`

Defined in: chain/serializer.ts:656

## Type Declaration

### Array()

> **Array**: (`itemSerializer`) => (`buffer`, `data`) => `void` = `ArraySerializer`

#### Parameters

##### itemSerializer

[`Serializer`](../type-aliases/Serializer.md)

#### Returns

> (`buffer`, `data`): `void`

##### Parameters

###### buffer

`ByteBuffer`

###### data

`any`[]

##### Returns

`void`

### Asset()

> **Asset**: (`buffer`, `data`) => `void` = `AssetSerializer`

Serialize asset.

#### Parameters

##### buffer

`ByteBuffer`

##### data

`string` | `number` | [`Asset`](../classes/Asset.md)

#### Returns

`void`

#### Note

This looses precision for amounts larger than 2^53-1/10^precision.
      Should not be a problem in real-word usage.

### Authority()

> **Authority**: (`buffer`, `data`) => `void` = `AuthoritySerializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

#### Returns

`void`

### Binary()

> **Binary**: (`size?`) => (`buffer`, `data`) => `void` = `BinarySerializer`

#### Parameters

##### size?

`number`

#### Returns

> (`buffer`, `data`): `void`

##### Parameters

###### buffer

`ByteBuffer`

###### data

`Buffer`\<`ArrayBufferLike`\> | [`HexBuffer`](../classes/HexBuffer.md)

##### Returns

`void`

### Boolean()

> **Boolean**: (`buffer`, `data`) => `void` = `BooleanSerializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`boolean`

#### Returns

`void`

### Date()

> **Date**: (`buffer`, `data`) => `void` = `DateSerializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`string`

#### Returns

`void`

### EncryptedMemo()

> **EncryptedMemo**: (`buffer`, `data`) => `void` = `EncryptedMemoSerializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

#### Returns

`void`

### FlatMap()

> **FlatMap**: (`keySerializer`, `valueSerializer`) => (`buffer`, `data`) => `void` = `FlatMapSerializer`

#### Parameters

##### keySerializer

[`Serializer`](../type-aliases/Serializer.md)

##### valueSerializer

[`Serializer`](../type-aliases/Serializer.md)

#### Returns

> (`buffer`, `data`): `void`

##### Parameters

###### buffer

`ByteBuffer`

###### data

\[`any`, `any`\][]

##### Returns

`void`

### Int16()

> **Int16**: (`buffer`, `data`) => `void` = `Int16Serializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`number`

#### Returns

`void`

### Int32()

> **Int32**: (`buffer`, `data`) => `void` = `Int32Serializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`number`

#### Returns

`void`

### Int64()

> **Int64**: (`buffer`, `data`) => `void` = `Int64Serializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`number`

#### Returns

`void`

### Int8()

> **Int8**: (`buffer`, `data`) => `void` = `Int8Serializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`number`

#### Returns

`void`

### Object()

> **Object**: (`keySerializers`) => (`buffer`, `data`) => `void` = `ObjectSerializer`

#### Parameters

##### keySerializers

\[`string`, [`Serializer`](../type-aliases/Serializer.md)\][]

#### Returns

> (`buffer`, `data`): `void`

##### Parameters

###### buffer

`ByteBuffer`

###### data

##### Returns

`void`

### Operation()

> **Operation**: (`buffer`, `operation`) => `void` = `OperationSerializer`

#### Parameters

##### buffer

`ByteBuffer`

##### operation

[`Operation`](../interfaces/Operation.md)

#### Returns

`void`

### Optional()

> **Optional**: (`valueSerializer`) => (`buffer`, `data`) => `void` = `OptionalSerializer`

#### Parameters

##### valueSerializer

[`Serializer`](../type-aliases/Serializer.md)

#### Returns

> (`buffer`, `data`): `void`

##### Parameters

###### buffer

`ByteBuffer`

###### data

`any`

##### Returns

`void`

### Price()

> **Price**: (`buffer`, `data`) => `void` = `PriceSerializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

#### Returns

`void`

### PublicKey()

> **PublicKey**: (`buffer`, `data`) => `void` = `PublicKeySerializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`string` | [`PublicKey`](../classes/PublicKey.md) | `null`

#### Returns

`void`

### StaticVariant()

> **StaticVariant**: (`itemSerializers`) => (`buffer`, `data`) => `void` = `StaticVariantSerializer`

#### Parameters

##### itemSerializers

[`Serializer`](../type-aliases/Serializer.md)[]

#### Returns

> (`buffer`, `data`): `void`

##### Parameters

###### buffer

`ByteBuffer`

###### data

\[`number`, `any`\]

##### Returns

`void`

### String()

> **String**: (`buffer`, `data`) => `void` = `StringSerializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`string`

#### Returns

`void`

### Transaction()

> **Transaction**: (`buffer`, `data`) => `void` = `TransactionSerializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

#### Returns

`void`

### UInt16()

> **UInt16**: (`buffer`, `data`) => `void` = `UInt16Serializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`number`

#### Returns

`void`

### UInt32()

> **UInt32**: (`buffer`, `data`) => `void` = `UInt32Serializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`number`

#### Returns

`void`

### UInt64()

> **UInt64**: (`buffer`, `data`) => `void` = `UInt64Serializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`number`

#### Returns

`void`

### UInt8()

> **UInt8**: (`buffer`, `data`) => `void` = `UInt8Serializer`

#### Parameters

##### buffer

`ByteBuffer`

##### data

`number`

#### Returns

`void`

### Void()

> **Void**: (`buffer`) => `never` = `VoidSerializer`

#### Parameters

##### buffer

`ByteBuffer`

#### Returns

`never`
