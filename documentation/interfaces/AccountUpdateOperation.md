[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / AccountUpdateOperation

# Interface: AccountUpdateOperation

Defined in: chain/operation.ts:191

Generic operation.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"account_update"`

Defined in: chain/operation.ts:192

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:193

#### account

> **account**: `string`

#### active?

> `optional` **active**: [`AuthorityType`](AuthorityType.md)

#### json\_metadata

> **json\_metadata**: `string`

#### memo\_key

> **memo\_key**: `string` \| [`PublicKey`](../classes/PublicKey.md)

#### owner?

> `optional` **owner**: [`AuthorityType`](AuthorityType.md)

#### posting?

> `optional` **posting**: [`AuthorityType`](AuthorityType.md)

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
