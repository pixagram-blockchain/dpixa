[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / LimitOrderCreateOperation

# Interface: LimitOrderCreateOperation

Defined in: chain/operation.ts:547

This operation creates a limit order and matches it against existing open orders.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"limit_order_create"`

Defined in: chain/operation.ts:548

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:549

#### amount\_to\_sell

> **amount\_to\_sell**: `string` \| [`Asset`](../classes/Asset.md)

#### expiration

> **expiration**: `string`

#### fill\_or\_kill

> **fill\_or\_kill**: `boolean`

#### min\_to\_receive

> **min\_to\_receive**: `string` \| [`Asset`](../classes/Asset.md)

#### orderid

> **orderid**: `number`

#### owner

> **owner**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
