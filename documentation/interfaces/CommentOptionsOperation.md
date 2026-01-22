[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / CommentOptionsOperation

# Interface: CommentOptionsOperation

Defined in: chain/operation.ts:299

Generic operation.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"comment_options"`

Defined in: chain/operation.ts:300

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:301

#### allow\_curation\_rewards

> **allow\_curation\_rewards**: `boolean`

Whether to allow post to recieve curation rewards.

#### allow\_votes

> **allow\_votes**: `boolean`

Whether to allow post to receive votes.

#### author

> **author**: `string`

#### extensions

> **extensions**: \[`0`, \{ `beneficiaries`: [`BeneficiaryRoute`](BeneficiaryRoute.md)[]; \}\][]

#### max\_accepted\_payout

> **max\_accepted\_payout**: `string` \| [`Asset`](../classes/Asset.md)

PXS value of the maximum payout this post will receive.

#### percent\_pxs

> **percent\_pxs**: `number`

The percent of Pixa Dollars to key, unkept amounts will be received as Pixa Power.

#### permlink

> **permlink**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
