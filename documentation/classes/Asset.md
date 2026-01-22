[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Asset

# Class: Asset

Defined in: chain/asset.ts:60

Class representing a pixa asset, e.g. `1.000 PIXA` or `12.112233 VESTS`.

## Constructors

### Constructor

> **new Asset**(`amount`, `symbol`): `Asset`

Defined in: chain/asset.ts:61

#### Parameters

##### amount

`number`

##### symbol

[`AssetSymbol`](../type-aliases/AssetSymbol.md)

#### Returns

`Asset`

## Properties

### amount

> `readonly` **amount**: `number`

Defined in: chain/asset.ts:62

***

### symbol

> `readonly` **symbol**: [`AssetSymbol`](../type-aliases/AssetSymbol.md)

Defined in: chain/asset.ts:63

## Methods

### add()

> **add**(`amount`): `Asset`

Defined in: chain/asset.ts:174

Return a new Asset instance with amount added.

#### Parameters

##### amount

`string` | `number` | `Asset`

#### Returns

`Asset`

***

### divide()

> **divide**(`divisor`): `Asset`

Defined in: chain/asset.ts:207

Return a new Asset with the amount divided.

#### Parameters

##### divisor

`string` | `number` | `Asset`

#### Returns

`Asset`

***

### getPrecision()

> **getPrecision**(): `number`

Defined in: chain/asset.ts:135

Return asset precision.

#### Returns

`number`

***

### multiply()

> **multiply**(`factor`): `Asset`

Defined in: chain/asset.ts:195

Return a new Asset with the amount multiplied by factor.

#### Parameters

##### factor

`string` | `number` | `Asset`

#### Returns

`Asset`

***

### steem\_symbols()

> **steem\_symbols**(): `Asset`

Defined in: chain/asset.ts:153

returns a representation of this asset using only STEEM SBD for
legacy purposes

#### Returns

`Asset`

***

### subtract()

> **subtract**(`amount`): `Asset`

Defined in: chain/asset.ts:183

Return a new Asset instance with amount subtracted.

#### Parameters

##### amount

`string` | `number` | `Asset`

#### Returns

`Asset`

***

### toJSON()

> **toJSON**(): `string`

Defined in: chain/asset.ts:219

For JSON serialization, same as toString().

#### Returns

`string`

***

### toString()

> **toString**(): `string`

Defined in: chain/asset.ts:167

Return a string representation of this asset, e.g. `42.000 PIXA`.

#### Returns

`string`

***

### from()

> `static` **from**(`value`, `symbol?`): `Asset`

Defined in: chain/asset.ts:93

Convenience to create new Asset.

#### Parameters

##### value

`string` | `number` | `Asset`

##### symbol?

[`AssetSymbol`](../type-aliases/AssetSymbol.md)

Symbol to use when created from number. Will also be used to validate
              the asset, throws if the passed value has a different symbol than this.

#### Returns

`Asset`

***

### fromString()

> `static` **fromString**(`string`, `expectedSymbol?`): `Asset`

Defined in: chain/asset.ts:69

Create a new Asset instance from a string, e.g. `42.000 PIXA`.

#### Parameters

##### string

`string`

##### expectedSymbol?

[`AssetSymbol`](../type-aliases/AssetSymbol.md)

#### Returns

`Asset`

***

### max()

> `static` **max**(`a`, `b`): `Asset`

Defined in: chain/asset.ts:124

Return the larger of the two assets.

#### Parameters

##### a

`Asset`

##### b

`Asset`

#### Returns

`Asset`

***

### min()

> `static` **min**(`a`, `b`): `Asset`

Defined in: chain/asset.ts:113

Return the smaller of the two assets.

#### Parameters

##### a

`Asset`

##### b

`Asset`

#### Returns

`Asset`
