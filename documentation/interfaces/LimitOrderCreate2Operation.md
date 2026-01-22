[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / LimitOrderCreate2Operation

# Interface: LimitOrderCreate2Operation

Defined in: chain/operation.ts:563

This operation is identical to limit_order_create except it serializes the price rather
than calculating it from other fields.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"limit_order_create2"`

Defined in: chain/operation.ts:564

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:565

#### amount\_to\_sell

> **amount\_to\_sell**: `string` \| [`Asset`](../classes/Asset.md)

#### exchange\_rate

> **exchange\_rate**: [`PriceType`](../type-aliases/PriceType.md)

#### expiration

> **expiration**: `string`

#### fill\_or\_kill

> **fill\_or\_kill**: `boolean`

#### orderid

> **orderid**: `number`

#### owner

> **owner**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
