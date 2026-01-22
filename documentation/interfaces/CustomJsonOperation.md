[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / CustomJsonOperation

# Interface: CustomJsonOperation

Defined in: chain/operation.ts:366

Generic operation.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"custom_json"`

Defined in: chain/operation.ts:367

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:368

#### id

> **id**: `string`

ID string, must be less than 32 characters long.

#### json

> **json**: `string`

JSON encoded string, must be valid JSON.

#### required\_auths

> **required\_auths**: `string`[]

#### required\_posting\_auths

> **required\_posting\_auths**: `string`[]

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
