[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / CustomBinaryOperation

# Interface: CustomBinaryOperation

Defined in: chain/operation.ts:351

Generic operation.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"custom_binary"`

Defined in: chain/operation.ts:352

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:353

#### data

> **data**: `number`[] \| `Buffer`\<`ArrayBufferLike`\> \| [`HexBuffer`](../classes/HexBuffer.md)

#### id

> **id**: `string`

ID string, must be less than 32 characters long.

#### required\_active\_auths

> **required\_active\_auths**: `string`[]

#### required\_auths

> **required\_auths**: [`AuthorityType`](AuthorityType.md)[]

#### required\_owner\_auths

> **required\_owner\_auths**: `string`[]

#### required\_posting\_auths

> **required\_posting\_auths**: `string`[]

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
