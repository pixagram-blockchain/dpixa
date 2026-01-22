[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / AccountUpdate2Operation

# Interface: AccountUpdate2Operation

Defined in: chain/operation.ts:918

Generic operation.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"account_update2"`

Defined in: chain/operation.ts:919

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:920

#### account

> **account**: `string`

#### active?

> `optional` **active**: [`AuthorityType`](AuthorityType.md)

#### extensions

> **extensions**: `any`[]

#### json\_metadata

> **json\_metadata**: `string`

#### memo\_key?

> `optional` **memo\_key**: `string` \| [`PublicKey`](../classes/PublicKey.md)

#### owner?

> `optional` **owner**: [`AuthorityType`](AuthorityType.md)

#### posting?

> `optional` **posting**: [`AuthorityType`](AuthorityType.md)

#### posting\_json\_metadata

> **posting\_json\_metadata**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
